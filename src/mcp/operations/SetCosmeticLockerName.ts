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

    // since the header is optional
    const clientCmdRvn: number | undefined = config.revisions?.find(x =>
        x.profileId == config.profileId
    )?.clientCommandRevision;

    const useCommandRevision = clientCmdRvn != undefined;

    const baseRevision = useCommandRevision ? profile.commandRevision : profile.rvn;
    const clientRevision = useCommandRevision ? clientCmdRvn : config.revision;

    const bIsUpToDate = baseRevision == clientRevision;

    const response: mcpResponse = {
        "profileRevision": profile.rvn,
        "profileId": config.profileId,
        "profileChangesBaseRevision": profile.rvn,
        "profileChanges": [],
        "serverTime": new Date(),
        "profileCommandRevision": profile.commandRevision,
        "responseVersion": 1,
        "command": config.command,
    }

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
    response.profileChanges.push(
        {
            changeType: 'itemAttrChanged',
            attributeName: 'locker_name',
            attributeValue: config.body.name,
            itemId: config.body.lockerItem
        }
    );

    if (response.profileChanges.length > 0) {
        await profile.bumpRvn(response);
    }
    
    if (!bIsUpToDate) {
        response.profileChanges = [
            {
                changeType: 'fullProfileUpdate',
                // @ts-ignore
                profile: await profile.getFullProfile()
            }
        ]
    }

    return response;
}