import errors from '../../utils/errors'
import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { validate, ValidationError } from 'jsonschema';
import * as resources from '../../utils/resources';


export const supportedProfiles = '*';

export async function handle(config: Handleparams, profile: Profile): Promise<mcpResponse> {
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

    return await profile.generateResponse(config);
}