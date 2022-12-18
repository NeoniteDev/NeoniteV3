import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import errors from '../../utils/errors'

export const supportedProfiles = [
    'athena', "campaign"
]

interface body {
    "loadoutData": [
        {
            "slotName": string,
            "itemToSlot": string,
            "indexWithinSlot": number
        }
    ]
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

    if (config.body.loadoutData.length > 20) {
        throw errors.neoniteDev.mcp.invalidPayload.withMessage(`parameter loadoutData must be an array with a maximum of 20 items.`)
    }


    for (let i = 0; i < config.body.loadoutData.length; i++) {
        const loadout = config.body.loadoutData[i];

        const slotName = loadout.slotName.toLowerCase();
        const indexWithinSlot = loadout.indexWithinSlot || 0;

        if (indexWithinSlot < -1) { throw errors.neoniteDev.mcp.invalidPayload.withMessage(`parameter indexWithinSlot must be a number between -1 and 5`).with(slotName) }

        if (!validSlotNames.includes(slotName)) {
            throw errors.neoniteDev.mcp.invalidPayload
                .withMessage(`parameter slotName must be within ${JSON.stringify(validSlotNames)}.`)
                .with(slotName)
        }

        if (loadout.itemToSlot != "") {
            const itemToSlot = await profile.getItem(loadout.itemToSlot);

            if (!itemToSlot) {
                throw errors.neoniteDev.mcp.itemNotFound.withMessage(`Unable to find item ${loadout.itemToSlot} in profile ${config.profileId}`);
            }
        };

        if (slotName == 'dance') {

            if (indexWithinSlot < -1 || indexWithinSlot > 5)
                throw errors.neoniteDev.mcp.invalidPayload.withMessage(`parameter indexWithinSlot must be a number between -1 and 5`).with(slotName)

            if (indexWithinSlot == -1) {
                profile.stats.attributes.favorite_itemwraps.fill(loadout.itemToSlot)
            } else if (indexWithinSlot >= -1) {
                profile.stats.attributes.favorite_itemwraps[indexWithinSlot] = loadout.itemToSlot;
            }

            profile.stats.attributes.favorite_dance[indexWithinSlot] = loadout.itemToSlot;
            await profile.setStat('favorite_dance', profile.stats.attributes.favorite_dance);

        } else if (slotName == 'itemwraps') {

            if (indexWithinSlot < -1 || indexWithinSlot > 6)
                throw errors.neoniteDev.mcp.invalidPayload.withMessage(`parameter indexWithinSlot must be a number between -1 and 6`).with(slotName)

            if (indexWithinSlot == -1) {
                profile.stats.attributes.favorite_itemwraps.fill(loadout.itemToSlot)
            } else if (indexWithinSlot >= -1) {
                profile.stats.attributes.favorite_itemwraps[indexWithinSlot] = loadout.itemToSlot;
            }

            await profile.setStat('favorite_itemwraps', profile.stats.attributes.favorite_itemwraps);

        } else {
            await profile.setStat(`favorite_${slotName}`, loadout.itemToSlot);
        }
    }

    return await profile.generateResponse(config);
}