import { randomUUID } from 'crypto';
import { profile as types } from '../../structs/types';

export const profileId = 'metadata';

export function handle(accountId: string): types.Profile {
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 1,
        wipeNumber: 9,
        accountId: accountId,
        profileId: "metadata",
        version: "remove_edit_permissions_august_2019",
        items: {},
        stats: {
            attributes: {
                inventory_limit_bonus: 0
            }
        },
        commandRevision: 0
    }
}
