import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import errors from '../../utils/errors'

export const supportedProfiles = [
    'athena',
    'campaign'
]

interface body {
	lockerItem: string,
	name: string
}

export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {

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

    return await profile.generateResponse(config);
}