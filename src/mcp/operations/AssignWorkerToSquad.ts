import { mcpResponse, Handleparams, notification } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../utils/types';
import errors, { neoniteDev } from '../../utils/errors'

export const supportedProfiles: types.ProfileID[] = [
    'campaign', 'profile0'
]

interface body {
    "characterId": string,
    "squadId": string,
    "slotIndex": number
}

export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {
    if (typeof config.body.characterId != 'string' || typeof config.body.squadId != 'string' || typeof config.body.slotIndex != 'number') {
        throw errors.neoniteDev.mcp.invalidPayload;
    }

    const fullProfile = await profile.getFullProfile();

    const workers = Object.entries(fullProfile.items);

    const attrUpdates: { itemId: string, attributeName: string, attributeValue: any }[] = [];
    const occupyingWorker = workers.find(([id, value]) =>
        value.attributes.squad_id && value.attributes.squad_id.toLowerCase() == config.body.squadId.toLowerCase() && value.attributes.squad_slot_idx == config.body.slotIndex
    );

    if (occupyingWorker && occupyingWorker[0].toLowerCase() != config.body.characterId) {
        attrUpdates.push(
            {
                attributeName: 'squad_id',
                attributeValue: '',
                itemId: occupyingWorker[0]
            },
            {
                attributeName: 'squad_slot_idx ',
                attributeValue: 0,
                itemId: occupyingWorker[0]
            }
        );
    }

    attrUpdates.push(
        {
            attributeName: 'squad_id',
            attributeValue: config.body.squadId,
            itemId: config.body.characterId
        },
        {
            attributeName: 'squad_slot_idx',
            attributeValue: config.body.slotIndex,
            itemId: config.body.characterId
        }
    );

    profile.setMutliItemAttribute(attrUpdates);

    return await profile.generateResponse(config);
}