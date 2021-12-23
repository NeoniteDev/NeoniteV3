const express = require('express');
const { CheckAuthorization } = require('../middlewares/authorization');
const Path = require('path')
const fs = require('fs');

const errors = require('../structs/errors');

const operations = require('./operations')

const app = express.Router();

const basePath = Path.join(__dirname, '../../config/saved');

app.post('/api/game/v2/profile/:accountId/client/:command', CheckAuthorization, (req, res, next) => {
    const accountId = req.params.accountId;
    const profileId = req.query.profileId || 'common_core';
    const command = req.params.command;

    if (accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount.with(`fortnite:profile:${accountId}:commands`, 'ALL')
    }

    const handle = operations.getHandle(command);

    if (!handle) {
        throw errors.neoniteDev.mcp.operationNotFound.with(command);
    }

    var response = handle.execute({
        accountId,
        profileId,
        revision: req.query.rvn || -1,
        body: req.body
    });

    res.json(response);
})

module.exports = app;
