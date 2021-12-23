const express = require('express');
const { neoniteDev, ApiError } = require('../structs/errors')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { CheckAuthorization, CheckClientAuthorization } = require('../middlewares/authorization');


const app = express.Router();
const CheckMethod = require('../middlewares/Method');
const database = require('../database/mysqlManager');
const errors = require('../structs/errors');

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

        /**
         * @type {Credentials}
         */
        var credentials = {};
        try {
            const arr = Buffer.from(Authorization, 'base64').toString().split(':');

            credentials = Object.fromEntries(arr.map(x => {
                var i = arr.indexOf(x);
                return [i == 0 ? 'Username' : 'Password', x]
            }));
        } catch {
            throw new errors.neoniteDev.authentication.invalidClient;
        }

        if (credentials.Username.length != 32) {
            throw new errors.neoniteDev.authentication.invalidClient;
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

                    if ('token_type' in req.body && req.body.token_type == 'eg1') {
                        var jwt_token = 'eg1~' + jwt.sign(
                            {
                                'mver': false,
                                'clid': credentials.Username,
                                'am': grant_type,
                                'sia': '4e656f6e697465',
                                'clsvc': 'fortnite',
                                'ic': true,
                                't': 's'
                            },
                            process.env.JWT_SECRECT,
                            {
                                jwtid: token,
                                expiresIn: '4h'
                            }
                        )
                    }

                    const expires = new Date().addHours(4);

                    await database.tokens.add({
                        auth_method: grant_type,
                        clientId: credentials.Username,
                        client_service: 'fortnite',
                        expireAt: expires.getTime(),
                        internal: true,
                        token: token
                    })

                    res.json({
                        'access_token': jwt_token || token,
                        'expires_in': 14400, // in seconds
                        'expires_at': expires,
                        'token_type': 'bearer',
                        'client_id': credentials.Username,
                        'internal_client': true,
                        'client_service': 'fortnite'
                    })

                    return;
                }

            case 'exchange_code':
                {
                    if (!req.body.exchange_code) {
                        throw neoniteDev.authentication.invalidRequest
                    }

                    const code = await database.exchanges.get(req.body.exchange_code);
                    const removeSuccess = await database.exchanges.get(req.body.exchange_code);

                    if (!removeSuccess) {
                        throw neoniteDev.authentication.invalidExchange;
                    }

                    if (!code) {
                        throw neoniteDev.authentication.invalidExchange;
                    };

                    user = await database.users.get({ accountId: code.accountId });

                    if (!user) {
                        throw neoniteDev.authentication.invalidExchange;
                    }

                    break;
                }

            case 'password':
                {
                    if ('username' in req.body == false || 'password' in req.body == false) {
                        throw neoniteDev.authentication.invalidRequest;
                    }

                    var hash_password = crypto.createHash("sha256").update(req.body.password).digest("hex")

                    user = await database.users.get({
                        email: req.body.username.toLowerCase(),
                        password: hash_password
                    })

                    if (!user) {
                        throw neoniteDev.authentication.invalidGrant;
                    }

                    break;
                }

            case 'refresh_token':
                {
                    if ('refresh_token' in req.body == false) {
                        throw neoniteDev.authentication.invalidRequest.withMessage('refresh_token is required.')
                    }

                    /** @type {string} */
                    const refresh = req.body.refresh_token;

                    if (refresh.startsWith('eg1~')) {
                        try {
                            /**
                             * @type {import('jsonwebtoken').JwtPayload}
                             */
                            var decoded = jwt.verify(req.body.refresh_token.slice(4), process.env.JWT_SECRECT);
                        } catch { throw errors.neoniteDev.authentication.invalidRefresh; }

                        var infos = await database.refresh_tokens.get(decoded.jti);

                        if (!infos) {
                            throw errors.neoniteDev.authentication.invalidRefresh;
                        }
                    } else if (refresh.length == 32) {
                        var infos = await database.refresh_tokens.get(refresh);

                        if (!infos) {
                            throw errors.neoniteDev.authentication.invalidRefresh;
                        }
                    } else {
                        throw errors.neoniteDev.authentication.invalidRefresh;
                    }

                    if (infos.clientId != credentials.Username) {
                        throw errors.neoniteDev.authentication.invalidHeader.withMessage(`invalid client ${credentials.Username}`);
                    }

                    database.refresh_tokens.remove(infos.token);
                    database.tokens.remove(infos.bearer_token);

                    user = await database.users.get({ accountId: infos.account_id })

                    if (!user) {
                        throw errors.neoniteDev.authentication.invalidRefresh;
                    }

                    break;
                }

            default:
                {
                    throw neoniteDev.authentication.grantNotImplemented;
                }
        }


        var access_token = crypto.randomUUID().replace(/-/g, '');
        var refresh_token = crypto.randomUUID().replace(/-/g, '');

        const tokenExpires = new Date().addHours(8);
        const refreshExpires = new Date().addHours(24);

        const tokenAdd = database.tokens.add({
            auth_method: grant_type,
            clientId: credentials.Username,
            client_service: 'fortnite',
            expireAt: tokenExpires.getTime(),
            internal: true,
            token: access_token,
            account_id: user.accountId,
            displayName: user.displayName,
            in_app_id: user.accountId,
            refresh_token: refresh_token
        });

        const refreshAdd = database.refresh_tokens.add({
            auth_method: grant_type,
            clientId: credentials.Username,
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

        if (req.body.token_type == 'eg1') {
            var jwt_token = 'eg1~' + jwt.sign(
                {
                    'sub': user.accountId,
                    'mver': false,
                    'clid': credentials.Username,
                    'dn': user.displayName,
                    'am': grant_type,
                    'iai': user.accountId,
                    'sia': '4e656f6e697465',
                    'clsvc': 'fortnite',
                    'ic': true,
                    't': 's'
                },
                process.env.JWT_SECRECT,
                {
                    expiresIn: tokenExpires.getTime(),
                    jwtid: access_token
                }
            )

            var jwt_refresh = 'eg1~' + jwt.sign(
                {
                    'sub': user.accountId,
                    't': 'r',
                    'clid': credentials.Username,
                    'am': grant_type,
                },
                process.env.JWT_SECRECT,
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
            'client_id': credentials.Username,
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
app.get('/api/oauth/exchange', CheckAuthorization, async (req, res) => {
    const exchangeCode = crypto.randomUUID().replace(/-/g, '');
    const expireAt = new Date().addMinutes(5)
    const createdAt = new Date();

    await database.exchanges.add(exchangeCode, req.auth.account_id, createdAt, expireAt);

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

app.get('/api/public/account/:accountId', CheckAuthorization, (req, res) => {
    if (req.auth.account_id === req.params.accountId) {
        var displayName = Buffer.from(req.params.accountId, 'hex').toString();
        return res.json({
            "id": req.params.accountId,
            "displayName": Buffer.from(req.params.accountId, 'hex').toString(),
            "name": displayName,
            "email": `${req.params.accountId}@gmail.com`,
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
        displayName: Buffer.from(req.params.accountId, 'hex').toString(),
        externalAuths: {}
    });
});

app.get('/api/public/account/:accountId/externalAuths', CheckAuthorization, (req, res) => {
    res.json([]);
});

app.get('/api/public/account/', CheckAuthorization, (req, res) => {
    if (!req.query.accountId) {
        return res.json([])
    }

    var Ids = req.query.accountId;

    if (typeof (req.query.accountId) === 'string') {
        Ids = [req.query.accountId]
    }

    if (Ids.length > 100) {
        throw errors.neoniteDev.account.toManyAccounts;
    }


    res.json(
        Ids.map(x => {
            return {
                id: x,
                displayName: Buffer.from(x, 'hex').toString(),
                passwordResetRequired: x === req.auth.account_id ? false : undefined,
                externalAuths: {}
            }
        })
    );
});

app.get('/api/public/account/displayName/:displayName', CheckAuthorization, (req, res) => {
    res.json({
        'id': Buffer.from(req.params.displayName, 'utf8').toString('hex'),
        'displayName': req.params.displayName,
        'externalAuths': {}
    })
})

app.get('/api/public/account/:accountId/deviceAuth', CheckAuthorization, (req, res) => res.json([]));

app.post('/api/public/account/:accountId/deviceAuth', CheckAuthorization, (req, res) => {
    res.json({
        accountId: req.params.accountId,
        deviceId: '',
        secret: 'Neonite'
    })
});

app.get('/api/public/account/:accountId/externalAuths', CheckAuthorization, (req, res) => {
    res.json([])
});

app.delete('/api/oauth/sessions/kill/:token', CheckClientAuthorization, (req, res) => {
    throw errors.neoniteDev.internal.notImplemented;
});

app.delete('/api/oauth/sessions/kill/', CheckClientAuthorization, (req, res) => {
    throw errors.neoniteDev.internal.notImplemented;
});


app.use(CheckMethod(app));

app.use(() => {
    throw errors.neoniteDev.basic.notFound;
})

app.use(
    /**
    * @param {any} err
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {express.NextFunction} next
    */
    (err, req, res, next) => {
        if (err instanceof ApiError) {
            err.apply(res);
        }
        else if (err instanceof SyntaxError && err.type == 'entity.parse.failed') {
            neoniteDev.internal.jsonParsingFailed.with(err.message).apply(res);
        }
        else {
            console.error(err)
            neoniteDev.internal.serverError.apply(res);
        }
    }
)

module.exports = app