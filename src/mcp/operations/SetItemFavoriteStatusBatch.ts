import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import errors from '../../structs/errors'
import * as Path from 'path';
import { validate, ValidationError } from 'jsonschema';
import * as fs from 'fs'
import { type } from 'os';

interface body {
    itemIds: string[],
    itemFavStatus: (boolean | string | number)[]
}

export const supportedProfiles = [
    'campaign',
    'profile0',
    'athena'
]


const schemaPath = Path.join(__dirname, '../../../resources/schemas/mcp/json/SetItemFavoriteStatusBatch.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))

export async function handle(config: Handleparams<body>): Promise<mcpResponse> {
    const existOrCreated = await ensureProfileExist(config.profileId, config.accountId);

    if (!existOrCreated) {
        throw errors.neoniteDev.mcp.templateNotFound
            .withMessage(`Unable to find template configuration for profile ${config.profileId}`)
            .with(config.profileId)
    }

    const profile = new Profile(config.profileId, config.accountId);
    await profile.init();

    const itemFavStatus = config.body.itemFavStatus.map((x, index) => {
        if (x === null) {
            return false;
        }

        if (typeof (x) == 'boolean') {
            return x;
        }

        if (x == 'true' || x == 'True' || x == 'false' || x == 'False') {
            return x.toLowerCase() == 'true';
        }

        if (typeof (x) == 'number') {
            return x !== 0;
        };

        throw errors.neoniteDev.mcp.invalidPayload
            .withMessage(`Unable to process command mcp.operations.${config.command}.ts.\nInvalid value "${x}" of config.body[${index}].\nValue must be boolean.`)
            .with(`mcp.operations.${config.command}.ts`, `[${x}]`);
    });


    if (itemFavStatus.length !== config.body.itemIds.length) {
        throw errors.neoniteDev.mcp.invalidParameter.withMessage('itemIds and itemFavStatus must match in size');
    }

    const items = await profile.getItems(config.body.itemIds)

    const itemIds = Object.keys(items);

    await profile.setMutliItemAttribute(
        itemIds.map((x, index) => {
            return {
                attributeName: 'favorite',
                attributeValue: itemFavStatus[index],
                itemId: x
            }
        })
    );

    return profile.generateResponse(config);
}