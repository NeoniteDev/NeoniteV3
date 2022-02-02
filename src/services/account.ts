import Router from "express-promise-router";
import errors, { ApiError } from "../structs/errors";
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as express from "express";
import VerifyAuthorization, { CheckClientAuthorization } from "../middlewares/authorization";
import validateMethod from "../middlewares/Method";
import { Credentials } from "../structs/types";
import tokens from "../database/tokenController";
import { exchanges } from "../database/exchangesController";
import users from "../database/usersController";
import refresh_tokens from "../database/refreshController";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from "http-errors";

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
    try {
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
            throw errors.neoniteDev.authentication.invalidClient;
        }

        if (credentials.username.length != 32) {
            throw errors.neoniteDev.authentication.invalidClient;
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
                    var jwtToken: string | undefined = undefined;

                    if ('token_type' in req.body && req.body.token_type == 'eg1') {
                        jwtToken = 'eg1~' + jwt.sign(
                            {
                                'mver': false,
                                'clid': credentials.username,
                                'am': grant_type,
                                'sia': '4e656f6e697465',
                                'clsvc': 'fortnite',
                                'ic': true,
                                't': 's'
                            },
                            jwtSecret,
                            {
                                jwtid: token,
                                expiresIn: '4h'
                            }
                        )
                    }

                    const expires = new Date().addHours(4);

                    await tokens.add({
                        auth_method: grant_type,
                        clientId: credentials.username,
                        client_service: 'fortnite',
                        expireAt: expires.getTime(),
                        internal: true,
                        token: token
                    })

                    res.json({
                        'access_token': jwtToken || token,
                        'expires_in': 14400, // in seconds
                        'expires_at': expires,
                        'token_type': 'bearer',
                        'client_id': credentials.username,
                        'internal_client': true,
                        'client_service': 'fortnite'
                    })

                    return;
                }

            case 'exchange_code':
                {
                    if (!req.body.exchange_code) {
                        throw errors.neoniteDev.authentication.invalidRequest
                    }

                    const code = await exchanges.get(req.body.exchange_code);
                    const removeSuccess = await exchanges.get(req.body.exchange_code);

                    if (!removeSuccess) {
                        throw errors.neoniteDev.authentication.invalidExchange;
                    }

                    if (!code) {
                        throw errors.neoniteDev.authentication.invalidExchange;
                    };


                    user = await users.getById(code.accountId);

                    if (!user) {
                        throw errors.neoniteDev.authentication.invalidExchange;
                    }

                    break;
                }

            case 'password':
                {
                    if ('username' in req.body == false || 'password' in req.body == false) {
                        throw errors.neoniteDev.authentication.invalidRequest;
                    }

                    var hash_password = crypto.createHash("sha256").update(req.body.password).digest("hex")

                    user = await users.getByEmail(req.body.username.toLowerCase());


                    if (!user || user.password !== hash_password) {
                        throw errors.neoniteDev.authentication.invalidGrant;
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
                        } catch { throw errors.neoniteDev.authentication.invalidRefresh; }

                        if (typeof decoded != 'object' || !decoded.jti) {
                            throw errors.neoniteDev.authentication.invalidRefresh;
                        }

                        var infos = await refresh_tokens.get(decoded.jti);

                        if (!infos) {
                            throw errors.neoniteDev.authentication.invalidRefresh;
                        }
                    } else if (refresh.length == 32) {
                        var infos = await refresh_tokens.get(refresh);

                        if (!infos) {
                            throw errors.neoniteDev.authentication.invalidRefresh;
                        }
                    } else {
                        throw errors.neoniteDev.authentication.invalidRefresh;
                    }

                    if (infos.clientId != credentials.username) {
                        throw errors.neoniteDev.authentication.invalidHeader.withMessage(`invalid client ${credentials.username}`);
                    }

                    refresh_tokens.remove(infos.token);
                    tokens.remove(infos.bearer_token);

                    user = await users.getById(infos.account_id)

                    if (!user) {
                        throw errors.neoniteDev.authentication.invalidRefresh;
                    }

                    break;
                }

            default:
                {
                    throw errors.neoniteDev.authentication.grantNotImplemented;
                }
        }


        var access_token = crypto.randomUUID().replace(/-/g, '');
        var refresh_token = crypto.randomUUID().replace(/-/g, '');

        const tokenExpires = new Date().addHours(8);
        const refreshExpires = new Date().addHours(24);

        const tokenAdd = tokens.add({
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
        });

        const refreshAdd = refresh_tokens.add({
            auth_method: grant_type,
            clientId: credentials.username,
            client_service: 'fortnite',
            expireAt: tokenExpires.getTime(),
            internal: true,
            token: refresh_token,
            account_id: user.accountId,
            displayName: user.displayName,
            in_app_id: user.accountId,
            bearer_token: access_token
        });


        if (!(await tokenAdd) || !(await refreshAdd)) {
            throw errors.neoniteDev.internal.dataBaseError;
        }

        var jwt_token: string | undefined = undefined;
        var jwt_refresh: string | undefined = undefined;

        if (req.body.token_type == 'eg1') {
            jwt_token = 'eg1~' + jwt.sign(
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
                    't': 's'
                },
                jwtSecret,
                {
                    expiresIn: tokenExpires.getTime(),
                    jwtid: access_token
                }
            );

            jwt_refresh = 'eg1~' + jwt.sign(
                {
                    'sub': user.accountId,
                    't': 'r',
                    'clid': credentials.username,
                    'am': grant_type,
                },
                jwtSecret,
                {
                    expiresIn: refreshExpires.getTime(),
                    jwtid: refresh_token
                }
            );
        }

        res.json({
            'access_token': jwt_token || access_token,
            'expires_in': Math.floor((tokenExpires.getTime() - Date.now()) / 1000),
            'expires_at': tokenExpires,
            'token_type': 'bearer',
            'refresh_token': jwt_refresh || refresh_token,
            'refresh_expires': Math.floor((refreshExpires.getTime() - Date.now()) / 1000),
            'refresh_expires_at': refreshExpires,
            'client_id': credentials.username,
            'account_id': user.accountId,
            'internal_client': true,
            'client_service': 'fortnite',
            'displayName': user.displayName,
            'app': 'fortnite',
            'in_app_id': user.accountId
        });

    } catch (error) {
        next(error)
    }
});

