import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../utils/types';
import errors from '../../utils/errors'
import * as path from 'path';
import { readFileSync } from 'fs';
import { validate, ValidationError } from 'jsonschema';

export const supportedProfiles: types.ProfileID[] = [
    'common_public', 'profile0'
]

type body = {
    homebaseName: string
}

export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {
    if (typeof config.body.homebaseName != "string") {
        throw errors.neoniteDev.mcp.invalidPayload
            .withMessage(`Unable to process command mcp.operations.${config.command}.ts.\nInvalid value type "${typeof config.body.homebaseName}" of config.body["homebaseName"].\nValue must be of type \`String\``)
            .with(`mcp.operations.${config.command}.ts`, `[${typeof config.body.homebaseName}]`);
    }

    if (config.profileId == 'profile0') {
        // @ts-ignore
        if (!profile.stats.attributes.homebase) {
            profile.stats.attributes.homebase = {
                "townName": config.body.homebaseName,
                "bannerIconId": "OT11Banner",
                "bannerColorId": "DefaultColor15",
                "flagPattern": -1,
                "flagColor": -1
            }

            profile.setStat('homebase', profile.stats.attributes.homebase);
        } else if (profile.stats.attributes.homebase.townName != config.body.homebaseName) {
            profile.stats.attributes.homebase.townName = config.body.homebaseName;
            profile.setStat('homebase', profile.stats.attributes.homebase);
        }
    } else {
        profile.setStat('homebaseName', config.body.homebaseName);
    }


    return await profile.generateResponse(config);
}