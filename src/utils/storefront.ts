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

const fortniteApiFile = path.join(__dirname, '../../resources/cosmetics.json');




const starterPackPath = path.join(__dirname, '../../resources/catalog/BRStarterKits.json');
const starterPackContent = JSON.parse(readFileSync(starterPackPath, 'utf-8'));

var fileContent: Cosmetic[];

export async function getCosmetics(): Promise<Cosmetic[]> {
    if (fileContent)
        return fileContent;


    fileContent = JSON.parse(await readFile(fortniteApiFile, 'utf-8'));
    return fileContent;
}

export function getStarterPackStoreFront(): CatalogEntry[] {
    return starterPackContent;
}

/**
 * 
 * @param seasonNumber the patch number (e.g 1, 6, 19)
 * @param patchVersion season number (e.g 1.8, 9.40, 12.61)
 */
export async function generateStorefronts(seasonNum: number, patchVersion: string): Promise<Storefront[]> {
    const cosmetics = await getCosmetics();
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

    console.log(`seasonNum: ${seasonNum}, patchVersion:${patchVersion}`);
    console.log('found a nubmer of valid cosmetics: ' + validCosmetics.length);

    const dailyItems = getRandom(validCosmetics, 6);
    const featuredItems = getRandom(validCosmetics.filter(x => !dailyItems.includes(x)), 2);

    const featuredStoreFront = featuredItems.map(x => mapItemForStore(x));
    const dailyStoreFront = dailyItems.map(x => mapItemForStore(x));

    var battlePassInfo = undefined;

    try {
        battlePassInfo = resources.getBattlePassInfo(seasonNum);
    } catch {
        console.log(`No battle pass info for season ${seasonNum}`);
    }

    return [
        {
            name: "BRDailyStorefront",
            catalogEntries: dailyStoreFront
        },
        {
            name: "BRSpecialFeatured",
            catalogEntries: featuredStoreFront
        },
        {
            name: "BRWeeklyStorefront",
            catalogEntries: featuredStoreFront
        },
        {
            name: "BRStarterKits",
            catalogEntries: starterPackContent
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

    const displayAssetPath = `/Game/Catalog/DisplayAssets/DA_Featured_${item.id}.DA_Featured_${item.id}`;

    return {
        devName: `neonite shop offering ${item.name} for ${price} vbucks`,
        offerId: `neoOffer:/${getAssetType(item)}:${item.id}`,
        fulfillmentIds: [],
        dailyLimit: -1,
        weeklyLimit: -1,
        monthlyLimit: -1,
        categories: [
            "Panel 02"
        ],
        prices: [
            {
                currencyType: "MtxCurrency",
                currencySubType: "",
                regularPrice: price,
                dynamicRegularPrice: price,
                finalPrice: price,
                saleExpiration: "9999-12-31T23:59:59.999Z",
                basePrice: price
            }
        ],
        meta: {
            NewDisplayAssetPath: `/Game/Catalog/DisplayAssets/DAv2_${item.id}.DAv2_${item.id}`,
            SectionId: "daily",
            TileSize: "Normal",
            AnalyticOfferGroupId: "1",
            FirstSeen: item.releaseDate ? new Date(item.releaseDate) : undefined,
        },
        matchFilter: "",
        filterWeight: 0.0,
        appStoreId: [],
        requirements: [
            {
                requirementType: "DenyOnItemOwnership",
                requiredId: "AthenaCharacter:cid_029_athena_commando_f_halloween",
                minQuantity: 1
            }
        ],
        offerType: "StaticPrice",
        giftInfo: {
            bIsEnabled: true,
            forcedGiftBoxTemplateId: "",
            purchaseRequirements: [],
            giftRecordIds: []
        },
        refundable: true,
        metaInfo: [
            {
                key: "NewDisplayAssetPath",
                value: `/Game/Catalog/DisplayAssets/DAv2_${item.id}.DAv2_${item.id}`
            },
            {
                key: "SectionId",
                value: "Daily"
            },
            {
                key: "TileSize",
                value: "Normal"
            }
        ],
        displayAssetPath: displayAssetPath,
        itemGrants: [
            {
                templateId: `${getAssetType(item)}:${item.id}`,
                quantity: 1
            }
        ],
        additionalGrants: [],
        sortPriority: -1,
        catalogGroupPriority: 0
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
    const cosmetics = await getCosmetics();

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

// https://stackoverflow.com/a/19270021
function getRandom<T>(arr: T[], n: number): T[] {
    // Shuffle array
    const shuffled = arr.sort(() => 0.5 - Math.random());

    // Get sub-array of first n elements after shuffled
    return shuffled.slice(0, n);;
}