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
                    status: "UP",
                    message: "Neonite is UP",
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
                        catalogItemId: "00000000000000000000000000000000",
                        namespace: "00000000000000000000000000000000"
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
            status: "UP",
            message: "Neonite is UP",
            maintenanceUri: "https://dsc.gg/neonite",
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
                catalogItemId: "00000000000000000000000000000000",
                namespace: "00000000000000000000000000000000"
            }
        }
    )
})

app.use(verifyMethod(app));

module.exports = app
