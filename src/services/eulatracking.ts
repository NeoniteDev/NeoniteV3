import Router from "express-promise-router";
import errors, { ApiError } from "../structs/errors";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from 'http-errors';
import Users, { User } from "../database/usersController";
import VerifyAuthorization from "../middlewares/authorization";
import { readFileSync } from "fs";
import * as Path from "path";

const app = Router();

var LicenseAgreementBody = readFileSync(
    Path.join(__dirname, '../../resources/license.txt'), 'utf-8'
)

app.get('/api/public/agreements/fn/account/:accountId', VerifyAuthorization(), (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }



    res.json(
        {
            "key": "fn",
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

app.post('/api/public/agreements/fn/version/1/account/:accountId/accept', (req, res) => res.status(204).end())


const rEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/


module.exports = app;

