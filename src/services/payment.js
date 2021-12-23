const express = require('express');
const errors = require('./../structs/errors')
const Path = require('path');
const fs = require('fs');
const crypto = require('crypto')

const { CheckAuthorization, CheckClientAuthorization } = require('./../middlewares/authorization');

const app = express.Router();

app.use(express.json())

app.post('/v1/purchaseToken', CheckAuthorization, async (req, res) => {
    res.json({
        "purchaseToken": crypto.randomUUID().replaceAll('-', '')
    });
})

app.use(() => {
    throw errors.neoniteDev.basic.notFound;
})

app.use(
    /**
     * 
     * @param {any} err 
     * @param {express.Request} req 
     * @param {express.Response} res 
     * @param {express.NextFunction} next 
     */
    (err, req, res, next) => {
        if (err instanceof ApiException) {
            err
                .Add('originatingService', 'com.epicgames.web.payment')
                .Add('intent', 'prod-pci')
                .apply(res)
        } else {
            new ApiException(errors.com.epicgames.common.server_error)
                .Add('originatingService', 'com.epicgames.web.payment')
                .Add('intent', 'prod-pci')
                .apply(res)
        }
    })

module.exports = app;