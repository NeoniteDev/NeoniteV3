import { Request, Response, NextFunction } from 'express-serve-static-core';
import { JsonWebTokenError } from 'jsonwebtoken'
import * as JWT from 'jsonwebtoken'
import errors, { neoniteDev } from '../structs/errors';
import * as database from '../database/mysqlManager';

export async function CheckAuthorization(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization || req.headers.authorization.match(/^bearer /i) == null) {
        return next(neoniteDev.authentication.invalidHeader);
    }

    const authorization = req.headers.authorization.slice(7);

    if (authorization.startsWith('eg1~')) {
        try {
            var decoded = <JWT.JwtPayload>(JWT.verify(authorization.slice(4), "ec0cd96e1c7d5832913b126786c441e20b2230c6"));
        } catch (e) {
            return next(neoniteDev.authentication.validation_failed);
        }

        const exist = await database.tokens.check(decoded.jti);

        if (!exist) {
            return next(neoniteDev.authentication.validation_failed.with(req.headers.authorization));
        }

        const auth_method = decoded.am;

        if (auth_method == 'client_credentials') {
            return next(errors.neoniteDev.authentication.wrongGrantType);
        }

        req.auth = {
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

        return next();
    } else if (authorization.length == 32) {
        const infos = await database.tokens.get(authorization);

        if (!infos) {
            return next(neoniteDev.authentication.validation_failed.with(req.headers.authorization));
        }

        req.auth = infos;

        return next();
    }

    var path = req.url.split('?').shift();

    return next(
        neoniteDev.authentication.authenticationFailed.withMessage(`Authentication failed for ${path}`).with(path)
    );
}

export default CheckAuthorization;

export async function CheckClientAuthorization(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization || req.headers.authorization.match(/^bearer /i) == null) {
        return next(neoniteDev.authentication.invalidHeader);
    }

    const authorization = req.headers.authorization.slice(7);

    if (authorization.startsWith('eg1~')) {
        try {
            var decoded = <JWT.JwtPayload>(JWT.verify(authorization.slice(4), "ec0cd96e1c7d5832913b126786c441e20b2230c6"));
        } catch (e) {
            return next(neoniteDev.authentication.validation_failed);
        }

        const exist = await database.tokens.check(decoded.jti);

        if (!exist) {
            console.log(decoded.jti)
            return next(neoniteDev.authentication.validation_failed.with(req.headers.authorization));
        }

        req.auth = {
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

        return next();
    } else if (authorization.length == 32) {
        const infos = await database.tokens.get(authorization);

        console.log(infos)

        if (!infos) {
            return next(neoniteDev.authentication.validation_failed.with(req.headers.authorization));
        }

        req.auth = infos;

        return next();
    }

    var path = req.url.split('?').shift();

    return next(
        neoniteDev.authentication.authenticationFailed.withMessage(`Authentication failed for ${path}`).with(path)
    );
}