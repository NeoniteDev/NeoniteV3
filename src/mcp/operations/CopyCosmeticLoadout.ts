import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import errors from '../../utils/errors'
import * as Path from 'path'
import { validate, ValidationError } from 'jsonschema';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import * as resources from '../../utils/resources';

export const supportedProfiles = [
    'athena',
    'campaign'
]

interface body {
    "sourceIndex": number,
    "targetIndex": number,
    "optNewNameForTarget"?: string
}

export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {
    if (config.body.targetIndex > 100 || config.body.sourceIndex > 100 || config.body.targetIndex < 0 || config.body.sourceIndex < 0) {
        throw errors.neoniteDev.mcp.outOfBounds.with(config.body.sourceIndex.toString(), config.body.targetIndex.toString());
    }

    if (!profile.stats.attributes.loadouts) {
        profile.stats.attributes.loadouts = [];
    }

    const loadoutsItemId = profile.stats.attributes.loadouts[config.body.sourceIndex]

    if (!loadoutsItemId) {
        throw errors.neoniteDev.mcp.InvalidLockerSlotIndex.with(config.body.sourceIndex.toString());
    }


    const loadoutToCopy = await profile.getItem(loadoutsItemId);

    if (!loadoutToCopy) {
        throw errors.neoniteDev.mcp.InvalidLockerSlotIndex.with(config.body.sourceIndex.toString());
    }


    if (profile.stats.attributes.loadouts[config.body.targetIndex]) {
        if (config.body.optNewNameForTarget) {
            await profile.setItemAttribute(profile.stats.attributes.loadouts[config.body.targetIndex], 'locker_name', config.body.optNewNameForTarget);
        }

        await profile.setItemAttribute(profile.stats.attributes.loadouts[config.body.targetIndex], 'locker_slots_data', loadoutToCopy.attributes.locker_slots_data);
    } else {
        const newId = randomUUID();
        profile.stats.attributes.loadouts[config.body.targetIndex] = newId;
        if (config.body.optNewNameForTarget) {
            loadoutToCopy.attributes.locker_name = config.body.optNewNameForTarget;
        }

        await profile.addItem(newId, loadoutToCopy);
        await profile.setStat('loadouts', profile.stats.attributes.loadouts.concat([newId]));
    }

    return await profile.generateResponse(config);
}