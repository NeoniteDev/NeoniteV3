const express = require('express');

const { CheckClientAuthorization } = require('./../middlewares/authorization')
const checkMethod = require('./../middlewares/Method').default;
const app = express.Router();

app.get('/api/service/bulk/status', CheckClientAuthorization, (req, res) => {
    //adds serviceId based on what the game feeds it, if undefined defaults to fortnite

    var services = req.query.serviceId;

    if (typeof (req.query.serviceId) === 'string') {
        services = [req.query.serviceId]
    }

    res.json(
        services.map(x =>
        (
            {
                serviceInstanceId: x,
                status: "UP",
                message: "Down for maintenance",
                maintenanceUri: null,
                overrideCatalogIds: x.toLowerCase() == "fortnite" ? [
                    "a7f138b2e51945ffbfdacc1af0541053"
                ] : undefined,
                banned: false,
                allowedActions: req.auth.account_id ? [
                    "PLAY",
                    "DOWNLOAD"
                ] : [],
                launcherInfoDTO: {
                    appName: x,
                    catalogItemId: "00000000000000000000000000000000",
                    namespace: "00000000000000000000000000000000"
                }
            }
        ))
    );
});

app.get("/api/service/:serviceId/status", CheckClientAuthorization, (req, res) => {
    const serviceId = req.params.serviceId.toLowerCase();
    res.json({
        serviceInstanceId: serviceId,
        status: "UP",
        message: "Down for maintenance",
        maintenanceUri: "https://dsc.gg/neonite",
        overrideCatalogIds: serviceId == "fortnite" ? [
            "a7f138b2e51945ffbfdacc1af0541053"
        ] : [],
        banned: false,
        allowedActions: req.auth.account_id ? [
            "PLAY",
            "DOWNLOAD"
        ] : [],
        launcherInfoDTO: {
            appName: serviceId,
            catalogItemId: "00000000000000000000000000000000",
            namespace: "00000000000000000000000000000000"
        }
    })
})

app.use(checkMethod(app));

module.exports = app
