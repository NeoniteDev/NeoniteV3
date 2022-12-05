
import { randomUUID } from 'crypto';
import { profile as types } from '../../structs/types';

export const profileId = 'common_public';

export function handle(accountId: string): types.Profile {
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 1,
        wipeNumber: 1,
        accountId: accountId,
        profileId: "common_public",
        version: 'fortnite_start',
        items: {},
        stats: {
            attributes: { banner_color: '', homebase_name: '', banner_icon: '' }
        },
        commandRevision: 0
    }
}
