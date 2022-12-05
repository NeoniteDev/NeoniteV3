import errors from '../../structs/errors'
import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import * as Path from 'path';
import { validate, ValidationError } from 'jsonschema';
import * as fs from 'fs'

const schemaPath = Path.join(__dirname, '../../../resources/schemas/mcp/json/RemoveGiftBox.json');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))

export const supportedProfiles = '*';

export async function handle(config: Handleparams): Promise<mcpResponse> {
    const existOrCreated = await ensureProfileExist(config.profileId, config.accountId);

    if (!existOrCreated) {
        throw errors.neoniteDev.mcp.templateNotFound
            .withMessage(`Unable to find template configuration for profile ${config.profileId}`)
            .with(config.profileId)
    }

    const profile = new Profile(config.profileId, config.accountId);
    await profile.init();
    const result = validate(config.body, schema);

    if (!result.valid) {
        const validationErrors = result.errors.filter(x => x instanceof ValidationError)
        const invalidFields = validationErrors.map(x => x.argument).join(', ');
        throw errors.neoniteDev.internal.validationFailed.withMessage(`Validation Failed. Invalid fields were [${invalidFields}]`).with(`[${invalidFields}]`)
    }

    const giftBoxItemIds: any[] = config.body.giftBoxItemIds;

    const removePromises : Array<Promise<void>> = [];

    if (giftBoxItemIds &&
        giftBoxItemIds instanceof Array &&
        giftBoxItemIds.length > 0
    ) {
        for (let giftBoxItemId of giftBoxItemIds) {
            const item = await profile.getItem(giftBoxItemId);
            if (!item) { continue; }
            const isGiftBox = item.templateId.startsWith('GiftBox:');

            if (isGiftBox) {
                var promise = profile.removeItem(giftBoxItemId);
                removePromises.push(promise);
            }
        }

        await Promise.all(removePromises);
    }

    return profile.generateResponse(config);
}