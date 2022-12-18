// maybe make it request to the actual API.

import { readFileSync } from "fs";
import { readFile } from "fs/promises";
import * as path from "path";
import { getPastSeasons, season } from "../online";
import { Cosmetic } from "../types/cosmetics";
import { BRShop, CatalogEntry, Storefront } from "./types";
import * as semver from 'semver';
import { compareVersions } from "compare-versions";
import * as resources from './resources'
import { randomUUID } from "crypto";

const starterPackPath = path.join(__dirname, '../../resources/catalog/BRStarterKits.json');
const starterPackContent = JSON.parse(readFileSync(starterPackPath, 'utf-8'));

const cosmetics = resources.getCosmetics();

export function getStarterPackStoreFront(): CatalogEntry[] {
    return starterPackContent;
}

export async function getStorefronts(seasonNum: number, patchVersion: string): Promise<Storefront[]> {
    var battlePassInfo = undefined;
    try {
        battlePassInfo = resources.getBattlePassInfo(seasonNum);
    } catch {
        console.log(`No battle pass info for season ${seasonNum}`);
    }


    return [
        {
            name: "BRStarterKits",
            catalogEntries: seasonNum > 2 ? starterPackContent : []
        },
        ...battlePassInfo == undefined ? [] : [
            {
                name: `BRSeason${seasonNum}`,
                catalogEntries: [
                    {
                        offerId: `BR.Season${seasonNum}.BattlePass.01`,
                        devName: `BR.Season${seasonNum}.BattlePass.01`,
                        offerType: "StaticPrice",
                        prices: [
                            {
                                currencyType: "MtxCurrency",
                                currencySubType: "",
                                regularPrice: seasonNum == 2 ? 1800 : 950,
                                finalPrice: 950,
                                saleType: seasonNum == 2 ? "PercentOff" : undefined,
                                saleExpiration: "9999-12-31T23:59:59.999Z",
                                basePrice: 950
                            }
                        ],
                        categories: [],
                        dailyLimit: -1,
                        weeklyLimit: -1,
                        monthlyLimit: -1,
                        appStoreId: [],
                        requirements: [
                            {
                                requirementType: "DenyOnFulfillment",
                                requiredId: `neofulfillment_bpseason${seasonNum}`,
                                minQuantity: 1
                            }
                        ],
                        metaInfo: [],
                        catalogGroup: "",
                        catalogGroupPriority: 0,
                        sortPriority: 1,
                        title: "Battle Pass",
                        shortDescription: "Season 2 Battle Pass\r\n\r\nPlay to level up your Battle Pass, unlocking up to 65+ rewards worth 12,000 V-Bucks (typically takes 75 to 150 hours of play). Want it all faster? You can use V-Bucks to buy levels any time!",
                        description: "Season 2 Battle Pass\r\n\r\nPlay to level up your Battle Pass, unlocking up to 65+ rewards worth 12,000 V-Bucks (typically takes 75 to 150 hours of play). Want it all faster? You can use V-Bucks to buy levels any time!",
                        displayAssetPath: `/Game/Catalog/DisplayAssets/DA_BR_Season${seasonNum}_BattlePass.DA_BR_Season${seasonNum}_BattlePass`,
                        itemGrants: []
                    },
                    {
                        offerId: battlePassInfo.tierOfferId || `BR.Season${seasonNum}.SingleTier.01`,
                        devName: `BR.Season${seasonNum}.SingleTier.01`,
                        offerType: "StaticPrice",
                        prices: [
                            {
                                currencyType: "MtxCurrency",
                                currencySubType: "",
                                regularPrice: 150,
                                finalPrice: 150,
                                saleExpiration: "9999-12-31T23:59:59.999Z",
                                basePrice: 150
                            }
                        ],
                        categories: [],
                        dailyLimit: -1,
                        weeklyLimit: -1,
                        monthlyLimit: -1,
                        appStoreId: [],
                        requirements: [
                            {
                                requirementType: "RequireFulfillment",
                                requiredId: `neofulfillment_bpseason${seasonNum}`,
                                minQuantity: 1
                            }
                        ],
                        metaInfo: [],
                        catalogGroup: "",
                        catalogGroupPriority: 0,
                        sortPriority: 0,
                        title: "Battle Pass Tier",
                        shortDescription: "Get great rewards now!",
                        description: "Get great rewards now!",
                        displayAssetPath: "",
                        itemGrants: []
                    },
                    ...seasonNum > 2 ? [
                        {
                            offerId: `BR.Season${seasonNum}.BattleBundle.01`,
                            devName: `BR.Season${seasonNum}.BattleBundle.01`,
                            offerType: "StaticPrice",
                            prices: [
                                {
                                    currencyType: "MtxCurrency",
                                    currencySubType: "",
                                    regularPrice: 4700,
                                    finalPrice: 2800,
                                    saleExpiration: "9999-12-31T23:59:59.999Z",
                                    basePrice: 2800,
                                    saleType: "PercentOff"
                                }
                            ],
                            categories: [],
                            dailyLimit: -1,
                            weeklyLimit: -1,
                            monthlyLimit: -1,
                            appStoreId: [],
                            requirements: [
                                {
                                    requirementType: "DenyOnFulfillment",
                                    requiredId: `neofulfillment_bpseason${seasonNum}`,
                                    minQuantity: 1
                                }
                            ],
                            metaInfo: [],
                            catalogGroup: "",
                            catalogGroupPriority: 1,
                            sortPriority: 2,
                            title: "Battle Pass + 25 tiers!",
                            shortDescription: `Season ${seasonNum} Battle Pass + 25 tiers!\r\n\r\nPlay to level up your Battle Pass, unlocking up to 65+ rewards worth 12,000 V-Bucks (typically takes 75 to 150 hours of play). Want it all faster? You can use V-Bucks to buy levels any time!`,
                            description: `Season ${seasonNum} Battle Pass + 25 tiers!\r\n\r\nPlay to level up your Battle Pass, unlocking up to 65+ rewards worth 12,000 V-Bucks (typically takes 75 to 150 hours of play). Want it all faster? You can use V-Bucks to buy levels any time!`,
                            displayAssetPath: `/Game/Catalog/DisplayAssets/DA_BR_Season${seasonNum}_BattlePassWithLevels.DA_BR_Season${seasonNum}_BattlePassWithLevels`,
                            itemGrants: []
                        }
                    ] : []
                ]
            }
        ],
        ...resources.getDefaultStorefronts()
    ]
}

