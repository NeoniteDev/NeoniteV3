import PromiseRouter from "express-promise-router";
import verifyAuthorization from "../middlewares/authorization";
import errors from "../utils/errors";
const app = PromiseRouter();

app.get('/api/public/v1/:accountId', verifyAuthorization(), (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    res.json(
        {
            bans: [],
            warnings: []
        }
    )
})


module.exports = app
