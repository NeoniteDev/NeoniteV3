import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../structs/types';
import errors from '../../structs/errors'
import * as Path from 'path'
import { validate, ValidationError } from 'jsonschema';
import * as fs from 'fs';

const schemaPath = Path.join(__dirname, '../../../resources/schemas/mcp/json/SetMtxPlatform.json');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))

export const supportedProfiles: types.ProfileID[] = [
    'common_core',
]

interface body {
    newPlatform: string
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

    profile.setStat('current_mtx_platform', config.body.newPlatform || "EpicPC");
    return profile.generateResponse(config);
}