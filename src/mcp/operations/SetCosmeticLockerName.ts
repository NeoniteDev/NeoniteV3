import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import errors from '../../structs/errors'

export const supportedProfiles = [
    'athena',
    'campaign'
]

interface body {
	lockerItem: string,
	name: string
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

    if (typeof config.body.lockerItem != 'string') {
        throw errors.neoniteDev.mcp.invalidPayload.withMessage('typeof body.lockerItem is not string');
    }

    if (typeof config.body.name != 'string') {
        throw errors.neoniteDev.mcp.invalidPayload.withMessage('typeof body.name is not string');
    }

    const lockerData = await profile.getItem(config.body.lockerItem);

    if (!lockerData) {
        throw errors.neoniteDev.mcp.itemNotFound.with(config.body.lockerItem);
    }

    if (lockerData.templateId.toLowerCase().startsWith('CosmeticLocker')) {
        console.log(lockerData.templateId)
        throw errors.neoniteDev.mcp.itemNotFound.with(config.body.lockerItem);
    }

    await profile.setItemAttribute(config.body.lockerItem, 'locker_name', config.body.name)

    return profile.generateResponse(config);
}