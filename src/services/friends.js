const express = require('express');
const errors = require('./../structs/errors')
const fs = require('fs');

const { Method, userAgentParse: SeasonCheck } = require('./../middlewares/utilities');
const { CheckAuthorization } = require('../middlewares/authorization');
const CheckMethod = require('../middlewares/Method');

const app = express.Router();

app.get('/api/v1/:accountId/blocklist', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw Errors.neoniteDev.authorization.notYourAccount;
    }

    res.json([])
})

app.get('/api/v1/:accountId/recent/fortnite', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw Errors.neoniteDev.authorization.notYourAccount;
    }

    res.json([])
})

app.get('/api/v1/:accountId/summary', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw Errors.neoniteDev.authorization.notYourAccount;
    }


    res.json({
        friends: [],
        incoming: [],
        suggested: [],
        blocklist: [],
        settings: {
            acceptInvites: 'public'
        },
        limitsReached: {
            incoming: false,
            outgoing: false,
            accepted: false
        }
    })
})


// app.get("/api/public/friends/:accountId")

app.post('/api/v1/:accountId/blocklist/:friendId', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw Errors.neoniteDev.authorization.notYourAccount;
    }

    res.status(204).end()
})


app.get('/api/v1/:accountId/friends/:friendId', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw Errors.neoniteDev.authorization.notYourAccount;
    }

    res.status(204).send()
})

app.post('/api/v1/:accountId/friends/:friendId', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw Errors.neoniteDev.authorization.notYourAccount;
    }

    res.status(204).send()
})

app.use(CheckMethod(app));

app.use(() => {
    throw errors.neoniteDev.basic.notFound;
})

app.use(
    /**
    * @param {any} err
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {express.NextFunction} next
    */
    (err, req, res, next) => {
        if (err instanceof ApiException) {
            err
                .Add('originatingService', 'friends')
                .apply(res);
        }
        else if (err instanceof SyntaxError && err.type == 'entity.parse.failed') {
            new ApiException(errors.com.epicgames.common.json_parse_error)
                .With(err.message)
                .Add('originatingService', 'friends')
                .apply(res);
        }
        else {
            console.log(err);
            new ApiException(errors.com.epicgames.common.server_error)
                .Add('originatingService', 'friends')
                .apply(res);
        }
    }
)


module.exports = app;
