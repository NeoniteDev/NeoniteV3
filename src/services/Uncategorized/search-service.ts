import Router from "express-promise-router";
import errors, { ApiError } from "../../structs/errors";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from 'http-errors';
import users from "../../database/usersController";
import verifyAuthorization from "../../middlewares/authorization";

const app = Router();

app.get('/api/v1/search/:accountId', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId !== req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }
    
    // ?prefix=GF&platform=epic
    const prefix = req.query.prefix;
    const platform = req.query.platform;

    if (typeof prefix != 'string') {
        throw errors.neoniteDev.basic.badRequest.withMessage("Required String parameter 'prefix' is not present");
    }

    if (!platform) {
        throw errors.neoniteDev.basic.badRequest.withMessage("Required String parameter 'platform' is not present");
    }

    if (typeof platform != 'string' || platform != 'epic') {
        throw errors.neoniteDev.basic.badRequest.withMessage("invalid platform");
    }

    const found = await users.search(prefix);

    res.json(
        found.map((x, index) => {
            return {
                accountId: x.accountId,
                matches: [
                    {
                        value: x.displayName,
                        platform: "epic"
                    }
                ],
                matchType: x.displayName.toLowerCase() == prefix.toLowerCase() ? 'exact' : 'prefix',
                epicMutuals: 0,
                sortPosition: index
            }
        })
    )
})

app.use(
    (err: any, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof ApiError) {
            err.apply(res);
        }
        else if (err instanceof HttpError && err.type == 'entity.parse.failed') {
            errors.neoniteDev.internal.jsonParsingFailed.with(err.message).apply(res);
        } else if (err instanceof HttpError) {
            var error = errors.neoniteDev.internal.unknownError;
            error.statusCode = err.statusCode;
            error.withMessage(err.message).apply(res);
        }
        else {
            console.error(err);
            errors.neoniteDev.internal.serverError.apply(res);
        }
    }
)

export default app;