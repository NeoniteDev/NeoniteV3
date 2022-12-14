import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../utils/types';
import errors from '../../utils/errors'

export const supportedProfiles: types.ProfileID[] = [
    'profile0', 'common_core'
]

interface body {
	codeTokenType: string
}

export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {
    if (!config.body.codeTokenType) {
        throw errors.neoniteDev.internal.validationFailed.with("[codeTokenType]");
    }

    if (typeof config.body.codeTokenType != 'string') {
        throw errors.neoniteDev.mcp.invalidPayload.withMessage('parameter codeTokenType must be a string').with('codeTokenType');
    }

    return await profile.generateResponse(config);
}