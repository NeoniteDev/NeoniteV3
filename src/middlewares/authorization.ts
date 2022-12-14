import { Request, Response, NextFunction } from 'express-serve-static-core';
import { JsonWebTokenError } from 'jsonwebtoken'
import * as JWT from 'jsonwebtoken'
import errors, { neoniteDev } from '../utils/errors';
//import * as database from '../database/mysqlManager';
import { fulltokenInfo, tokenInfo, tokenInfoClient } from '../utils/types';
//import tokens from '../database/tokenController';
import * as flexRateLimit from 'rate-limiter-flexible';
import { tokenCache } from '../utils/globals';
import tokens from '../database/local/tokenController';

export async function validateToken(token: string): Promise<tokenInfo | tokenInfoClient | undefined> {
    if (!token.startsWith('eg1~')) {
        const bIsValid = tokens.check(token);

        if (!bIsValid) {
            return undefined;
        }

        return await tokens.get(token);
    }

    try {
        var decoded = <JWT.JwtPayload>(JWT.verify(token.slice(4), "ec0cd96e1c7d5832913b126786c441e20b2230c6"));
    } catch (e) {
        if (e instanceof JsonWebTokenError) {
            throw errors.neoniteDev.authentication.invalidToken.withMessage(e.message).with(token)
        } else {
            throw errors.neoniteDev.authentication.invalidToken.with(token);
        }
    }

    if (!decoded.jti || !decoded.exp) {
        throw errors.neoniteDev.authentication.invalidToken.with(token);
    }

    const token_data: tokenInfo | tokenInfoClient = {
        token: decoded.jti,
        auth_method: decoded.am,
        clientId: decoded.clid,
        internal: decoded.ic,
        expireAt: new Date(decoded.exp * 1000),
        client_service: decoded.clsvc,
        displayName: decoded.dn,
        account_id: decoded.sub,
        in_app_id: decoded.iai,
        deviceId: decoded.dvid
    };

    // we don't care about verifing client tokens.
    if (token_data.auth_method == 'client_credentials') {
        return token_data;
    }

    const bIsValid = tokens.check(token_data.token);

    if (!bIsValid) {
        return undefined;
    }

    return token_data;
}

export interface reqWithAuth extends Omit<Request, 'auth'> {
    auth: fulltokenInfo
}

type token = tokenInfo | tokenInfoClient;

export interface reqWithAuthMulti extends Omit<Request, 'auth'> {
    auth: token
}

export default function verifyAuthorization(bAllowClient: boolean = false, bAllowCache: boolean = true) {
    return async function (req: Request, res: Response, next: NextFunction) {
        if (!req.headers.authorization || req.headers.authorization.match(/^bearer /i) == null) {
            return next(neoniteDev.authentication.invalidHeader);
        }

        const authorization = req.headers.authorization.slice(7);
        const auth = await validateToken(authorization);

        if (!auth) {
            throw errors.neoniteDev.authentication.validationFailed.with(req.headers.authorization);
        }

        if (!bAllowClient && auth.auth_method == 'client_credentials') {
            throw errors.neoniteDev.authentication.wrongGrantType;
        }

        req.auth = auth;

        next();
    }
}


declare global {
    namespace Express {
        interface Request {
            auth: any
        }
    }
}