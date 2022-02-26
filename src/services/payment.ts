import Router from "express-promise-router";
import * as express from 'express';
import errors, { ApiError } from "../structs/errors";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from 'http-errors';
import Users, { User } from "../database/usersController";
import verifyAuthorization, { reqWithAuth } from "../middlewares/authorization";
import * as Path from 'path';
import * as crypto from 'crypto';
import pendingPurchases from "../database/purchasesController";
const app = Router();

app.use(express.json());

app.post('/v1/purchaseToken', verifyAuthorization(), async (req: reqWithAuth, res) => {
    const ip = req.get('cf-connecting-ip') || req.ip;
    const ipMd5 = crypto.createHash('sha256').update(ip).digest("hex");

    const purchaseToken = crypto.randomUUID().replaceAll('-', '');
    
    const offersArr = req.body.offers;

    if (!(offersArr instanceof Array)) {
        throw errors.neoniteDev.basic.badRequest;
    }

    const offers = offersArr.filter(x => typeof x == 'string');

    await pendingPurchases.add(req.auth.account_id, ipMd5, offers, purchaseToken);

    res.json(
        {
            purchaseToken: purchaseToken
        }
    );
})

const html = Path.join(__dirname, '../../resources/html/purchase.html');
const FailureHtml = Path.join(__dirname, '../../resources/html/purchaseFailed.html');


app.get('/v1/purchase', async (req, res) => {
    const ip = req.get('cf-connecting-ip') || req.ip;
    const md5Ip = crypto.createHash('md5').update(ip).digest("hex");

    const purchase = await pendingPurchases.get({
        ip_hash: md5Ip
    })

    if (!purchase) {
        return res.status(404).sendFile(FailureHtml);
    }

    res.cookie('x-neonite-purchaseToken', purchase.purchaseToken);
    res.cookie('x-neonite-accountId', purchase.accountId);
    res.cookie('x-neonite-offers', JSON.stringify(purchase.offers, undefined, 0));

    res.set('X-Frame-Options', 'SAMEORIGIN')
    res.sendFile(html);
})

// custom api


app.use((req, res) => {
    res.json(
        {
            message: "Your purchase request is invalid, please reopen the page to try again."
        }
    )
})

app.use(
    (err: any, req: Request, res: Response, next: NextFunction) => {

        if (err instanceof ApiError) {
            err.apply(res);
        }
        else if (err instanceof HttpError && err.type == 'entity.parse.failed') {
            errors.neoniteDev.internal.jsonParsingFailed.apply(res);
        }
        else {
            console.error(err)
            errors.neoniteDev.internal.serverError.apply(res);
        }
    }
)

module.exports = app;