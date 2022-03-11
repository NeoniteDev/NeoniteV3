import Router from "express-promise-router";
import errors, { ApiError } from "../structs/errors";
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as express from "express";
import verifyAuthorization, { reqWithAuth, reqWithAuthMulti, validateToken } from "../middlewares/authorization";
import validateMethod from "../middlewares/Method";
import { Credentials } from "../structs/types";
import tokens from "../database/tokenController";
import { exchanges } from "../database/exchangesController";
import users from "../database/usersController";
import refresh_tokens from "../database/refreshController";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from "http-errors";
import userAgentParse from "../middlewares/useragent";

const app = Router();

const jwtSecret = process.env.JWT_SECRECT;

if (!jwtSecret) {
    throw new Error('Missing jwt secret key');
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * @typedef {import('./../structs/types').Credentials} Credentials
 * @typedef {import('./../structs/types').oauth_Response} Oauth_Response
 * @typedef {import('./../structs/types').tokenInfo} JwtBase
 */

app.post('/api/oauth/token', async (req, res, next) => {
    if (!req.is('application/x-www-form-urlencoded')) {
        throw errors.neoniteDev.internal.unsupportedMediaType;
    }

    if (!req.headers.authorization || !req.headers.authorization.toLowerCase().startsWith('basic ')) {
        throw errors.neoniteDev.authentication.invalidHeader;
    }

    const Authorization = req.headers.authorization.replace(/basic /i, '');

    try {
        const arr = Buffer.from(Authorization, 'base64').toString().split(':');

        var credentials = {
            username: arr[0],
            password: arr[1]
        }
    } catch {
        throw errors.neoniteDev.authentication.oauth.invalidClient;
    }

    if (credentials.username.length != 32) {
        throw errors.neoniteDev.authentication.oauth.invalidClient;
    }

    var grant_type = req.body.grant_type;

    /**
     * @type {import('../database/mysqlManager').User}
     */
    var user = undefined;

    switch (grant_type) {
        case 'client_credentials':
            {
                const token = crypto.randomUUID().replace(/-/g, '');
                const expires = new Date().addHours(4);
                const expiteIn = expires.getTime() - Date.now();
                const expireInSec = Math.floor(expiteIn / 1000);

                const jwtToken = jwt.sign(
                    {
                        'mver': false,
                        'clid': credentials.username,
                        'am': grant_type,
                        'sia': '4e656f6e697465',
                        'clsvc': 'fortnite',
                        'ic': true,
                        't': 's',
                    },
                    jwtSecret,
                    {
                        jwtid: token,
                        expiresIn: expireInSec,
                    }
                );

                await tokens.add(
                    {
                        auth_method: grant_type,
                        clientId: credentials.username,
                        client_service: 'fortnite',
                        expireAt: expires.getTime(),
                        internal: true,
                        token: token,
                    }
                );

                res.json(
                    {
                        access_token: 'eg1~' + jwtToken,
                        expires_in: expireInSec,
                        expires_at: expires,
                        token_type: 'bearer',
                        client_id: credentials.username,
                        internal_client: true,
                        client_service: 'fortnite'
                    }
                )

                return;
            }

        case 'exchange_code':
            {
                if (!req.body.exchange_code) {
                    throw errors.neoniteDev.authentication.invalidRequest.withMessage('exchange_code is required.')
                }

                const code = await exchanges.get(req.body.exchange_code);

                if (!code) {
                    throw errors.neoniteDev.authentication.oauth.invalidExchange;
                };

                var userPromise = users.getById(code.accountId);
                var originatingSessionPromise = tokens.get(code.sessionId, false);

                var originatingSession = await originatingSessionPromise;

                if (!originatingSession) {
                    throw errors.neoniteDev.authentication.oauth.expiredExchangeCodeSession;
                }

                user = await userPromise;

                exchanges.remove(req.body.exchange_code);

                if (!user) {
                    throw errors.neoniteDev.authentication.oauth.invalidExchange;
                }

                break;
            }

        case 'password':
            {
                if ('username' in req.body == false) {
                    throw errors.neoniteDev.authentication.invalidRequest.withMessage('username is required.')
                }

                if ('password' in req.body == false) {
                    throw errors.neoniteDev.authentication.invalidRequest.withMessage('password is required.')
                }

                var hash_password = crypto.createHash("sha256").update(req.body.password).digest("hex")

                user = await users.getByEmail(req.body.username.toLowerCase());


                if (!user || user.password !== hash_password) {
                    throw errors.neoniteDev.authentication.oauth.invalidGrant;
                }

                break;
            }

        case 'refresh_token':
            {
                if ('refresh_token' in req.body == false) {
                    throw errors.neoniteDev.authentication.invalidRequest.withMessage('refresh_token is required.')
                }

                /** @type {string} */
                const refresh = req.body.refresh_token;

                if (refresh.startsWith('eg1~')) {
                    try {
                        var decoded = jwt.verify(req.body.refresh_token.slice(4), jwtSecret);
                    } catch { throw errors.neoniteDev.authentication.oauth.invalidRefresh; }

                    if (typeof decoded != 'object' || !decoded.jti) {
                        throw errors.neoniteDev.authentication.oauth.invalidRefresh;
                    }

                    var infos = await refresh_tokens.get(decoded.jti);

                    if (!infos) {
                        throw errors.neoniteDev.authentication.oauth.invalidRefresh;
                    }
                } else if (refresh.length == 32) {
                    var infos = await refresh_tokens.get(refresh);

                    if (!infos) {
                        throw errors.neoniteDev.authentication.oauth.invalidRefresh;
                    }
                } else {
                    throw errors.neoniteDev.authentication.oauth.invalidRefresh;
                }

                if (infos.clientId != credentials.username) {
                    throw errors.neoniteDev.authentication.invalidHeader.withMessage(`invalid client ${credentials.username}`);
                }

                refresh_tokens.remove(infos.token);
                tokens.remove(infos.bearer_token);

                user = await users.getById(infos.account_id)

                if (!user) {
                    throw errors.neoniteDev.authentication.oauth.invalidRefresh;
                }

                break;
            }

        default:
            {
                throw errors.neoniteDev.authentication.oauth.grantNotImplemented.with(grant_type);
            }
    }

    var numTokens = await tokens.getUserTokensCount(user.accountId);

    if (numTokens >= 75) {
        throw errors.neoniteDev.authentication.oauth.tooManySessions;
    }

    var access_token = crypto.randomUUID().replace(/-/g, '');
    var refresh_token = crypto.randomUUID().replace(/-/g, '');

    const tokenExpires = new Date().addHours(8);
    const refreshExpires = new Date().addHours(24);

    const expireIn = tokenExpires.getTime() - Date.now();
    const refreshExpireIn = refreshExpires.getTime() - Date.now();


    const tokenAdd = tokens.add(
        {
            auth_method: grant_type,
            clientId: credentials.username,
            client_service: 'fortnite',
            expireAt: tokenExpires.getTime(),
            internal: true,
            token: access_token,
            account_id: user.accountId,
            displayName: user.displayName,
            in_app_id: user.accountId,
            refresh_token: refresh_token
        }
    );

    const refreshAdd = refresh_tokens.add(
        {
            auth_method: grant_type,
            clientId: credentials.username,
            client_service: 'fortnite',
            expireAt: refreshExpires.getTime(),
            internal: true,
            token: refresh_token,
            account_id: user.accountId,
            displayName: user.displayName,
            in_app_id: user.accountId,
            bearer_token: access_token
        }
    );

    if (!(await tokenAdd) || !(await refreshAdd)) {
        throw errors.neoniteDev.internal.dataBaseError;
    }

    var jwt_token = jwt.sign(
        {
            'sub': user.accountId,
            'mver': false,
            'clid': credentials.username,
            'dn': user.displayName,
            'am': grant_type,
            'iai': user.accountId,
            'sia': '4e656f6e697465',
            'clsvc': 'fortnite',
            'ic': true,
            't': 's',
        },
        jwtSecret,
        {
            expiresIn: expireIn,
            jwtid: access_token
        }
    );

    var jwt_refresh = jwt.sign(
        {
            'sub': user.accountId,
            't': 'r',
            'clid': credentials.username,
            'am': grant_type,
        },
        jwtSecret,
        {
            expiresIn: refreshExpireIn,
            jwtid: refresh_token
        }
    );

    res.json(
        {
            'access_token': 'eg1~' + jwt_token,
            'refresh_token': 'eg1~' + jwt_refresh,
            'expires_in': Math.round(expireIn / 1000),
            'expires_at': tokenExpires,
            'refresh_expires': Math.round(refreshExpireIn / 1000),
            'refresh_expires_at': refreshExpires,
            'client_id': credentials.username,
            'account_id': user.accountId,
            'internal_client': true,
            'displayName': user.displayName,
            'in_app_id': user.accountId,
            'token_type': 'bearer',
            'client_service': 'fortnite',
            'app': 'neonite',
        }
    );
});

app.get('/api/oauth/verify', verifyAuthorization(true), userAgentParse(false), (req: reqWithAuthMulti, res) => {
    if (!req.headers.authorization) {
        return res.sendStatus(400);
    }

    const token = req.headers.authorization.replace(/^bearer /i, '');
    const expires_date = new Date(req.auth.expireAt * 1000);
    const expire_in = expires_date.getTime() - Date.now()

    // typescript...
    if (req.auth.auth_method == 'client_credentials') {
        return res.json(
            {
                token: token,
                session_id: req.auth.token,
                token_type: "bearer",
                client_id: req.auth.clientId,
                internal_client: true,
                client_service: req.auth.client_service,
                expires_in: Math.floor(expire_in / 1000),
                expires_at: expires_date,
                auth_method: "client_credentials"
            }
        );
    }

    res.json(
        {
            token: token,
            session_id: req.auth.token,
            token_type: 'bearer',
            client_id: req.auth.clientId,
            internal_client: req.auth.internal,
            client_service: req.auth.client_service,
            account_id: req.auth.account_id,
            expires_in: Math.floor(expire_in / 1000),
            expires_at: expires_date,
            auth_method: req.auth.auth_method,
            display_name: req.auth.displayName,
            app: req.auth.client_service,
            in_app_id: req.auth.in_app_id,
            device_id: req.auth.deviceId,
        }
    );
});


//create exchange
app.get('/api/oauth/exchange', verifyAuthorization(false, false), async (req: reqWithAuth, res) => {
    const exchangeCode = crypto.randomUUID().replace(/-/g, '');
    const expireAt = new Date().addMinutes(5)
    const createdAt = new Date();

    await exchanges.add(exchangeCode, req.auth.account_id, req.auth.token, createdAt, expireAt);

    res.json(
        {
            expiresInSeconds: Math.round((expireAt.getTime() - createdAt.getTime()) / 1000),
            code: exchangeCode,
            creatingClientId: req.auth.clientId
        }
    )
})

// kill a token
app.delete('/api/oauth/sessions/kill/:token', verifyAuthorization(true, false), async (req: reqWithAuthMulti, res) => {
    var tokenToKill = await validateToken(req.params.token);

    if (!tokenToKill) {
        throw errors.neoniteDev.authentication.unknownSession.with(req.params.token)
    }

    if (req.auth.auth_method == 'client_credentials' || tokenToKill.auth_method == 'client_credentials') {
        if (req.auth.token != tokenToKill.token) {
            throw errors.neoniteDev.authentication.notOwnSessionRemoval.with(req.params.token)
        }

        await tokens.remove(tokenToKill.token);
        return res.status(204).end()
    }

    if (req.auth.account_id != tokenToKill.account_id) {
        throw errors.neoniteDev.authentication.notOwnSessionRemoval.with(req.params.token)
    }

    await Promise.all(
        [
            refresh_tokens.removeByToken(tokenToKill.token),
            tokens.remove(tokenToKill.token)
        ]
    );

    res.status(204).end()
});

// kill other tokens
app.delete('/api/oauth/sessions/kill/', verifyAuthorization(false, false), async (req: reqWithAuth, res) => {
    if (req.query.killType != "OTHERS_ACCOUNT_CLIENT_SERVICE") {
        throw errors.neoniteDev.authentication.invalidRequest.withMessage('a valid killType is required.')
    }

    await Promise.all(
        [
            tokens.removeOthers(req.auth.token, req.auth.account_id),
            refresh_tokens.removeOthers(req.auth.token, req.auth.account_id)
        ]
    );

    res.status(204).end()
});


app.get('/api/epicdomains/ssodomains', (req, res) => {
    res.json(
        [
            'neonitedev.live',
            'unrealengine.com',
            'unrealtournament.com',
            'fortnite.com',
            'epicgames.com',
        ]
    )
})


app.get('/api/public/account/:accountId', verifyAuthorization(false, false), async (req: reqWithAuth, res) => {
    var account = await users.getById(req.params.accountId);


    if (!account) {
        throw errors.neoniteDev.account.accountNotFound.with(req.params.accountId);
    }


    if (req.auth.account_id === req.params.accountId) {
        return res.json(
            {
                id: req.params.accountId,
                displayName: req.auth.displayName,
                name: req.auth.displayName,
                email: account.email,
                failedLoginAttempts: 0,
                lastLogin: new Date(),
                numberOfDisplayNameChanges: 0,
                ageGroup: "UNKNOWN",
                headless: false,
                country: "us",
                lastName: "",
                preferredLanguage: "en",
                passwordResetRequired: false,
                lastDisplayNameChange: "2017-01-01T00:00:00.000Z",
                canUpdateDisplayName: true,
                tfaEnabled: false,
                emailVerified: false,
                minorVerified: false,
                minorExpected: false,
                minorStatus: "UNKNOWN"
            }
        );
    }
    res.json(
        {
            id: req.params.accountId,
            displayName: account.displayName,
            externalAuths: {}
        }
    );
});

app.get('/api/public/account/:accountId/externalAuths', verifyAuthorization(false, false), async (req: reqWithAuth, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    var user = await users.getById(req.params.accountId);

    if (!user) {
        throw errors.neoniteDev.account.accountNotFound.with(req.params.accountId);
    }

    var externalAuths: Record<string, Object> = {};

    if (user.discord_account_id) {
        externalAuths.discord = {
            accountId: req.params.accountId,
            type: "discord",
            externalAuthId: user.discord_account_id,
            externalAuthIdType: "discord_user_id",
            externalDisplayName: user.discord_user_name,
            authIds: [
                {
                    id: user.discord_account_id,
                    type: "discord_user_id"
                }
            ],
            dateAdded: "2020-01-01T00:00:00.000Z"
        }

    }

    if (user.google_account_id) {
        externalAuths.google = {
            accountId: req.params.accountId,
            type: "google",
            externalAuthId: user.google_account_id,
            externalAuthIdType: "google_user_id",
            externalDisplayName: user.google_display_name,
            authIds: [
                {
                    id: user.google_account_id,
                    type: "google_user_id"
                }
            ],
            dateAdded: "2020-01-01T00:00:00.000Z"
        }

    }

    res.json(
        externalAuths
    );
});

app.get('/api/public/account/', verifyAuthorization(), async (req, res) => {
    if (!req.query.accountId) {
        return res.json([])
    }

    var Ids = undefined;

    if (!(req.query.accountId instanceof Array)) {
        Ids = <string[]>(new Array(req.query.accountId))
    } else {
        var preIds = <string[]>(req.query.accountId)
        Ids = preIds.filter((x: string) => typeof x == 'string');
    }



    if (Ids.length > 100 || Ids.length <= 0) {
        throw errors.neoniteDev.account.invalidAccountIdCount.with('100');
    }

    const result = await users.gets(Ids);

    res.json(
        result.map(x => {
            return {
                id: x.accountId,
                displayName: x.displayName,
                passwordResetRequired: x.accountId === req.auth.account_id ? false : undefined,
                externalAuths: {}
            }
        })
    );
});

// get account by display name
app.get('/api/public/account/displayName/:displayName', verifyAuthorization(), async (req: reqWithAuth, res) => {
    var user = await users.getByDiplayName(req.params.displayName);

    if (!user) {
        throw errors.neoniteDev.account.accountNotFound.with(req.params.displayName);
    }

    res.json({
        'id': user.accountId,
        'displayName': req.params.displayName,
        'externalAuths': {}
    })
})

// get active device auths
app.get('/api/public/account/:accountId/deviceAuth', verifyAuthorization(), (req: reqWithAuth, res) => res.json([]));

// create a device auth.
app.post('/api/public/account/:accountId/deviceAuth', verifyAuthorization(), (req: reqWithAuth, res) => {
    throw errors.neoniteDev.authentication.wrongGrantType;
});

const serverStart = new Date();
app.get('/api/version', (req, res) => {
    res.json(
        {
            app: 'neonite',
            serverDate: new Date(),
            overridePropertiesVersion: 'UNKNOWN',
            cln: 'UNKNOWN',
            build: 'UNKNOWN',
            moduleName: 'Neonite-V3',
            buildDate: serverStart,
            version: '3.0.0',
            branch: 'main',
            modules: {}
        }
    )
})

app.use(validateMethod(app));

app.use(() => {
    throw errors.neoniteDev.basic.notFound;
})

app.use(
    (err: any, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof ApiError) {
            err.apply(res);
        }
        else if (err instanceof HttpError && err.type == 'entity.parse.failed') {
            errors.neoniteDev.internal.jsonParsingFailed.with(err.message).apply(res);
        }
        else {
            console.error(err)
            errors.neoniteDev.internal.serverError.apply(res);
        }
    }
)

module.exports = app