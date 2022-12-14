import { mcpResponse, Handleparams, notification } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../utils/types';
import errors, { neoniteDev } from '../../utils/errors'

export const supportedProfiles: types.ProfileID[] = [
    'campaign', 'profile0'
]

interface body {
	"questId": string,
	"selectedRewardIndex": number
}

export async function handle(config: Handleparams<body>): Promise<mcpResponse> {
    const existOrCreated = await ensureProfileExist(config.profileId, config.accountId);

    if (!existOrCreated) {
        throw errors.neoniteDev.mcp.templateNotFound
            .withMessage(`Unable to find template configuration for profile ${config.profileId}`)
            .with(config.profileId)
    }

    if (typeof config.body.questId != 'string' || typeof config.body.selectedRewardIndex != 'number') {
        throw errors.neoniteDev.mcp.invalidPayload;
    }

    const profile = new Profile(config.profileId, config.accountId);
    await profile.init();

    profile.setMutliItemAttribute(
        [
            {
                attributeName: 'quest_state',
                attributeValue: 'Claimed',
                itemId: config.body.questId
            },
            {
                attributeName: 'last_state_change_time',
                attributeValue: new Date().toISOString(),
                itemId: config.body.questId
            }
        ]
    );

    return await profile.generateResponse(config);
}