const express = require('express');

const { CheckAuthorization, CheckClientAuthorization } = require('../middlewares/authorization');
const app = express.Router();

app.get('/api/public/v1/:accountId', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw Errors.neoniteDev.authorization.notYourAccount;
    }
    
    res.json({
        "bans": [],
        "warnings": []
    })
})


module.exports = app