/**
 * 
 * @param seasonNumber the patch number (e.g 1, 6, 19)
 * @param patchVersion season number (e.g 1.8, 9.40, 12.61)
 */
export async function generateStorefronts(seasonNum: number, patchVersion: string): Promise<Storefront[]> {
    const pastSeasons = await getPastSeasons();

    const seasonIndex = pastSeasons.findIndex(x => x.season == seasonNum);

    if (seasonIndex == -1) {
        return resources.getDefaultStorefronts();
    }

    const season = pastSeasons[seasonIndex];
    const patchIndex = season.patchList.findIndex(x => x.version.startsWith(patchVersion));

    const nextPatchDate =
        new Date(season.patchList.length == patchIndex + 1
            ? season.endDate || '2999' : season.patchList[patchIndex + 1].date);

    console.log(nextPatchDate)


    const validCosmetics = cosmetics.filter(x => {
        //if (!x.gameplayTags || !x.gameplayTags.includes('Cosmetics.Source.ItemShop')) return false;
        if (!x.lastAppearance || !x.releaseDate) return false;

        if (seasonNum <= 1 && x.type.id == "emote") {
            return false;
        }

        if (new Date(x.releaseDate).getTime() >= nextPatchDate.getTime()) return false;

        return compareVersions(patchVersion, x.added.version.replace(/[^\d.]/g, '')) >= 0;
    });

    const storeItems = getItems(validCosmetics, seasonNum <= 1)

    console.log(`seasonNum: ${seasonNum}, patchVersion:${patchVersion}`);
    console.log('found a nubmer of valid cosmetics: ' + validCosmetics.length);

    var battlePassInfo = undefined;
    try {
        battlePassInfo = resources.getBattlePassInfo(seasonNum);
    } catch {
        console.log(`No battle pass info for season ${seasonNum}`);
    }

    return [
        {
            name: "BRDailyStorefront",
            catalogEntries: storeItems.daily
        },
        {
            name: "BRSpecialFeatured",
            catalogEntries: storeItems.featured
        },
        {
            name: "BRWeeklyStorefront",
            catalogEntries: storeItems.featured
        },
        {
            name: "BRStarterKits",
            catalogEntries: seasonNum > 2 ? starterPackContent : []
        },
        ...battlePassInfo == undefined ? [] : [
            {
                name: `BRSeason${seasonNum}`,
                catalogEntries: [
                    {
                        offerId: `BR.Season${seasonNum}.BattlePass.01`,
                        devName: `BR.Season${seasonNum}.BattlePass.01`,
                        offerType: "StaticPrice",
                        prices: [
                            {
                                currencyType: "MtxCurrency",
                                currencySubType: "",
                                regularPrice: seasonNum == 2 ? 1800 : 950,
                                finalPrice: 950,
                                saleType: seasonNum == 2 ? "PercentOff" : undefined,
                                saleExpiration: "9999-12-31T23:59:59.999Z",
                                basePrice: 950
                            }
                        ],
                        categories: [],
                        dailyLimit: -1,
                        weeklyLimit: -1,
                        monthlyLimit: -1,
                        appStoreId: [],
                        requirements: [
                            {
                                requirementType: "DenyOnFulfillment",
                                requiredId: `neofulfillment_bpseason${seasonNum}`,
                                minQuantity: 1
                            }
                        ],
                        metaInfo: [],
                        catalogGroup: "",
                        catalogGroupPriority: 0,
                        sortPriority: 1,
                        title: "Battle Pass",
                        shortDescription: "Season 2 Battle Pass\r\n\r\nPlay to level up your Battle Pass, unlocking up to 65+ rewards worth 12,000 V-Bucks (typically takes 75 to 150 hours of play). Want it all faster? You can use V-Bucks to buy levels any time!",
                        description: "Season 2 Battle Pass\r\n\r\nPlay to level up your Battle Pass, unlocking up to 65+ rewards worth 12,000 V-Bucks (typically takes 75 to 150 hours of play). Want it all faster? You can use V-Bucks to buy levels any time!",
                        displayAssetPath: `/Game/Catalog/DisplayAssets/DA_BR_Season${seasonNum}_BattlePass.DA_BR_Season${seasonNum}_BattlePass`,
                        itemGrants: []
                    },
                    {
                        offerId: battlePassInfo.tierOfferId || `BR.Season${seasonNum}.SingleTier.01`,
                        devName: `BR.Season${seasonNum}.SingleTier.01`,
                        offerType: "StaticPrice",
                        prices: [
                            {
                                currencyType: "MtxCurrency",
                                currencySubType: "",
                                regularPrice: 150,
                                finalPrice: 150,
                                saleExpiration: "9999-12-31T23:59:59.999Z",
                                basePrice: 150
                            }
                        ],
                        categories: [],
                        dailyLimit: -1,
                        weeklyLimit: -1,
                        monthlyLimit: -1,
                        appStoreId: [],
                        requirements: [
                            {
                                requirementType: "RequireFulfillment",
                                requiredId: `neofulfillment_bpseason${seasonNum}`,
                                minQuantity: 1
                            }
                        ],
                        metaInfo: [],
                        catalogGroup: "",
                        catalogGroupPriority: 0,
                        sortPriority: 0,
                        title: "Battle Pass Tier",
                        shortDescription: "Get great rewards now!",
                        description: "Get great rewards now!",
                        displayAssetPath: "",
                        itemGrants: []
                    },
                    ...seasonNum > 2 ? [
                        {
                            offerId: `BR.Season${seasonNum}.BattleBundle.01`,
                            devName: `BR.Season${seasonNum}.BattleBundle.01`,
                            offerType: "StaticPrice",
                            prices: [
                                {
                                    currencyType: "MtxCurrency",
                                    currencySubType: "",
                                    regularPrice: 4700,
                                    finalPrice: 2800,
                                    saleExpiration: "9999-12-31T23:59:59.999Z",
                                    basePrice: 2800,
                                    saleType: "PercentOff"
                                }
                            ],
                            categories: [],
                            dailyLimit: -1,
                            weeklyLimit: -1,
                            monthlyLimit: -1,
                            appStoreId: [],
                            requirements: [
                                {
                                    requirementType: "DenyOnFulfillment",
                                    requiredId: `neofulfillment_bpseason${seasonNum}`,
                                    minQuantity: 1
                                }
                            ],
                            metaInfo: [],
                            catalogGroup: "",
                            catalogGroupPriority: 1,
                            sortPriority: 2,
                            title: "Battle Pass + 25 tiers!",
                            shortDescription: `Season ${seasonNum} Battle Pass + 25 tiers!\r\n\r\nPlay to level up your Battle Pass, unlocking up to 65+ rewards worth 12,000 V-Bucks (typically takes 75 to 150 hours of play). Want it all faster? You can use V-Bucks to buy levels any time!`,
                            description: `Season ${seasonNum} Battle Pass + 25 tiers!\r\n\r\nPlay to level up your Battle Pass, unlocking up to 65+ rewards worth 12,000 V-Bucks (typically takes 75 to 150 hours of play). Want it all faster? You can use V-Bucks to buy levels any time!`,
                            displayAssetPath: `/Game/Catalog/DisplayAssets/DA_BR_Season${seasonNum}_BattlePassWithLevels.DA_BR_Season${seasonNum}_BattlePassWithLevels`,
                            itemGrants: []
                        }
                    ] : []
                ]
            }
        ],
        ...resources.getDefaultStorefronts()
    ]
}

