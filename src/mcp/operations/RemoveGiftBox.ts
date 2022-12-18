import errors from '../../utils/errors'
import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { validate, ValidationError } from 'jsonschema';
import * as resources from '../../utils/resources';


export const supportedProfiles = '*';

type body = {
    giftBoxItemIds: string[]
    giftBoxItemId: string
}

export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {
    if (config.body.giftBoxItemId) {
        removeGiftBox: {
            const item = await profile.getItem(config.body.giftBoxItemId);
            if (!item) break removeGiftBox;

            const isGiftBox = item.templateId.startsWith('GiftBox:');
            if (!isGiftBox) break removeGiftBox;

            profile.removeItem(config.body.giftBoxItemId);
        }
    } else {
        const giftBoxItemIds: any[] = config.body.giftBoxItemIds;
        const removePromises: Array<Promise<void>> = [];

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