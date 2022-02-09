
import PromiseRouter from 'express-promise-router';
import verifyAuthorization from '../middlewares/authorization';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import errors, { ApiError } from '../structs/errors';
import { HttpError } from 'http-errors';

const app = PromiseRouter()

app.get('/api/statsv2/account/:accountId', verifyAuthorization(), (req, res) => {
    res.json(
        {
            "startTime": 0,
            "endTime": 9223372036854775807,
            "stats": {
            },
            "accountId": req.params.accountId
        }
    );
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

module.exports = app;