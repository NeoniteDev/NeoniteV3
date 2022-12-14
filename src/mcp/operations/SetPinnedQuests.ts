import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../utils/types';
import errors from '../../utils/errors'
import { validate, ValidationError } from 'jsonschema';
import * as resources from '../../utils/resources';


export const supportedProfiles: types.ProfileID[] = [
    'campaign', 'outpost0'
]

interface body {
    pinnedQuestIds: string[]
}

export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {
    profile.setStat('client_settings', { pinnedQuestInstances: config.body.pinnedQuestIds })
    return await profile.generateResponse(config);
}