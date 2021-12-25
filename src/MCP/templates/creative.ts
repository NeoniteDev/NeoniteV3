import { randomUUID } from 'crypto';
import { profile as types } from '../../structs/types';

export const profileId = 'creative';

export function handle(accountId: string): types.Profile {
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 1,
        wipeNumber: 1,
        accountId: accountId,
        profileId: 'creative',
        version: 'fix_empty_users_again_july_2019',
        items: {},
        stats: {
            attributes: {
                last_used_battlelab_file: '',
                max_island_plots: 50,
                publish_allowed: false,
                support_code: '',
                last_used_plot: '',
                permissions: [],
                creator_name: '',
                publish_banned: false,
                inventory_limit_bonus: 0
            }
        },
        commandRevision: 0
    }
}
