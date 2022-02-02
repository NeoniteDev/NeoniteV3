const { Router } = require('express');
const { VerifyAuthorization } = require('../middlewares/authorization');
const errors = require('./../structs/errors')

const { ApiException } = errors;
const app = Router();


/**
 * @typedef {import('./../structs/types')} 
 */

app.get('/api/public/agreements/fn/account/:accountId', VerifyAuthorization, (req, res) =>  {
    if (req.params.accountId != req.auth.account_id) {
        throw Errors.neoniteDev.authorization.notYourAccount;
    }
    
    res.status(204).send();
})

module.exports = app