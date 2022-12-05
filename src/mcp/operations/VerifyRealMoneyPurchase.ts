import { mcpResponse, Handleparams, CatalogPurchase, multiUpdate, notification } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import errors from '../../structs/errors'
import * as Path from 'path';
import { validate, ValidationError } from 'jsonschema';
import * as fs from 'fs'
import { getCatalog } from '../../online';
import pendingPurchases from '../../database/local/purchasesController';
import { profile } from '../../structs/types';
import * as crypto from 'crypto';

const schemaPath = Path.join(__dirname, '../../../resources/schemas/mcp/json/VerifyRealMoneyPurchase.json');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))


export const supportedProfiles = [
    'common_core',
    'profile0'
]

interface body {
    appStore: "EpicPurchasingService",
    appStoreId: string,
    receiptId: string,
    receiptInfo: string,
    "purchaseCorrelationId": string
}

export async function handle(config: Handleparams<body>): Promise<mcpResponse> {
    const existOrCreated = await ensureProfileExist(config.profileId, config.accountId);

    if (!existOrCreated) {
        throw errors.neoniteDev.mcp.templateNotFound
            .withMessage(`Unable to find template configuration for profile ${config.profileId}`)
            .with(config.profileId)
    }

    const notifications: notification[] = [];
    const profile = new Profile(config.profileId, config.accountId);
    await profile.init();

    const result = validate(config.body, schema);

    if (!result.valid) {
        const validationErrors = result.errors.filter(x => x instanceof ValidationError)
        const invalidFields = validationErrors.map(x => x.argument).join(', ');
        throw errors.neoniteDev.internal.validationFailed.withMessage(`Validation Failed. Invalid fields were [${invalidFields}]`).with(`[${invalidFields}]`)
    }

    const catalog = await getCatalog();

    if (!catalog) {
        return profile.generateResponse(config);
    }

    const catalogToOffer = catalog.storefronts.find(catalog => catalog.catalogEntries.find(x => x.appStoreId.includes(config.body.appStoreId)));

    if (!catalogToOffer) {
        throw errors.neoniteDev.mcp.catalogOutOfDate.with(config.body.appStoreId);
    }

    const offer = catalogToOffer.catalogEntries.find(x => x.appStoreId.includes(config.body.appStoreId));

    if (!offer) {
        throw errors.neoniteDev.mcp.catalogOutOfDate.with(config.body.appStoreId);
    }

    if (catalogToOffer.name == 'CurrencyStorefront') {
        if (!offer.metaInfo) {
            throw errors.neoniteDev.mcp.catalogOutOfDate;
        }

        const MtxQuantity = offer.metaInfo.find(x => x.key == 'MtxQuantity')?.value;
        const MtxBonus = offer.metaInfo.find(x => x.key == 'MtxBonus')?.value;

        if (!MtxQuantity) {
            throw errors.neoniteDev.mcp.catalogOutOfDate;
        }


        let MtxTotal = parseInt(MtxQuantity)

        if (isNaN(MtxTotal)) {
            throw errors.neoniteDev.mcp.catalogOutOfDate;
        }

        if (MtxBonus) {
            let NanPossibleMtxBonus = parseInt(MtxBonus);

            if (!isNaN(NanPossibleMtxBonus)) {
                MtxTotal += NanPossibleMtxBonus;
            }
        }

        const itemId = crypto.randomUUID();
        const itemValue = {
            attributes: {
                platform: "Shared"
            },
            quantity: MtxTotal,
            templateId: "Currency:MtxPurchased"
        };


        profile.addItem(
            itemId,
            itemValue
        );

        notifications.push(
            {
                primary: true,
                type: 'CatalogPurchase',
                lootResult: {
                    tierGroupName: 'Fulfillment:/864A9F524C248D515F8113AED9A6AB91',
                    items: [
                        {
                            itemGuid: itemId,
                            itemProfile: 'common_core',
                            itemType: "Currency:MtxPurchased",
                            quantity: MtxTotal
                        }
                    ]
                }
            }
        )

        profile.setStat('in_app_purchases', {
            "receipts": [
                "EPIC:341b287dbb104d54a9c350e19a53cb4e",
            ],
            "ignoredReceipts": [],
            "fulfillmentCounts": {
                "864A9F524C248D515F8113AED9A6AB91": 1,
            }
        })

        return profile.generateResponse(config, notifications);
    }

    const athena = new Profile('athena', config.accountId);
    await athena.init();

    notifications.push(
        {
            primary: true,
            type: 'CatalogPurchase',
            lootResult: {
                tierGroupName: 'Fulfillment:/864A9F524C248D515F8113AED9A6AB91',
                items: offer.itemGrants.map(item => {
                    const profileId = item.templateId.startsWith('Athena') ? 'athena' : 'common_core';
                    const itemId = crypto.randomUUID();
                    const itemData = {
                        attributes: {
                            level: 1,
                            item_seen: false,
                            rnd_sel_cnt: 0,
                            favorite: false,
                            creation_time: new Date().toISOString(),
                            ...item.attributes
                        },
                        quantity: item.quantity,
                        templateId: item.templateId
                    };

                    if (profileId == 'athena')
                        athena.addItem(itemId, itemData);
                    else
                        profile.addItem(itemId, itemData)


                    return {
                        itemGuid: itemId,
                        itemProfile: profileId,
                        itemType: item.templateId,
                        quantity: item.quantity
                    }
                })
            }
        }
    );

    profile.setStat('in_app_purchases', {
        "receipts": [
            "EPIC:341b287dbb104d54a9c350e19a53cb4e",
        ],
        "ignoredReceipts": [],
        "fulfillmentCounts": {
            "864A9F524C248D515F8113AED9A6AB91": 1,
        }
    })

    return profile.generateResponse(config, notifications, athena);
}