function mapItemForStore(item: Cosmetic) {
    const price = calculatePrice(item);
    const templateId = `${getAssetType(item)}:${item.id.toLowerCase()}`

    return {
        "devName": `Neonite Store offering item ${item.id} with for ${price}`,
        "offerId": "v2:/neoOffer@" + item.id,
        "fulfillmentIds": [

        ],
        "dailyLimit": -1,
        "weeklyLimit": -1,
        "monthlyLimit": -1,
        "categories": [
            randomUUID()
        ],
        "prices": [
            {
                "currencyType": "MtxCurrency",
                "currencySubType": "",
                "regularPrice": price,
                "dynamicRegularPrice": price,
                "finalPrice": price,
                "saleExpiration": "9999-12-31T23:59:59.999Z",
                "basePrice": price
            }
        ],
        "meta": {

        },
        "matchFilter": "",
        "filterWeight": 0,
        "appStoreId": [

        ],
        "requirements": [
            {
                "requirementType": "DenyOnItemOwnership",
                "requiredId": templateId,
                "minQuantity": 1
            }
        ],
        "offerType": "StaticPrice",
        "giftInfo": {
            "bIsEnabled": true,
            "forcedGiftBoxTemplateId": "",
            "purchaseRequirements": [

            ],
            "giftRecordIds": [

            ]
        },
        "refundable": true,
        "itemGrants": [
            {
                "templateId": templateId,
                "quantity": 1
            }
        ],
        "additionalGrants": [

        ],
        "sortPriority": 0,
        "catalogGroupPriority": 0
    }
}

