import { randomUUID } from 'crypto';
import { profile as types } from '../../structs/types';

export const profileId = 'outpost0';

export function handle(accountId: string): types.Profile {
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 1,
        wipeNumber: 9,
        accountId: accountId,
        profileId: "outpost0",
        version: "clawback_promotion_dupe_august_2020",
        items: {},
        stats: {
            attributes: {
                inventory_limit_bonus: 0
            }
        },
        commandRevision: 0
    }
}
