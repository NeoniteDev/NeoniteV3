import { randomUUID } from 'crypto';
import { profile as types } from '../../structs/types';

export const profileId = 'common_core';

export function handle(accountId: string): types.Profile {
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 0,
        wipeNumber: 1,
        accountId: accountId,
        profileId: 'common_core',
        items: {
            'Currency:MtxPurchased': {
                attributes: {
                    platform: "EpicPC"
                },
                quantity: 0,
                templateId: "Currency:MtxPurchased"
            }
        },
        stats: {
            attributes: {
                mtx_affiliate: 'neonite',
                current_mtx_platform: "EpicPC",
                mtx_purchase_history: {}
            }
        },
        'commandRevision': 0
    }
}
