const express = require('express');
const errors = require('./../structs/errors')
const Path = require('path');
const fs = require('fs');

const { CheckAuthorization } = require('./../middlewares/authorization');

const app = express.Router();

app.get('/api/v1/_/:accountId/last-online', CheckAuthorization, async(req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw Errors.neoniteDev.authorization.notYourAccount;
    }
    
    res.json([]);
})

module.exports = app;