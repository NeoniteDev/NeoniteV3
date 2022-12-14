import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../utils/types';
import errors from '../../utils/errors'
import { validate, ValidationError } from 'jsonschema';
import * as resources from '../../utils/resources';
import { randomUUID } from 'crypto';

export const supportedProfiles: types.ProfileID[] = [
    'campaign', 'profile0'
]

interface body {
    cardPackItemId: string,
    selectionIdx: number
}

export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {
    const cardPackItem = profile.getItem(config.body.cardPackItemId);

    if (!cardPackItem) {
        throw errors.neoniteDev.mcp.itemNotFound.withMessage(`Unable to find card pack ${config.body.cardPackItemId}`)
    }

    const [itemType, itemName] = cardPackItem.templateId.split(':');

    if (itemType != 'CardPack') {
        throw errors.neoniteDev.mcp.wrongItemType(config.body.cardPackItemId, 'card pack');
    }


    const random = Math.random();

    const llamaLoot = getLlamaRandom();

    const lootResult: { itemId: string, itemValue: types.ItemValue }[] = getMultipleRandom(resources.getCampaignItems(), llamaLoot.itemsQuantity).map(x => {
        return {
            itemId: randomUUID(),
            itemValue: {
                templateId: x,
                attributes: {
                    alteration_base_rarities: [],
                    refund_legacy_item: false,
                    legacy_alterations: [],
                    max_level_bonus: 0,
                    refundable: false,
                    item_seen: false,
                    alterations: [],
                    favorite: false,
                    level: 1,
                    xp: 0,
                },
                quantity: 1
            }
        };
    })

    await profile.addItems(lootResult);

    if (cardPackItem.quantity <= 1) {
        profile.removeItem(config.body.cardPackItemId);
    } else {
        console.log('cardPackItem going to changeItemQuantity, Quantity is', cardPackItem.quantity)
        profile.changeItemQuantity(config.body.cardPackItemId, cardPackItem.quantity - 1)
    }

    return await profile.generateResponse(config, [
        {
            type: "cardPackResult",
            lootGranted: {
                tierGroupName: itemName,
                items: lootResult.map(x => {
                    return {
                        itemGuid: x.itemId,
                        attributes: x.itemValue.attributes,
                        itemProfile: config.profileId,
                        itemType: x.itemValue.templateId,
                        quantity: 1
                    }
                })
            },
            displayLevel: llamaLoot.rarity,
            primary: true
        }
    ]);
}

enum DisplayLevel {
    common = 0,
    silver = 1,
    gold = 2,
    storm = 3,
}

function getLlamaRandom(): { rarity: DisplayLevel, itemsQuantity: number } {
    const random = Math.random();

    if (random <= 0.05) return {
        rarity: DisplayLevel.storm,
        itemsQuantity: randomIntFromInterval(20, 30)
    };

    if (random <= 0.10) return {
        rarity: DisplayLevel.gold,
        itemsQuantity: randomIntFromInterval(10, 15)
    };

    if (random <= 0.20) return {
        rarity: DisplayLevel.silver,
        itemsQuantity: randomIntFromInterval(6, 10)
    };

    return {
        rarity: DisplayLevel.common,
        itemsQuantity: randomIntFromInterval(4, 8)
    };
};

// https://stackoverflow.com/a/7228322
function randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}


function getMultipleRandom<T extends any>(arr: T[], num: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());

    return shuffled.slice(0, num);
}