app.get('/api/oauth/verify', CheckClientAuthorization, (req, res) => {
    if (!req.headers.authorization) {
        return res.sendStatus(400);
    }

    const token = req.headers.authorization.replace(/^bearer /i, '');
    const expires_date = new Date(req.auth.expireAt)
    const expire_in = expires_date.getTime() - Date.now()

    res.json({
        'token': token,
        'session_id': req.auth.token,
        'token_type': 'bearer',
        'client_id': req.auth.clientId,
        'internal_client': req.auth.internal,
        'client_service': req.auth.client_service,
        'account_id': req.auth.account_id,
        'expires_in': Math.floor(expire_in / 1000),
        'expires_at': expires_date,
        'auth_method': req.auth.auth_method,
        'display_name': req.auth.displayName,
        'app': req.auth.client_service,
        'in_app_id': req.auth.in_app_id
    });
});


//create exchange
app.get('/api/oauth/exchange', VerifyAuthorization, async (req, res) => {
    const exchangeCode = crypto.randomUUID().replace(/-/g, '');
    const expireAt = new Date().addMinutes(5)
    const createdAt = new Date();

    await exchanges.add(exchangeCode, req.auth.account_id, createdAt, expireAt);

    res.json({
        "expiresInSeconds": Math.floor((expireAt.getTime() - createdAt.getTime()) / 1000),
        "code": exchangeCode,
        "creatingClientId": req.auth.clientId
    })
})

app.get('/api/epicdomains/ssodomains', (req, res) => {
    res.json([
        'unrealengine.com',
        'unrealtournament.com',
        'fortnite.com',
        'epicgames.com',
        'localhost',
        'neonitedev.live'
    ])
})

app.get('/api/public/account/:accountId', VerifyAuthorization, (req, res) => {
    if (req.auth.account_id === req.params.accountId) {
        return res.json({
            "id": req.params.accountId,
            "displayName": req.auth.displayName,
            "name": req.auth.displayName,
            "email": `${req.params.accountId}@neonite.com`,
            "failedLoginAttempts": 0,
            "lastLogin": new Date(),
            "numberOfDisplayNameChanges": 0,
            "ageGroup": "UNKNOWN",
            "headless": false,
            "country": "US",
            "lastName": "",
            "preferredLanguage": "en",
            "passwordResetRequired": true,
            "lastDisplayNameChange": "2017-01-01T00:00:00.000Z",
            "canUpdateDisplayName": true,
            "tfaEnabled": true,
            "emailVerified": true,
            "minorVerified": false,
            "minorExpected": false,
            "minorStatus": "UNKNOWN"
        });
    }
    res.json({
        id: req.params.accountId,
        displayName: '',
        externalAuths: {}
    });
});

app.get('/api/public/account/:accountId/externalAuths', VerifyAuthorization, (req, res) => {
    res.json([]);
});

app.get('/api/public/account/', VerifyAuthorization, async (req, res) => {
    if (!req.query.accountId) {
        return res.json([])
    }

    var Ids: string[] = [];

    if (typeof (req.query.accountId) === 'string') {
        Ids = [req.query.accountId]
    } else if (req.query.accountId instanceof Array && req.query.accountId) {
        Ids = <string[]>(req.query.accountId);
    }


    if ('length' in Ids === false) {
        return;
    }

    if (Ids.length > 100) {
        throw errors.neoniteDev.account.toManyAccounts;
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

app.get('/api/public/account/displayName/:displayName', VerifyAuthorization, (req, res) => {
    res.json({
        'id': Buffer.from(req.params.displayName, 'utf8').toString('hex'),
        'displayName': req.params.displayName,
        'externalAuths': {}
    })
})

app.get('/api/public/account/:accountId/deviceAuth', VerifyAuthorization, (req, res) => res.json([]));

app.post('/api/public/account/:accountId/deviceAuth', VerifyAuthorization, (req, res) => {
    res.json({
        accountId: req.params.accountId,
        deviceId: '',
        secret: 'Neonite'
    })
});

app.get('/api/public/account/:accountId/externalAuths', VerifyAuthorization, (req, res) => {
    res.json([])
});

app.delete('/api/oauth/sessions/kill/:token', CheckClientAuthorization, (req, res) => {
    throw errors.neoniteDev.internal.notImplemented;
});

app.delete('/api/oauth/sessions/kill/', CheckClientAuthorization, (req, res) => {
    throw errors.neoniteDev.internal.notImplemented;
});


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