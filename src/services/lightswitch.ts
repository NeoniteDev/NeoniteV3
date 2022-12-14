import Router from "express-promise-router";
import errors, { ApiError } from "../utils/errors";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from 'http-errors';
import Users, { User } from "../database/local/usersController";
import VerifyAuthorization, { reqWithAuth, reqWithAuthMulti } from "../middlewares/authorization";
import verifyMethod from '../middlewares/Method'
//import { isOperational } from "../database/mysqlManager";

const app = Router();


app.get('/api/service/bulk/status', VerifyAuthorization(true), async (req: reqWithAuthMulti, res) => {
    //adds serviceId based on what the game feeds it, if undefined defaults to fortnite
    const services = new Array(req.query.serviceId);
    const bIsAccount = req.auth.auth_method != 'client_credentials';

    const bDatabaseOperational = true; // await isOperational();

    res.json(
        services.filter(x => typeof x == 'string').map(
            // @ts-ignore
            (x: String) => {
                return {
                    serviceInstanceId: x,
                    status: bDatabaseOperational ? "UP" : "DOWN",
                    message: `Neonite is ${bDatabaseOperational ? "UP" : "down due to database problem"}`,
                    maintenanceUri: "https://dsc.gg/neonite",
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

app.get("/api/service/:serviceId/status", VerifyAuthorization(true), async (req: reqWithAuthMulti, res) => {
    const serviceId = req.params.serviceId.toLowerCase();
    const bIsAccount = req.auth.auth_method != 'client_credentials';

    const bDatabaseOperational = true; // await isOperational();

    res.json(
        {
            serviceInstanceId: serviceId,
            status: "UP",
            message: "Neonite IS UP what did you think",
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
