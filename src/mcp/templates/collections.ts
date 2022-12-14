import { randomUUID } from 'crypto';
import { profile as types } from '../../utils/types';

export const profileId = 'collections';

export function handle(accountId: string): types.Profile {
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 0,
        wipeNumber: 1,
        accountId: accountId,
        profileId: 'collections',
        version: 'season20_2010_fix_fish_collection_incorrect_items_apr_2022',
        items: {
            [randomUUID()]: {
                templateId:  "CollectableCharacter:tandem",
                attributes:  {
                    collected:  [
                        {
                            variantTag:  "AISpawnerData.Type.Tandem.Bushranger",
                            contextTags:  [
                                "Athena.Location.UnNamedPOI.Tandem.RiskyReels"
                            ],
                            properties:  {
                                questsGiven:  0,
                                questsCompleted:  0,
                                encounterTypeFlags:  1
                            },
                            seenState:  "Complete",
                            count:  1
                        }
                    ]
                },
                quantity:  1
            }
        },
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