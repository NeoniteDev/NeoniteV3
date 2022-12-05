import Router from "express-promise-router";
import errors, { ApiError } from "../structs/errors";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from 'http-errors';
import Users, { User } from "../database/local/usersController";
import VerifyAuthorization from "../middlewares/authorization";
import { readFileSync } from "fs";
import * as Path from "path";

const app = Router();

var LicenseAgreementBody = readFileSync(
    Path.join(__dirname, '../../resources/license.txt'), 'utf-8'
)

app.get('/api/public/agreements/:appName/account/:accountId', VerifyAuthorization(), (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    res.json(
        {
            "key": req.params.appName,
            "version": 1,
            "revision": 1,
            "title": "Neonite End User License Agreement",
            "body": LicenseAgreementBody,
            "locale": "en",
            "createdTimestamp": "2022-02-07T22:29:56.415Z",
            "lastModifiedTimestamp": "2022-02-07T22:29:56.415Z",
            "agentUserName": "sherwin.chen",
            "status": "ACTIVE",
            "custom": false,
            "wasDeclined": false,
            "hasResponse": false
        }
    )
})

app.get('/api/shared/agreements/:appName', VerifyAuthorization(true), (req, res) => {

    res.json(
        {
            "id": "000000000000000000000000",
            "key": req.params.appName,
            "version": 1,
            "revision": 1,
            "title": "Neonite End User License Agreement",
            "body": LicenseAgreementBody,
            "locale": "en",
            "createdTimestamp": "2022-02-07T22:29:56.415Z",
            "lastModifiedTimestamp": "2022-02-07T22:29:56.415Z",
            "agentUserName": "sherwin.chen",
            "status": "ACTIVE",
            "custom": false,
            "url": "https://www.neonitedev.live/termsOfService.html",
            "bodyFormat": "HTML"
        }
    )
})

app.post('/api/public/agreements/fn/version/1/account/:accountId/accept', (req, res) => res.status(204).end())

module.exports = app;

