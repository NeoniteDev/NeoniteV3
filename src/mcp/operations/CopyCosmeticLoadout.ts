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

    // since the header is optional
    const clientCmdRvn: number | undefined = config.revisions?.find(x =>
        x.profileId == config.profileId
    )?.clientCommandRevision;

    const useCommandRevision = clientCmdRvn != undefined;

    const baseRevision = useCommandRevision ? profile.commandRevision : profile.rvn;
    const clientRevision = useCommandRevision ? clientCmdRvn : config.revision;

    const bIsUpToDate = baseRevision == clientRevision;

    const response: mcpResponse = {
        "profileRevision": profile.rvn,
        "profileId": config.profileId,
        "profileChangesBaseRevision": profile.rvn,
        "profileChanges": [],
        "serverTime": new Date(),
        "profileCommandRevision": profile.commandRevision,
        "responseVersion": 1,
        "command": config.command,
    }

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
            response.profileChanges.push(
                {
                    changeType: 'itemAttrChanged',
                    itemId: profile.stats.attributes.loadouts[config.body.targetIndex],
                    attributeName: 'locker_name',
                    attributeValue: config.body.optNewNameForTarget
                }
            );
        }

        await profile.setItemAttribute(profile.stats.attributes.loadouts[config.body.targetIndex], 'locker_slots_data', loadoutToCopy.attributes.locker_slots_data);
        response.profileChanges.push(
            {
                changeType: 'itemAttrChanged',
                itemId: profile.stats.attributes.loadouts[config.body.targetIndex],
                attributeName: 'locker_slots_data',
                attributeValue: loadoutToCopy.attributes.locker_slots_data
            }
        );
    } else {
        const newId = randomUUID();
        profile.stats.attributes.loadouts[config.body.targetIndex] = newId;
        if (config.body.optNewNameForTarget) {
            loadoutToCopy.attributes.locker_name = config.body.optNewNameForTarget;
        }

        await profile.addItem(newId, loadoutToCopy);

        response.profileChanges.push(
            {
                changeType: 'itemAdded',
                itemId: newId,
                item: loadoutToCopy
            }
        );

        await profile.setStat('loadouts', profile.stats.attributes.loadouts.concat([newId]));

        response.profileChanges.push(
            {
                changeType: 'statModified',
                name: 'loadouts',
                value: profile.stats.attributes.loadouts
            }
        );
    }

    if (response.profileChanges.length > 0) {
        await profile.bumpRvn(response);
    }



    if (!bIsUpToDate) {
        response.profileChanges = [
            {
                changeType: 'fullProfileUpdate',
                profile: await profile.getFullProfile()
            }
        ]
    }

    return response;
}