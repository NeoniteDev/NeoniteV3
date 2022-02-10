

const express = require('express');
const online = require('../online');
const axios = require('axios').default
const app = express.Router();
const errors = require('../structs/errors');

const { default: VerifyAuthorization } = require('../middlewares/authorization');

app.get('/api/shared/bulk/offers', VerifyAuthorization(true), async (req, res) => {
    const token = await online.getClientToken()

    const response = await axios.get(`https://catalog-public-service-prod06.ol.epicgames.com${req.originalUrl}`, {
        headers: {
            ...req.headers,
            authorization: `bearer ${token.access_token}`,
            host: 'catalog-public-service-prod06.ol.epicgames.com'
        },
        validateStatus: undefined,
        timeout: 6500
    })

    res.status(response.status);

    res.json(response.data);
})

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
        if (err instanceof errors.ApiError) {
            err.apply(res);
        }
        else if (err instanceof SyntaxError && err.type == 'entity.parse.failed') {
            neoniteDev.internal.jsonParsingFailed.with(err.message).apply(res);
        }
        else {
            console.error(err)
            neoniteDev.internal.serverError.apply(res);
        }
    }
)


module.exports = app;