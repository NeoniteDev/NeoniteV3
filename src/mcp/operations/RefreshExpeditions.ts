import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import errors from '../../structs/errors'

export const supportedProfiles = [
    'profile0'
]

export async function handle(config: Handleparams): Promise<mcpResponse> {
    const existOrCreated = await ensureProfileExist(config.profileId, config.accountId);

    if (!existOrCreated) {
        throw errors.neoniteDev.mcp.templateNotFound
            .withMessage(`Unable to find template configuration for profile ${config.profileId}`)
            .with(config.profileId)
    }

    const profile = new Profile(config.profileId, config.accountId);
    await profile.init();


    return profile.generateResponse(config);
}