export function calculatePrice(item: Cosmetic) {
    switch (item.type.id) {
        case 'outfit': {
            switch (item.rarity.id) {
                case 'Epic': return 1500;
                case 'Rare': return 1200;
                case 'Uncommon': return 800;
                default: return 1200;
            }
        }

        case 'pickaxe': {
            switch (item.rarity.id) {
                case 'Epic': return 1200;
                case 'Rare': return 800;
                case 'Uncommon': return 500;
                default: return 800;
            }
        }


        case 'emote': {
            if (item.id == "EID_WIR") return 0;

            switch (item.rarity.id) {
                case 'Epic': return 800;
                case 'Rare': return 500;
                case 'Uncommon': return 200;
                default: return 500;
            }
        }

        case 'glider': {
            switch (item.rarity.id) {
                case 'Epic': return 1200;
                case 'Rare': return 800;
                case 'Uncommon': return 500;
                default: return 800;
            }
        }

        case 'music': {
            switch (item.rarity.id) {
                case 'Epic': return 600;
                default: return 200;
            }
        }

        default: {
            switch (item.rarity.id) {
                case 'Epic': return 1200;
                case 'Rare': return 800;
                case 'Uncommon': return 500;
                case 'Uncommon': return 200;
                default: return 800;
            }
        }
    }
}

