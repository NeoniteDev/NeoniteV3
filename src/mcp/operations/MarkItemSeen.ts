import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../utils/types';
import errors from '../../utils/errors'

export const supportedProfiles: types.ProfileID[] = [
    'athena', 'campaign', 'profile0', 'common_public'
]

interface body { 
    itemIds: string[]
}

export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {
    if (!(config.body.itemIds instanceof Array)) {
        throw errors.neoniteDev.mcp.invalidPayload
            .withMessage(`Unable to process command ${config.command}.ts.\nInvalid value "${config.body.itemIds || 'null'}" of config.body["itemIds"].\nValue must String[]`)
            .with(`mcp.operations.${config.command}.ts`, `[${config.body.itemIds}]`);
    }

    if (config.body.itemIds.length > 100) {
        throw errors.neoniteDev.mcp.invalidPayload
            .withMessage(`Unable to process command ${config.command}.ts.\nInvalid value of config.body["itemIds"].\nLenght must less or equal to 100.`)
            .with(`mcp.operations.${config.command}.ts`, `[${config.body.itemIds.length}]`);
    }

    // remove doubles with the Set
    const validItemIds = [...new Set(config.body.itemIds.filter(x => typeof x == 'string'))];

    if (validItemIds.length <= 0) {
        throw errors.neoniteDev.mcp.invalidPayload
            .withMessage(`Unable to process command ${config.command}.ts.\nInvalid value of config.body["itemIds"].\nLenght must be at least 1.`)
            .with(`mcp.operations.${config.command}.ts`, `[${config.body.itemIds.length}]`);
    }

    await profile.setMutliItemAttribute( 
        validItemIds.map(x => {
            return {
                itemId: x,
                attributeName: 'item_seen',
                attributeValue: true
            }
        })
    );

    return await profile.generateResponse(config);
}