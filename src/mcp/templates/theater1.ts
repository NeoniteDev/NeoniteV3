import { randomUUID } from 'crypto';
import { profile as types } from '../../utils/types';

export const profileId = 'theater0';

export function handle(accountId: string): types.Profile {
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 0,
        wipeNumber: 1,
        accountId: accountId,
        profileId: "theater1",
        version: "neo_new_theater_dec_2022",
        items: {},
        stats: {
            attributes: {}
        },
        commandRevision: 0
    }
}
