import { mcpResponse, Handleparams, multiUpdate, notification } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../utils/types';
import errors from '../../utils/errors'
import * as Path from 'path'
import { validate, ValidationError } from 'jsonschema';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { getCatalog } from '../../online';
import { calculatePrice, generateStorefronts, getItem, getAssetType } from '../../utils/storefront';
import * as online from '../../online'
import * as resources from '../../utils/resources';
import { Reward } from '../../types/battlePass';


export const supportedProfiles: types.ProfileID[] = [
    'common_core', 'profile0'
]

interface body {
    "offerId": string,
    "purchaseQuantity"?: number,
    "currency"?: string,
    "currencySubType": string,
    "expectedTotalPrice"?: number,
    "expectedPrice"?: number,
    "gameContext"?: string
}

const validCurrencyType = ['Other', 'RealMoney', 'GameItem', 'MtxCurrency'];

export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {
    const lastest = (await online.getLastest().catch(x => undefined));
    const bIsLastest = lastest && config.clientInfos.CL == lastest.CL;

    const catalog = bIsLastest ? await getCatalog() : { storefronts: resources.getDefaultStorefronts() }

    if (!catalog) {
        throw errors.neoniteDev.internal.serverError;
    }

    if (!validCurrencyType.includes(config.body.currency || 'null')) {
        throw errors.neoniteDev.mcp.invalidPayload
            .withMessage(`Unable to process command mcp.operations.${config.command}.ts.\nInvalid value "${config.body.currency || 'null'}" of config.body["currency"].\nValue must be one of [${validCurrencyType.join(', ')}]`)
            .with(`mcp.operations.${config.command}.ts`, `[${validCurrencyType.join(', ')}]`);
    };


    const battlePassInfo = resources.getBattlePassInfo(config.clientInfos.season);
    const bIsPurchasingBattlePass = [
        `BR.Season${config.clientInfos.season}.BattlePass.01`,
        `BR.Season${config.clientInfos.season}.BattleBundle.01`
    ].includes(config.body.offerId);

    const bIsPurchasingTiers = !bIsPurchasingBattlePass && (
        battlePassInfo.tierOfferId ?
            battlePassInfo.tierOfferId === config.body.offerId :
            `BR.Season${config.clientInfos.season}.SingleTier.01` === config.body.offerId
    )

    if (bIsPurchasingBattlePass) {
        const bIsBattleBundle = config.body.offerId.endsWith('BattleBundle.01');
        
        // Add the tier one items of the battlepass
        const athena = new Profile('athena', config.accountId);
        await athena.init();

        const tiersRewards = battlePassInfo.rewards.filter(x => {
            return x.tier <= (bIsBattleBundle ? 25 : 1);
        });

        const itemsGranted: Parameters<typeof profile['addItems']>[0] = tiersRewards.filter(x => x.item).map(x => {
            return {
                itemId: randomUUID(),
                itemValue: {
                    "templateId": `${getAssetType(x.item)}:${x.item.id}`,
                    "attributes": {
                        "max_level_bonus": 0,
                        "level": 1,
                        "item_seen": false,
                        "xp": 0,
                        "variants": [],
                        "favorite": false
                    },
                    quantity: x.quantity
                }
            }
        })

        if (config.clientInfos.season > 2) {
            const lootList = itemsGranted.map(x => {
                return {
                    itemProfile: x.itemValue.templateId.toLowerCase().startsWith('athena') ? 'athena' : config.profileId,
                    itemType: x.itemValue.templateId,
                    itemGuid: x.itemId,
                    quantity: x.itemValue.quantity
                }
            });

            await profile.addItem(
                randomUUID(),
                {
                    templateId: config.clientInfos.season <= 4 ? "GiftBox:gb_battlepass" : "GiftBox:gb_battlepasspurchased",
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
        }

        athena.setStat('book_purchased', true);
        athena.setStat('book_level', bIsBattleBundle ? 25 : 1);
        athena.setStat('season_match_boost', 50);
        athena.setStat('season_friend_match_boost', 10);

        const inAppPurchases = profile.stats.attributes.in_app_purchases;
        if (!inAppPurchases) throw errors.neoniteDev.internal.dataBaseError;

        inAppPurchases.fulfillmentCounts[`neofulfillment_bpseason${config.clientInfos.season}`] = 1;
        profile.setStat('in_app_purchases', inAppPurchases);

        await athena.addItems(itemsGranted);
        return await profile.generateResponse(config, undefined, athena);
    } else if (bIsPurchasingTiers) {
        // Purchase tier(s)
        const athena = new Profile('athena', config.accountId);
        await athena.init();

        const currentBookLevel = athena.stats.attributes.book_level;


        if (athena.stats.attributes.season_match_boost === undefined||
            !athena.stats.attributes.season_friend_match_boost === undefined ||
            currentBookLevel === undefined
        ) throw errors.neoniteDev.internal.dataBaseError.withMessage('Missing battlepass data. Please report this error on our discord server.');

        if (currentBookLevel >= 100) throw errors.neoniteDev.gamecatalog.invalidParameter.withMessage('You already have the maximum level of the battlepass');

        const newBookLevel = currentBookLevel + (config.body.purchaseQuantity || 1);
        const tiersRewards = battlePassInfo.rewards.filter(x =>
            x.tier > currentBookLevel && x.tier <= newBookLevel
        ).filter(x => {
            if (x.item.id == 'athenaseasonxpboost') {
                //@ts-ignore
                athena.stats.attributes.season_match_boost += x.quantity;
                return false;
            } else if (x.item.id == 'athenaseasonfriendxpboost') {
                //@ts-ignore
                athena.stats.attributes.season_friend_match_boost += x.quantity;
                return false;
            }

            return true;
        }).map(x => {
            return {
                itemId: randomUUID(),
                itemValue: {
                    "templateId": `${getAssetType(x.item)}:${x.item.id}`,
                    "attributes": {
                        "max_level_bonus": 0,
                        "level": 1,
                        "item_seen": false,
                        "xp": 0,
                        "variants": [],
                        "favorite": false
                    },
                    quantity: x.quantity
                }
            };
        })

        const commonItems = tiersRewards.filter(x => {
            return !x.itemValue.templateId.startsWith('Athena') &&
                !x.itemValue.templateId.startsWith('CosmeticVariantToken') &&
                !x.itemValue.templateId.startsWith('AccountResource');
        })

        const athenaItems = tiersRewards.filter(x => {
            return x.itemValue.templateId.startsWith('Athena') ||
                x.itemValue.templateId.startsWith('CosmeticVariantToken') ||
                x.itemValue.templateId.startsWith('AccountResource');
        })

        if (config.clientInfos.season > 2) {
            const lootList = tiersRewards.map(x => {
                const bIsAthena = x.itemValue.templateId.startsWith('Athena') ||
                    x.itemValue.templateId.startsWith('CosmeticVariantToken') ||
                    x.itemValue.templateId.startsWith('AccountResource');

                return {
                    itemProfile: bIsAthena ? 'athena' : config.profileId,
                    itemType: x.itemValue.templateId,
                    itemGuid: randomUUID(),
                    quantity: x.itemValue.quantity
                }
            });

            await profile.addItem(
                randomUUID(),
                {
                    templateId: "GiftBox:gb_battlepass",
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
        }

        profile.addItems(commonItems);
        athena.addItems(athenaItems);

        athena.setStat('season_match_boost', athena.stats.attributes.season_match_boost);
        athena.setStat('season_friend_match_boost', athena.stats.attributes.season_friend_match_boost);
        athena.setStat('book_level', newBookLevel);
        return await profile.generateResponse(config, undefined, athena);
    } else if (config.body.offerId.startsWith('v2:/neoOffer@')) {
        const athenaProfile = new Profile('athena', config.accountId);
        await athenaProfile.init();

        const itemId = config.body.offerId.substring(13);
        const item = await getItem(itemId);

        if (!item) {
            throw errors.neoniteDev.gamecatalog.itemNotFound(config.body.offerId)
        }

        const neoPrice = calculatePrice(item);
        const templateId = `${getAssetType(item)}:${item.id}`
        
        if (
            config.body.expectedTotalPrice != undefined &&
            neoPrice != config.body.expectedTotalPrice
        ) {
            throw errors.neoniteDev.gamecatalog.priceMismatch(config.body.expectedTotalPrice, neoPrice)
        }

        const allItems = Object.values((await athenaProfile.getFullProfile()).items);

        if (allItems.findIndex(x => x.templateId.toLowerCase() == templateId.toLowerCase()) != -1) {
            throw errors.neoniteDev.mcp.operationForbidden
                .withMessage(`item with templateId ${templateId.toLowerCase()} already exist in your profile.`)
                .with(templateId);
        }

        const id = randomUUID();
        athenaProfile.addItem(
            id,
            {
                templateId: templateId,
                attributes: {
                    creation_time: new Date().toISOString(),
                    max_level_bonus: 0,
                    level: 1,
                    item_seen: false,
                    rnd_sel_cnt: 0,
                    xp: 0,
                    variants: [],
                    favorite: false
                },
                quantity: 1
            }
        );

        const notifications: notification[] = [
            {
                type: 'CatalogPurchase',
                primary: true,
                lootResult: {
                    items: [
                        {
                            itemType: templateId,
                            itemGuid: id,
                            itemProfile: 'athena',
                            quantity: 1
                        }
                    ]
                }
            }
        ];

        return profile.generateResponse(config, notifications, athenaProfile);
    }

    const itemStorefront = catalog.storefronts.find(x => x.catalogEntries.some(x => x.offerId == config.body.offerId));
    if (!itemStorefront) throw errors.neoniteDev.gamecatalog.itemNotFound(config.body.offerId)

    const item = itemStorefront.catalogEntries.find(x => x.offerId == config.body.offerId);
    if (!item) throw errors.neoniteDev.gamecatalog.itemNotFound(config.body.offerId)

    const athenaProfile = new Profile('athena', config.accountId);
    await athenaProfile.init();

    if (config.body.currency == 'RealMoney') {
        throw errors.neoniteDev.gamecatalog.invalidParameter;
    };

    const price = item.prices.find(x => x.currencyType == config.body.currency && x.currencySubType == config.body.currencySubType);
    if (!price) {
        throw errors.neoniteDev.gamecatalog.priceNotFound(config.body.currency || 'null', config.body.currencySubType, config.body.offerId)
    }


    const expectedPrice = config.body.expectedPrice || config.body.expectedTotalPrice || 0;
    if (price.finalPrice != expectedPrice) {
        throw errors.neoniteDev.gamecatalog.priceMismatch(config.body.expectedTotalPrice || 0, price.finalPrice)
    }

    //#endregion checking
    const lootResultItems = item.itemGrants.map(x => {
        const profileId = x.templateId.startsWith('Athena') ? 'athena' : config.profileId;
        const id = randomUUID();

        const item: any = {
            templateId: x.templateId,
            attributes: {
                creation_time: new Date().toISOString(),
                max_level_bonus: 0,
                level: 1,
                item_seen: false,
                rnd_sel_cnt: 0,
                xp: 0,
                variants: [],
                favorite: false,
                ...x.attributes
            },
            quantity: x.quantity
        }

        if (itemStorefront.name.toLowerCase() == 'cardpackstore') {
            item.attributes['is_loot_tier_overridden'] = false;
            item.attributes['pack_source'] = "Schedule";
            item.attributes['override_loot_tier'] = "Schedule";
        }

        if (profileId == 'athena') {
            athenaProfile.addItem(
                id,
                item
            );
        } else {
            profile.addItem(
                id,
                item
            );
        }

        return {
            itemType: x.templateId,
            itemGuid: id,
            itemProfile: profileId,
            quantity: x.quantity
        }
    });


    // Tutorial Loot Llama
    if (config.body.offerId == "1F6B613D4B7BAD47D8A93CAEED2C4996") {
        if (!profile.stats.attributes.in_app_purchases)
            throw errors.neoniteDev.internal.dataBaseError.withMessage('missing in_app_purchases stat on profile0');

        const inAppPurchases = profile.stats.attributes.in_app_purchases;

        if ('82ADCC874CFC2D47927208BAE871CF2B' in inAppPurchases.fulfillmentCounts) {
            throw errors.neoniteDev.gamecatalog.purchaseNotAllowed
        }

        if (config.profileId == 'profile0') {
            const questItems = await profile.getItemsByAttribute('completion_purchase_card_pack', 'number');
            const item = questItems[0];
            profile.setMutliItemAttribute(
                [
                    {
                        attributeName: 'completion_purchase_card_pack',
                        attributeValue: 1,
                        itemId: item.itemId
                    },
                    {
                        attributeName: 'completion_open_card_pack',
                        attributeValue: 1,
                        itemId: item.itemId
                    },
                    {
                        attributeName: 'quest_state',
                        attributeValue: 'Claimed',
                        itemId: item.itemId
                    }
                ]
            );
        }

        inAppPurchases.fulfillmentCounts['82ADCC874CFC2D47927208BAE871CF2B'] = 1;
        profile.setStat('in_app_purchases', inAppPurchases);
    }

    const notifications: notification[] = [
        {
            type: 'CatalogPurchase',
            primary: true,
            lootResult: {
                items: lootResultItems
            }
        }
    ];

    return await profile.generateResponse(config, notifications, athenaProfile);
}