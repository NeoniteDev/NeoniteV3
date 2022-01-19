import { Request, Response, NextFunction } from 'express-serve-static-core';
import { JsonWebTokenError } from 'jsonwebtoken'
import * as JWT from 'jsonwebtoken'
import errors, { neoniteDev } from '../structs/errors';
import * as database from '../database/mysqlManager';
import { tokenInfo } from '../structs/types';

export async function validateToken(token: string): Promise<tokenInfo | undefined> {
    if (token.startsWith('eg1~')) {
        try {
            var decoded = <JWT.JwtPayload>(JWT.verify(token.slice(4), "ec0cd96e1c7d5832913b126786c441e20b2230c6"));
        } catch (e) {
            return undefined;
        }

        if (!decoded.jti || !decoded.exp) {
            return undefined;
        }

        const exist = await database.tokens.check(decoded.jti);
        if (!exist) {
            return undefined;
        }

        return {
            token: decoded.jti,
            auth_method: decoded.am,
            clientId: decoded.clid,
            internal: decoded.ic,
            expireAt: decoded.exp,
            client_service: decoded.clsvc,
            displayName: decoded.dn,
            account_id: decoded.sub,
            in_app_id: decoded.iai
        }
    } else if (token.length == 32) {
        return await database.tokens.get(token);
    }
}

export async function CheckAuthorization(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization || req.headers.authorization.match(/^bearer /i) == null) {
        return next(neoniteDev.authentication.invalidHeader);
    }

    const authorization = req.headers.authorization.slice(7);

    const auth = await validateToken(authorization);

    if (!auth) {
        return next(neoniteDev.authentication.validation_failed.with(req.headers.authorization));
    }

    if (auth.auth_method == 'client_credentials') {
        return next(errors.neoniteDev.authentication.wrongGrantType);
    }

    req.auth = auth;

    next();
}

export default CheckAuthorization;

export async function CheckClientAuthorization(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization || req.headers.authorization.match(/^bearer /i) == null) {
        return next(neoniteDev.authentication.invalidHeader);
    }

    const authorization = req.headers.authorization.slice(7);

    const auth = await validateToken(authorization);

    if (!auth) {
        return next(neoniteDev.authentication.validation_failed.with(req.headers.authorization));
    }

    req.auth = auth;

    next();
}

declare global {
    namespace Express {
        interface Request {
            auth: tokenInfo
        }
    }
}