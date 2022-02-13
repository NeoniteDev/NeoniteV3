import { Request, Response, NextFunction } from 'express-serve-static-core';
import { JsonWebTokenError } from 'jsonwebtoken'
import * as JWT from 'jsonwebtoken'
import errors, { neoniteDev } from '../structs/errors';
import * as database from '../database/mysqlManager';
import { fulltokenInfo, tokenInfo, tokenInfoClient } from '../structs/types';
import tokens from '../database/tokenController';



export async function validateToken(token: string, bAllowCache: boolean = true): Promise<tokenInfo | tokenInfoClient | undefined> {
    if (token.startsWith('eg1~')) {
        try {
            var decoded = <JWT.JwtPayload>(JWT.verify(token.slice(4), "ec0cd96e1c7d5832913b126786c441e20b2230c6"));
        } catch (e) {
            return undefined;
        }

        if (!decoded.jti || !decoded.exp) {
            return undefined;
        }

        
        const exist = await tokens.get(decoded.jti, bAllowCache);

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
            in_app_id: decoded.iai,
            deviceId: decoded.dvid
        }
    } else if (token.length == 32) {
        return await tokens.get(token, bAllowCache);
    }
}

export interface reqWithAuth extends Omit<Request, 'auth'> {
    auth: fulltokenInfo
}

type token = tokenInfo | tokenInfoClient;

export interface reqWithAuthMulti extends Omit<Request, 'auth'> {
    auth: token
}

export default function verifyAuthorization(bAllowClient: boolean = false, bAllowCache: boolean = true) {
    return async function(req: Request, res: Response, next: NextFunction) {
        if (!req.headers.authorization || req.headers.authorization.match(/^bearer /i) == null) {
            return next(neoniteDev.authentication.invalidHeader);
        }
    
        const authorization = req.headers.authorization.slice(7);
    
        const auth = await validateToken(authorization, bAllowCache);
    
        if (!auth) {
            return next(neoniteDev.authentication.validation_failed.with(req.headers.authorization));
        }
    
        if (!bAllowClient && auth.auth_method == 'client_credentials') {
            return next(errors.neoniteDev.authentication.wrongGrantType);
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