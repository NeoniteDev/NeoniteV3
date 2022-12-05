import { randomUUID } from 'crypto';
import { profile as types } from '../../structs/types';

export const profileId = 'theater0';

export function handle(accountId: string): types.Profile {
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 1,
        wipeNumber: 1,
        accountId: accountId,
        profileId: "theater0",
        version: "fix_worker_portrait_name_full_february_2021",
        items: {},
        stats: {
            attributes: {
                inventory_limit_bonus: 0
            }
        },
        commandRevision: 0
    }
}
