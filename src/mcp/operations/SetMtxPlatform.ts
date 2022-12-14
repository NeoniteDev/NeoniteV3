import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../utils/types';
import errors from '../../utils/errors'
import { validate, ValidationError } from 'jsonschema';
import * as resources from '../../utils/resources';


export const supportedProfiles: types.ProfileID[] = [
    'common_core',
]

interface body {
    newPlatform: string
}

export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {
    profile.setStat('current_mtx_platform', config.body.newPlatform || "EpicPC");

    return await profile.generateResponse(config);
}