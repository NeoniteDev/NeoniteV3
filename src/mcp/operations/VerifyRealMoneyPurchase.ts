import { mcpResponse, Handleparams, CatalogPurchase, multiUpdate, notification } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import errors from '../../utils/errors'
import { validate, ValidationError } from 'jsonschema';
import { getCatalog, getLastest } from '../../online';
import pendingPurchases from '../../database/local/purchasesController';
import * as crypto from 'crypto';
import * as resources from '../../utils/resources';
import { getStorefronts } from '../../utils/storefront';


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

export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {
    const lastest = await getLastest().catch(x => undefined);
    const catalog = (lastest != undefined && config.clientInfos.CL == lastest.CL) ?
        (await getCatalog())?.storefronts :
        await getStorefronts(config.clientInfos.season, config.clientInfos.friendlyVersion)

    if (!catalog) {
        return profile.generateResponse(config);
    }

    const catalogToOffer = catalog.find(catalog => catalog.catalogEntries.find(x => x.appStoreId.includes(config.body.appStoreId)));

    if (!catalogToOffer) {
        throw errors.neoniteDev.gamecatalog.itemNotFound(config.body.appStoreId).withMessage(`Could not find appStoreId ${config.body.appStoreId}`);
    }

    const offer = catalogToOffer.catalogEntries.find(x => x.appStoreId.includes(config.body.appStoreId));

    if (!offer) {
        throw errors.neoniteDev.gamecatalog.itemNotFound(config.body.appStoreId).withMessage(`Could not find appStoreId ${config.body.appStoreId}`);
    }

    const notifications: notification[] = [];

    var fulfillmentId= crypto.randomUUID().replaceAll('-', '');

    if (offer.fulfillmentIds && offer.fulfillmentIds.length > 0) {
        const inAppPurchases = profile.stats.attributes.in_app_purchases;
        if (!inAppPurchases) throw errors.neoniteDev.internal.dataBaseError;

        inAppPurchases.fulfillmentCounts = {
            ...inAppPurchases.fulfillmentCounts,
            ...offer.fulfillmentIds.reduce((acc, cur) => {
                acc[cur] = 1;
                return acc;
            }, {})
            
        }

        fulfillmentId = offer.fulfillmentIds[0];
        profile.setStat('in_app_purchases', inAppPurchases);
    }

    if (catalogToOffer.name == 'CurrencyStorefront') {
        if (!offer.metaInfo) {
            throw errors.neoniteDev.internal.serverError.withMessage('metaInfo is undefined')
        }

        const MtxQuantity = offer.metaInfo.find(x => x.key == 'MtxQuantity')?.value;
        const MtxBonus = offer.metaInfo.find(x => x.key == 'MtxBonus')?.value;

        if (!MtxQuantity) {
            throw errors.neoniteDev.internal.serverError.withMessage('MtxQuantity is undefined')
        }


        let MtxTotal = parseInt(MtxQuantity)

        if (isNaN(MtxTotal)) {
            throw errors.neoniteDev.internal.serverError.withMessage('MtxTotal is NaN')
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

        if (config.clientInfos.season > 2) {
            profile.addItem(
                crypto.randomUUID(),
                {
                    templateId: 'GiftBox:GB_MakeGood',
                    attributes: {
                        item_seen: false,
                        lootList: [
                            {
                                itemGuid: itemId,
                                itemProfile: config.profileId,
                                itemType: 'Currency:MtxPurchased',
                                quantity: MtxTotal
                            }
                        ],
                        fromAccountId: '',
                        giftedOn: new Date().toISOString(),
                        params: {
                            userMessage: "Thanks for using Neonite"
                        }
                    },
                    quantity: 1
                }
            );
        }

        notifications.push(
            {
                primary: true,
                type: 'CatalogPurchase',
                lootResult: {
                    tierGroupName: 'Fulfillment:/' + crypto.randomUUID().replaceAll('-', ''),
                    items: [
                        {
                            itemGuid: itemId,
                            itemProfile: config.profileId,
                            itemType: "Currency:MtxPurchased",
                            quantity: MtxTotal
                        }
                    ]
                }
            }
        )
        

        return profile.generateResponse(config, notifications);
    } else if (catalogToOffer.name == 'FoundersPack') {
        const fullProfile = await profile.getFullProfile();

        const bHaveCampaignAccess = Object.values(fullProfile.items).findIndex(x => x.templateId.toLowerCase() == 'token:campaignaccess') != -1;

        // sicne FoundersPack doesn't have ItemGrants I have to do this sketchy thing
        if (offer.devName.startsWith('FoundersPack_') && offer.devName.length == 14) {
            const itemId = crypto.randomUUID();
            profile.addItem(
                itemId,
                {
                    templateId: `Token:${offer.devName.toLowerCase()}`,
                    attributes: {
                        max_level_bonus: 0,
                        level: 1,
                        item_seen: false,
                        xp: 0,
                        favorite: false
                    },
                    quantity: 1
                }
            );

            const item2Id = crypto.randomUUID();
            if (!bHaveCampaignAccess) {
                profile.addItem(
                    item2Id,
                    {
                        templateId: `Token:campaignaccess`,
                        attributes: {
                            max_level_bonus: 0,
                            level: 1,
                            item_seen: false,
                            xp: 0,
                            favorite: false
                        },
                        quantity: 1
                    }
                );
            }

            notifications.push(
                {
                    primary: true,
                    type: 'CatalogPurchase',
                    lootResult: {
                        tierGroupName: 'Fulfillment:/' + crypto.randomUUID().replaceAll('-', ''),
                        items: [
                            {
                                itemGuid: itemId,
                                itemProfile: config.profileId,
                                itemType: `Token:${offer.devName.toLowerCase()}`,
                                quantity: 1
                            },
                            ...bHaveCampaignAccess ? [] : [
                                {
                                    itemGuid: item2Id,
                                    itemProfile: config.profileId,
                                    itemType: `Token:campaignaccess`,
                                    quantity: 1
                                }
                            ]
                        ]
                    }
                }
            )
        } else if (!bHaveCampaignAccess) {
            const item2Id = crypto.randomUUID();
            notifications.push(
                {
                    primary: true,
                    type: 'CatalogPurchase',
                    lootResult: {
                        tierGroupName: 'Fulfillment:/' + crypto.randomUUID().replaceAll('-', ''),
                        items: [
                            {
                                itemGuid: item2Id,
                                itemProfile: config.profileId,
                                itemType: `Token:campaignaccess`,
                                quantity: 1
                            }
                        ]
                    }
                }
            )

            profile.addItem(
                item2Id,
                {
                    templateId: `Token:campaignaccess`,
                    attributes: {
                        max_level_bonus: 0,
                        level: 1,
                        item_seen: false,
                        xp: 0,
                        favorite: false
                    },
                    quantity: 1
                }
            );
        }


        return profile.generateResponse(config, notifications);
    }

    const athena = new Profile('athena', config.accountId);
    await athena.init();

    const lootList = offer.itemGrants.map(item => {
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
    });

    const giftBoxId = resources.getOffersGiftBoxes()[offer.offerId] || 'GB_MakeGood';

    notifications.push(
        {
            primary: true,
            type: 'CatalogPurchase',
            lootResult: {
                tierGroupName: 'Fulfillment:/' + fulfillmentId,
                items: lootList
            }
        }
    );

    profile.addItem(
        crypto.randomUUID(),
        {
            templateId: 'GiftBox:' + giftBoxId,
            attributes: {
                item_seen: false,
                lootList: lootList,
                fromAccountId: '',
                giftedOn: new Date().toISOString(),
                params: {
                    userMessage: "Thanks for using Neonite"
                }
            },
            quantity: 1
        }
    );

    return await profile.generateResponse(config, notifications, athena);
}