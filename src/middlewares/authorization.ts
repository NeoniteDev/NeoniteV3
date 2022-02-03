import { Request, Response, NextFunction } from 'express-serve-static-core';
import { JsonWebTokenError } from 'jsonwebtoken'
import * as JWT from 'jsonwebtoken'
import errors, { neoniteDev } from '../structs/errors';
import * as database from '../database/mysqlManager';
import { tokenInfo } from '../structs/types';
import tokens from '../database/tokenController';
import * as NodeCache from 'node-cache'

// we only use node-cache for the checkperiod
var tokenCaches = new NodeCache({
    checkperiod: 120,
    useClones: false,
    maxKeys: 350
})

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

        var skipTokenCheck = tokenCaches.has(decoded.jti) && Math.random() > 0.3;

        if (!skipTokenCheck) {
            const exist = await tokens.check(decoded.jti);
            if (!exist) {
                return undefined;
            }

            try {
                tokenCaches.set(decoded.jti, '');
            } catch {}
        }

        return {
            token: decoded.jti,
            auth_method: decoded.am,
            clientId: decoded.clid,
            internal: decoded.ic,
            expireAt: decoded.exp,
            client_service: decoded.clsvc,
            displayName: decoded.dn,
            // @ts-ignore
            account_id: decoded.sub,
            in_app_id: decoded.iai
        }
    } else if (token.length == 32) {
        return await tokens.get(token);
    }
}

export async function VerifyAuthorization(req: Request, res: Response, next: NextFunction): Promise<void> {
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

export default VerifyAuthorization;

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