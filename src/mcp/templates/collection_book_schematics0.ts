import { randomUUID } from 'crypto';
import { profile as types } from '../../structs/types';

export const profileId = 'collection_book_schematics0';

export function handle(accountId: string): types.Profile {
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 1,
        wipeNumber: 9,
        accountId: accountId,
        profileId: "collection_book_schematics0",
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
