import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import errors from '../../structs/errors'
import * as Path from 'path'
import { validate, ValidationError } from 'jsonschema';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

const schemaPath = Path.join(__dirname, '../../../resources/schemas/mcp/json/CopyCosmeticLoadout.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))

export const supportedProfiles = [
    'athena',
    'campaign'
]

interface body {
    "sourceIndex": number,
    "targetIndex": number,
    "optNewNameForTarget"?: string
}

export async function handle(config: Handleparams<body>): Promise<mcpResponse> {
    const existOrCreated = await ensureProfileExist(config.profileId, config.accountId);

    if (!existOrCreated) {
        throw errors.neoniteDev.mcp.templateNotFound
            .withMessage(`Unable to find template configuration for profile ${config.profileId}`)
            .with(config.profileId)
    }

    const profile = new Profile(config.profileId, config.accountId);
    await profile.init();

    const result = validate(config.body, schema);

    if (!result.valid) {
        const validationErrors = result.errors.filter(x => x instanceof ValidationError)
        const invalidFields = validationErrors.map(x => x.argument).join(', ');
        throw errors.neoniteDev.internal.validationFailed.withMessage(`Validation Failed. Invalid fields were [${invalidFields}]`).with(`[${invalidFields}]`)
    }

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

    return profile.generateResponse(config);
}