export async function getItem(itemId: string) {
    return cosmetics.find(x => x.id.toLowerCase() == itemId.toLowerCase());
}

export function getAssetType(item: Cosmetic) {
    switch (item.type.id) {
        case 'bannertoken': return 'BannerToken';
        case 'pet': return 'AthenaBackpack';
        case 'outfit': return 'AthenaCharacter';
        case 'battlebus': return 'AthenaBattleBus';
        case 'music': return 'AthenaMusicPack';
        case 'loadingscreen': return 'AthenaLoadingScreen';
        case 'contrail': return 'AthenaSkyDiveContrail';
        case 'wrap': return 'AthenaItemWrap';
        case 'glider': return 'AthenaGlider';
        case 'pickaxe': return 'AthenaPickaxe';
        case 'cosmeticvariant': return 'CosmeticVariantToken';

        case 'spray':
        case 'toy':
        case 'emoji':
        case 'emote': return 'AthenaDance';

        default: {
            const bIsToken = [
                'accountinventorybonus',
                'homebasepoints',
                'athenaseasonxpboost',
                "athenaseasonfriendxpboost",
                "xpboost",
                "founderspack_1",
                "campaignaccess"
            ].includes(item.id.toLowerCase());
            if (bIsToken) return 'token';

            return 'Athena' + item.type.name.replaceAll(' ', '');
        }
    }
}


function getItems(availableItems: Cosmetic[], bIsLegacy: boolean) {
    if (bIsLegacy) {
        const daily = getRandom(availableItems, 6);
        const featured = getRandom(availableItems.filter(x => !daily.includes(x)), 2);

        return {
            featured: featured.map((x, i) => mapItemForStore(x)),
            daily: daily.map((x, i) => mapItemForStore(x))
        }
    }

    const template = getRandom(resources.getStoreTemplate(), 1)[0];

    const daily = Object.entries(template.daily).map(([type, rarities]: [string, Record<string, number>]) => {
        return Object.entries(rarities)
            .filter(([_, i]) => i > 0)
            .map(([rarity, count]) => {
                return getRandom(availableItems.filter(x => x.rarity.id.toLowerCase() == rarity.toLowerCase() && x.type.id.toLowerCase() == type.toLowerCase()), count);
            }).flat();
    }).flat().filter(x => x != null);


    const availableItemsFeatured = availableItems.filter(x => !daily.includes(x));
    const featured = Object.entries(template.featured).map(([type, rarities]: [string, Record<string, number>]) => {
        return Object.entries(rarities)
            .filter(([_, i]) => i > 0)
            .map(([rarity, count]) => {
                return getRandom(availableItemsFeatured.filter(x => x.rarity.id.toLowerCase() == rarity.toLowerCase() && x.type.id.toLowerCase() == type.toLowerCase()), count);
            }).flat();
    }).flat().filter(x => x != null);

    return {
        featured: featured.map(x => mapItemForStore(x)),
        daily: daily.map(x => mapItemForStore(x))
    }
}

// https://stackoverflow.com/a/19270021
function getRandom<T>(array: T[], n: number): T[] {
    // Shuffle array
    const shuffled = array.sort(() => 0.5 - Math.random());

    // Get sub-array of first n elements after shuffled
    return shuffled.slice(0, n);
}