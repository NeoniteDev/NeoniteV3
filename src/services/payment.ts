import Router from "express-promise-router";
import * as express from 'express';
import errors, { ApiError } from "../structs/errors";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from 'http-errors';
import Users, { User } from "../database/usersController";
import verifyAuthorization from "../middlewares/authorization";
import * as Path from 'path';
import * as crypto from 'crypto';
import pendingPurchases from "../database/purchasesController";
const app = Router();

app.use(express.json());

app.post('/v1/purchaseToken', verifyAuthorization(), async (req, res) => {
    const ip = req.get('cf-connecting-ip') || req.ip;
    const ipMd5 = crypto.createHash('md5').update(ip).digest("hex");

    const purchaseToken = crypto.randomUUID().replaceAll('-', '');

    const success = await pendingPurchases.add(
        {
            accountId: req.auth.account_id,
            ip_hash: ipMd5,
            offers: req.body.offers,
            purchaseToken: purchaseToken
        }
    )

    if (!success) {
        throw errors.neoniteDev.internal.dataBaseError;
    }

    res.cookie('x-neonite-purchaseToken', purchaseToken, {
        sameSite: 'none',
        secure: false,
        domain: req.hostname
    });

    res.cookie('x-neonite-accountId', req.auth.account_id);
    res.cookie('x-neonite-offers', JSON.stringify(req.body.offers, undefined, 0));

    res.json({
        purchaseToken: purchaseToken
    });
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

app.post('/neoniteWeb/purchaseItem', async (req, res) => {
    if (!req.is('json')) {
        return res.json(
            {
                message: 'Your purchase request is invalid, please reopen the page to try again.'
            }
        );
    }

    var purchaseToken: any = req.body.purchaseToken;

    if (!purchaseToken ||
        typeof (purchaseToken) != 'string'
    ) {
        return res.json(
            {
                message: 'Your purchase request is invalid, please reopen the page to try again.'
            }
        );
    }

    const purchase = pendingPurchases.get({
        purchaseToken: purchaseToken
    })

    if (!purchase) {
        return res.json(
            {
                message: 'Your purchase request is invalid, please reopen the page to try again.'
            }
        );
    }

    const receiptId = crypto.randomUUID().replaceAll('-', '');

    await pendingPurchases.setReceiptId(req.body.purchaseToken, receiptId);

    res.json(
        {
            receiptId: receiptId
        }
    )
})

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
            res.json(
                {
                    message: err.getMessage()
                }
            );
        }
        else if (err instanceof HttpError && err.type == 'entity.parse.failed') {
            const error = errors.neoniteDev.internal.jsonParsingFailed;
            res.json(
                {
                    message: error.getMessage()
                }
            );
        } else if (err instanceof HttpError) {
            res.json(
                {
                    message: err.expose ? err.message : 'Sorry an error occurred and we were unable to resolve it.'
                }
            );
        }
        else {
            console.error(err)
            const error = errors.neoniteDev.internal.serverError;
            res.json(
                {
                    "message": error.response.errorMessage
                }
            )
        }
    }
)

module.exports = app;