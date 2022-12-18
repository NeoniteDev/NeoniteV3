import PromiseRouter from 'express-promise-router';
import axios from 'axios';
import errors, { ApiError, neoniteDev } from '../utils/errors';
import { getClientSession } from '../online'
import { CatalogOffer } from '../types/catalogOffers';
import { getStarterPackStoreFront } from '../utils/storefront';
import { NextFunction, Request, Response } from 'express';

const app = PromiseRouter()

const { default: VerifyAuthorization } = require('../middlewares/authorization');
const { default: userAgentParse } = require('../middlewares/useragent');


// http://localhost/catalog/api/shared/bulk/offers?id=559f2ba95f874ec987d0ebfd2cc9c70a&id=ede05b3c97e9475a8d9be91da65750f0&id=3b4c5df9efa5415b941cf74262865e4e&id=4daadb392f1c4ee2b5a3af443e614d2a&id=f5c0e8ab6c9a4530999041e89e9b6934&id=9aa9f44cd8c24652953a1b204755b193&id=e2f25dae43604a839dd6f2c21b675d5e&id=d2da86026c71429a9cf5e76dfd89a1d3&id=e852b1940299435884365cec7dc3a608&id=35759d71512b47e5b2825669f1d9166a&id=c8319a037f9840e8b7549de480efb9c7&id=f05c43f7c1d24f5fbb1a6fa5a5a60edb&id=eb7332137e56427ea8847ee46a0562ce&id=57f0419c4e4a4ea4858b2f37a98d5315&id=41134f4ff35a45a4923604cbb15e487d&id=411a9188ef584588b935b2d4f43a2325&id=992ba7f52f3b40d49a4411fbade69b33&id=ae230025ab0f4b578d605569746233e5&id=b587eca883944eda861a4542e1d4fb6a&id=48e7be9d5a834f498da5799749db5836&id=6d28ba7c952b412d82120efcdcc9c233&id=3c552303884b4d69b9bcd4c410ee0130&id=85125898f3914946a9443bcce4667660&returnItemDetails=false&country=UNKNOWN&locale=en-US
app.get('/api/shared/bulk/offers', VerifyAuthorization(true), userAgentParse(false), async (req, res) => {
    const token = await getClientSession();

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

    if (response.status != 200) {
        res.json(response.data);
        return;
    }

    const starterPackStoreFront = getStarterPackStoreFront();
    const responseData: Record<string, Partial<CatalogOffer>> = response.data;

    const seasonStarterPack = starterPackStoreFront.find(x => x.devName.toLowerCase() == `season ${req.clientInfos.season} starter kit (rmt)`)

    if (seasonStarterPack) {
        const offerData = responseData[seasonStarterPack.appStoreId[1]];
        if (offerData) {
            offerData.expiryDate = '9999-01-01T00:00:00.000Z';
        }
    };

    if (responseData['e2f25dae43604a839dd6f2c21b675d5e']) {
        responseData['e2f25dae43604a839dd6f2c21b675d5e'].expiryDate = '9999-01-01T00:00:00.000Z';
    }

    const extraPacks = extraStarterPacks[req.clientInfos.season];

    if (extraPacks) {
        extraPacks.forEach(appStoreId => {
            const starterPackData = starterPackStoreFront.find(item => item.appStoreId[1] == appStoreId);
            if (responseData[appStoreId]) {
                responseData[appStoreId].expiryDate = '9999-01-01T00:00:00.000Z';
            } else if (starterPackData) {
                responseData[appStoreId] = {
                    "id": appStoreId,
                    "title": starterPackData.title || starterPackData.devName,
                    "description": starterPackData.description || starterPackData.shortDescription,
                    "longDescription": starterPackData.description || starterPackData.shortDescription,
                    "keyImages": [],
                    "categories": [
                        {
                            "path": "addons"
                        },
                        {
                            "path": "testing"
                        },
                        {
                            "path": "addons/durable"
                        },
                        {
                            "path": "applications"
                        }
                    ],
                    "namespace": "fn",
                    "status": "ACTIVE",
                    "creationDate": "2019-08-26T15:49:00.414Z",
                    "lastModifiedDate": "2022-01-11T22:43:21.677Z",
                    "customAttributes": {
                        "publisherName": {
                            "type": "STRING",
                            "value": "Epic Games"
                        },
                        "developerName": {
                            "type": "STRING",
                            "value": "Epic Games"
                        }
                    },
                    "internalName":  starterPackData.devName,
                    "recurrence": "ONCE",
                    "items": [
                        {
                            "id": "818d50d8bef5490495f980dc1ca40374",
                            "keyImages": [],
                            "categories": [],
                            "namespace": "fn",
                            "unsearchable": false
                        }
                    ],
                    "currencyCode": "USD",
                    "currentPrice": 0,
                    "price": 0,
                    "basePrice": 0,
                    "basePriceCurrencyCode": "USD",
                    "recurringPrice": 0,
                    "freeDays": 0,
                    "maxBillingCycles": 0,
                    "seller": {
                        "id": "o-aa83a0a9bc45e98c80c1b1c9d92e9e",
                        "name": "Epic Games"
                    },
                    "viewableDate": "2021-11-11T00:00:00.000Z",
                    "effectiveDate": "2021-11-11T00:00:00.000Z",
                    "expiryDate": '9999-01-01T00:00:00.000Z',
                    "vatIncluded": false,
                    "isCodeRedemptionOnly": true,
                    "isFeatured": false,
                    "taxSkuId": "FN_Currency",
                    "merchantGroup": "FN_MKT",
                    "priceTier": "prod-fn_USD_1999",
                    "urlSlug": "fortnite--dark-reflections",
                    "roleNamesToGrant": [],
                    "tags": [],
                    "purchaseLimit": 1,
                    "ignoreOrder": false,
                    "fulfillToGroup": false,
                    "fraudItemType": "RMT_Offer",
                    "shareRevenue": true,
                    "offerType": "IN_GAME_PURCHASE",
                    "unsearchable": true,
                    "releaseDate": "2021-11-11T00:00:00.000Z",
                    "releaseOffer": "",
                    "title4Sort": starterPackData.title || starterPackData.devName,
                    "selfRefundable": false,
                    "refundType": "NON_REFUNDABLE",
                    "pcReleaseDate": "2019-09-11T13:00:00.000Z",
                    "visibilityType": "IS_LISTED",
                    "currencyDecimals": 2,
                    "alias": starterPackData.title || starterPackData.devName,
                    "allowPurchaseForPartialOwned": true,
                    "shareRevenueWithUnderageAffiliates": true,
                    "platformWhitelist": [],
                    "platformBlacklist": []
                }
            }
        });
    }

    res.json(response.data);
})

const extraStarterPacks: Record<number, string[]> = {
    5: [
        "sam_galaxy_lord"
    ],
    6: [
        "sam_galaxy_lord"
    ],
    7: [
        "sam_ikonic",
        "493dd27f9efa42aa89a25c1400c02a29"
    ],
    8: [
        "sam_ikonic",
        "8e9937437c044c7e9628ae088af4a295"
    ],
    9: [
        "sam_ikonic"
    ],
    10: [
        "sam_ikonic",
        "56ba62d3600d498cb2e01961dbf42927",
        "2eb58adefbba454ba1dab2d530536403",
        "5751d4fec6464315b915bfec8e48b271"
    ],
    11: [
        "0935379349B600E02DC20EA2FA25FC81"
    ]
}

app.use(() => {
    throw errors.neoniteDev.basic.notFound;
})

app.use(
    (err: any, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof ApiError) {
            err.apply(res);
        }
        else if (err.type == 'entity.parse.failed') {
            neoniteDev.internal.jsonParsingFailed.with(err.message).apply(res);
        }
        else {
            console.error(err)
            neoniteDev.internal.serverError.apply(res);
        }
    }
)


module.exports = app;