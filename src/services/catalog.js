

const express = require('express');
const online = require('../online');
const axios = require('axios').default
const app = express.Router();
const errors = require('../structs/errors');

const { default: VerifyAuthorization } = require('../middlewares/authorization');

// http://localhost/catalog/api/shared/bulk/offers?id=559f2ba95f874ec987d0ebfd2cc9c70a&id=ede05b3c97e9475a8d9be91da65750f0&id=3b4c5df9efa5415b941cf74262865e4e&id=4daadb392f1c4ee2b5a3af443e614d2a&id=f5c0e8ab6c9a4530999041e89e9b6934&id=9aa9f44cd8c24652953a1b204755b193&id=e2f25dae43604a839dd6f2c21b675d5e&id=d2da86026c71429a9cf5e76dfd89a1d3&id=e852b1940299435884365cec7dc3a608&id=35759d71512b47e5b2825669f1d9166a&id=c8319a037f9840e8b7549de480efb9c7&id=f05c43f7c1d24f5fbb1a6fa5a5a60edb&id=eb7332137e56427ea8847ee46a0562ce&id=57f0419c4e4a4ea4858b2f37a98d5315&id=41134f4ff35a45a4923604cbb15e487d&id=411a9188ef584588b935b2d4f43a2325&id=992ba7f52f3b40d49a4411fbade69b33&id=ae230025ab0f4b578d605569746233e5&id=b587eca883944eda861a4542e1d4fb6a&id=48e7be9d5a834f498da5799749db5836&id=6d28ba7c952b412d82120efcdcc9c233&id=3c552303884b4d69b9bcd4c410ee0130&id=85125898f3914946a9443bcce4667660&returnItemDetails=false&country=UNKNOWN&locale=en-US
app.get('/api/shared/bulk/offers', VerifyAuthorization(true), async (req, res) => {
    const token = await online.getClientSession()

    const response = await axios.get(`https://catalog-public-service-prod06.ol.epicgames.com${req.originalUrl}`, {
        headers: {
            ...req.headers,
            authorization: `${token.data.token_type} ${token.access_token}`,
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