import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import errors from '../../utils/errors'

export const supportedProfiles = [
    'campaign'
]

export async function handle(config: Handleparams, profile: Profile): Promise<mcpResponse> {
    return await profile.generateResponse(config);
}