const express = require('express');
const errors = require('./../structs/errors')
const Path = require('path');
const fs = require('fs');
const crypto = require('crypto')
const { CheckAuthorization, CheckClientAuthorization } = require('./../middlewares/authorization');
const database = require('../database/mysqlManager');
const { error } = require('console');
const app = express.Router();
app.use(express.json());

app.post('/v1/purchaseToken', CheckAuthorization, async (req, res) => {
    const ip = req.get('cf-connecting-ip') || req.ip;
    const ipMd5 = crypto.createHash('md5').update(ip).digest("hex");

    const purchaseToken = crypto.randomUUID().replaceAll('-', '');

    const success = await database.pendingPurchases.add({
        accountId: req.auth.account_id,
        ip_hash: ipMd5,
        offers: req.body.offers,
        purchaseToken: purchaseToken
    })

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

    const purchase = await database.pendingPurchases.get({
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
        return res.status(415).end();
    }

    if (!req.body.purchaseToken ||
        typeof (req.body.purchaseToken) != 'string'
    ) {
        return res.status(400).json({
            message: 'Your request is missing body.purchaseToken'
        });
    }

    const purchase = purchases.find(x => x.purchaseToken == req.body.purchaseToken);

    if (!purchase) {
        return res.status(404).json({
            message: 'Cannot find your purchaseToken'
        });
    }

    const receiptId = crypto.randomUUID().replaceAll('-', '');

    await database.pendingPurchases.setReceiptId(req.body.purchaseToken, receiptId);

    res.json({
        receiptId: receiptId
    })
})

app.use(() => {
    throw errors.neoniteDev.basic.notFound;
})

app.use(
    /**
     * 
     * @param {any} err 
     * @param {express.Request} req 
     * @param {express.Response} res 
     * @param {express.NextFunction} next 
     */
    (err, req, res, next) => {
        if (err instanceof errors.ApiError) {
            err.apply(res)
        } else {
            console.error(err);
            errors.neoniteDev.internal.serverError.apply(res)
        }
    })

module.exports = app;