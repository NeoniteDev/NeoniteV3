
import PromiseRouter from 'express-promise-router';
import verifyAuthorization, {reqWithAuth} from '../middlewares/authorization';
import validateMethod from '../middlewares/Method';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import errors, { ApiError } from '../utils/errors';
import { HttpError } from 'http-errors';
import * as express from 'express';

const app = PromiseRouter()

app.post('/api/shared/offers/price', verifyAuthorization(), express.json(), (req: reqWithAuth, res) => {
    if (req.body.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount
         .withMessage(`Sorry, for account-based token, accountId ${req.auth.account_id} cracked from the token doesn't match the accountId ${req.body.accountId} passed in the request`)
         .with(req.auth.account_id, req.body.accountId)
    }

    const lineOffers: {offerId: string, quantity: number}[] = req.body.lineOffers;

    if ((lineOffers instanceof Array) == false) {
        throw errors.neoniteDev.basic.jsonMappingFailed.with(`lineOffers must not be ${typeof req.body.lineOffers}`);
    }

    const invalidElementIndex = lineOffers.findIndex(x => typeof (x.offerId) != 'string' || (x.quantity != undefined && typeof (x.quantity) != 'number'));

    if (invalidElementIndex !== -1) {
        const invalidKey =  typeof (lineOffers[invalidElementIndex].offerId) != 'string' ? 'offerId': 'quantity';
        throw errors.neoniteDev.basic.jsonMappingFailed.withMessage(`body.lineOffers[${invalidElementIndex}].${invalidKey}`)
    }

    res.json(
        {
            accountId: req.body.accountId,
            identityId: req.body.accountId,
            namespace: "fn",
            country: req.body.country || "US",
            taxType: "Tax",
            taxCalculationStatus: "NOT_APPLICABLE",
            totalPrice: {
                currencyCode: "USD",
                discountPrice: 0,
                originalPrice: 0,
                discountPercentage: 100,
                discount: 0,
                voucherDiscount: 0,
                sellerVat: 0,
                vat: 0,
                vatRate: 0.0,
                convenienceFee: 0,
                basePayoutPrice: 0,
                basePayoutCurrencyCode: "USD",
                revenueWithoutTax: 0,
                revenueWithoutTaxCurrencyCode: "USD",
                payoutCurrencyExchangeRate: 1.0
            },
            totalPaymentPrice: {
                paymentCurrencyExchangeRate: 1.0,
                paymentCurrencyCode: "USD",
                paymentCurrencySymbol: "$",
                paymentCurrencyAmount: 0,
                paymentCurrencyDecimal: 2
            },
            coupons: [],
            lineOffers: lineOffers.map((offer, index) => {
                return {
                    lineId: index,
                    quantity: offer.quantity || 1,
                    taxSkuId: "FN_Currency",
                    price: {
                        currencyCode: "USD",
                        discountPrice: 0,
                        unitPrice: 0,
                        originalPrice: 0,
                        originalUnitPrice: 0,
                        discountPercentage: 0,
                        discount: 0,
                        voucherDiscount: 0,
                        sellerVat: 0,
                        vat: 0,
                        vatRate: 0.0,
                        convenienceFee: 0,
                        basePayoutPrice: 0,
                        basePayoutCurrencyCode: "USD",
                        revenueWithoutTax: 0,
                        revenueWithoutTaxCurrencyCode: "USD",
                        payoutCurrencyExchangeRate: 1.0
                    },
                    offerId: offer.offerId,
                    appliedRules: [],
                    ref: offer.offerId
                }
            })
        }
    );
})

app.use(validateMethod(app))

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