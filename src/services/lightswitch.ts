import Router from "express-promise-router";
import errors, { ApiError } from "../structs/errors";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from 'http-errors';
import Users, { User } from "../database/usersController";
import VerifyAuthorization, { reqWithAuth, reqWithAuthMulti } from "../middlewares/authorization";
import verifyMethod from '../middlewares/Method'

const app = Router();


app.get('/api/service/bulk/status', VerifyAuthorization(true), (req: reqWithAuthMulti, res) => {
    //adds serviceId based on what the game feeds it, if undefined defaults to fortnite

    const services = new Array(req.query.serviceId);

    var bIsAccount = req.auth.auth_method != 'client_credentials';

    res.json(
        services.filter(x => typeof x == 'string').map(
            // @ts-ignore
            (x: String) => {
                return {
                    serviceInstanceId: x,
                    status: "DOWN",
                    message: "The beta of neontie v3 has ended, sorry. Me, the project owner, no longer have motivation to work on it. Thanks for participating to the beta! -Beat",
                    maintenanceUri: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
                    overrideCatalogIds: x.toLowerCase() == "fortnite" ? [
                        "a7f138b2e51945ffbfdacc1af0541053"
                    ] : undefined,
                    banned: false,
                    allowedActions: bIsAccount ? [
                        "PLAY",
                        "DOWNLOAD"
                    ] : [],
                    launcherInfoDTO: {
                        appName: x,
                        catalogItemId: "4fe75bbc5a674f4f9b356b5c90567da5",
                        namespace: "fn"
                    }
                }
            }
        )
    );
});

app.get("/api/service/:serviceId/status", VerifyAuthorization(true), (req: reqWithAuthMulti, res) => {
    const serviceId = req.params.serviceId.toLowerCase();
    var bIsAccount = req.auth.auth_method != 'client_credentials';

    res.json(
        {
            serviceInstanceId: serviceId,
            status: "DOWN",
            message: "The beta of neontie v3 has ended, sorry. Me, the project owner, no longer have motivation to work on it. Thanks for participating to the beta! -Beat",
            maintenanceUri: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
            overrideCatalogIds: serviceId == "fortnite" ? [
                "a7f138b2e51945ffbfdacc1af0541053"
            ] : [],
            banned: false,
            allowedActions: bIsAccount ? [
                "PLAY",
                "DOWNLOAD"
            ] : [],
            launcherInfoDTO: {
                appName: serviceId,
                catalogItemId: "4fe75bbc5a674f4f9b356b5c90567da5",
                namespace: "fn"
            }
        }
    )
})

app.use(verifyMethod(app));

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
        } else if (err instanceof HttpError) {
            var error = errors.neoniteDev.internal.unknownError;
            error.statusCode = err.statusCode;
            error.withMessage(err.message).apply(res);
        }
        else {
            console.error(err)
            errors.neoniteDev.internal.serverError.apply(res);
        }
    }
)

module.exports = app
