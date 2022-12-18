import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import errors from '../../utils/errors'

export const supportedProfiles = [
    'athena', "campaign"
]

interface body {
    "slotName": string,
    "itemToSlot": string
    "indexWithinSlot"?: number
}

const validSlotNames = ['character', 'backpack', 'pickaxe', 'glider', 'skydivecontrail', 'musicpack', 'loadingscreen', 'dance', 'itemwrap']

export async function handle(config: Handleparams<body>): Promise<mcpResponse> {
    const existOrCreated = await ensureProfileExist(config.profileId, config.accountId);

    if (!existOrCreated) {
        throw errors.neoniteDev.mcp.templateNotFound
            .withMessage(`Unable to find template configuration for profile ${config.profileId}`)
            .with(config.profileId)
    }

    const profile = new Profile(config.profileId, config.accountId);
    await profile.init();

    const slotName = config.body.slotName.toLowerCase();

    if (!validSlotNames.includes(slotName)) {
        throw errors.neoniteDev.mcp.invalidPayload
            .withMessage(`parameter slotName must be within ['character', 'backpack', 'pickaxe', 'glider', 'skydivecontrail', 'musicpack', 'loadingscreen', 'dance', 'itemwraps'].`)
            .with(slotName)
    }

    if (typeof config.body.itemToSlot != 'string') {
        throw errors.neoniteDev.mcp.invalidPayload
            .withMessage(`parameter itemToSlot must be a string`)
            .with(slotName)
    }

    if (config.body.indexWithinSlot != undefined && (typeof config.body.indexWithinSlot != 'number' || config.body.indexWithinSlot > 5 || config.body.indexWithinSlot < 0)) {
        throw errors.neoniteDev.mcp.invalidPayload
            .withMessage(`parameter indexWithinSlot must be a number`)
            .with(slotName)
    }

    const indexWithinSlot = config.body.indexWithinSlot || 0;

    if (config.body.itemToSlot != "") {
        const itemToSlot = await profile.getItem(config.body.itemToSlot);

        if (!itemToSlot) {
            throw errors.neoniteDev.mcp.itemNotFound;
        }
    };

    if (slotName == 'dance') {
        const dances = profile.stats.attributes.favorite_dance;
        dances[indexWithinSlot] = config.body.itemToSlot;
        profile.setStat('favorite_dance', dances);
    } else if (slotName == 'itemwraps') {
        const itemwraps = profile.stats.attributes.favorite_itemwraps;
        if (indexWithinSlot == -1) {
            itemwraps.fill(config.body.itemToSlot)
        } else {
            itemwraps[indexWithinSlot] = config.body.itemToSlot;
        }

        profile.setStat('favorite_itemwraps', itemwraps);
    } else {
        profile.setStat(`favorite_${slotName}`, config.body.itemToSlot);
    }

    return await profile.generateResponse(config);
}