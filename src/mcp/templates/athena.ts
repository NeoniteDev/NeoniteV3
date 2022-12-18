import { randomUUID } from 'crypto';
import { profile as types } from '../../utils/types';

import { profiles } from '../../database/local/profilesController';

export const profileId = 'athena';

export function handle(accountId: string): types.Profile {
    const loadout = randomUUID();
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 0,
        wipeNumber: 1,
        accountId: accountId,
        profileId: 'athena',
        items: {
            [loadout]: {
                templateId: "CosmeticLocker:cosmeticlocker_athena",
                attributes: {
                    locker_slots_data: {
                        slots: {
                            Character: {
                                items: new Array(1).fill(null),
                                activeVariants: new Array(1).fill(null)
                            },
                            Backpack: {
                                items: new Array(1).fill(null),
                                activeVariants: new Array(1).fill(null)
                            },
                            Pickaxe: {
                                items: new Array(1).fill(null),
                                activeVariants: new Array(1).fill(null)
                            },
                            Dance: {
                                items: new Array(6).fill(null),
                                activeVariants: new Array(6).fill(null)
                            },
                            ItemWrap: {
                                items: new Array(8).fill(null),
                                activeVariants: new Array(8).fill(null)
                            },
                            Glider: {
                                items: new Array(1).fill(null),
                                activeVariants: new Array(1).fill(null)
                            },
                            SkyDiveContrail: {
                                items: new Array(1).fill(null),
                                activeVariants: new Array(1).fill(null)
                            },
                            LoadingScreen: {
                                items: new Array(1).fill(null),
                                activeVariants: new Array(1).fill(null)
                            },
                            MusicPack: {
                                items: new Array(1).fill(null),
                                activeVariants: new Array(1).fill(null)
                            }
                        }
                    },
                    use_count: 1,
                    banner_icon_template: "galileob",
                    banner_color_template: "standardbanner1",
                    locker_name: "",
                    item_seen: false,
                    favorite: false
                },
                quantity: 1
            }
        },
        stats: {
            attributes: {
                use_random_loadout: false,
                past_seasons: [],
                season_match_boost: 0,
                loadouts: [loadout],
                style_points: 0,
                mfa_reward_claimed: false,
                rested_xp_overflow: 0,
                // @ts-ignore
                quest_manager: {
                    dailyLoginInterval: "2017-12-25T01:44:10.602Z",
                    dailyQuestRerolls: 1,
                    questPoolStats: {
                        poolStats: [],
                        dailyLoginInterval: "2017-12-25T01:44:10.602Z",
                        poolLockouts: {
                            poolLockouts: []
                        }
                    }
                },
                book_level: 1,
                season_num: 19,
                season_update: 1,
                book_xp: 0,
                creative_dynamic_xp: {
                    timespan: 21.362747192382812,
                    bucketXp: 0,
                    bankXp: 0,
                    bankXpMult: 1.0,
                    dailyExcessXpMult: 1.0,
                    currentDayXp: 0,
                    currentDay: -1
                },
                permissions: [],
                battlestars: 0,
                battlestars_season_total: 0,
                alien_style_points: 0,
                party_assist_quest: "",
                lifetime_wins: 4,
                book_purchased: false,
                purchased_battle_pass_tier_offers: {},
                rested_xp_exchange: 0.4,
                level: 1,
                xp_overflow: 0,
                rested_xp: 162000,
                rested_xp_mult: 13.9,
                season_first_tracking_bits: [],
                accountLevel: 172,
                competitive_identity: {},
                inventory_limit_bonus: 0,
                pinned_quest: "",
                last_applied_loadout: loadout,
                // @ts-ignore
                daily_rewards: {},
                xp: 0,
                season_friend_match_boost: 0,
                purchased_bp_offers: [],
                last_match_end_datetime: new Date(0).toISOString(),
                last_stw_accolade_transfer_datetime: new Date(0).toISOString(),
                active_loadout_index: 0,
                favorite_musicpack: "",
                favorite_glider: "",
                favorite_pickaxe: "",
                favorite_skydivecontrail: "",
                favorite_backpack: "",
                favorite_dance: [
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                favorite_itemwraps: [
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                favorite_character: "",
                favorite_loadingscreen: ""
            }
        },
        commandRevision: 0
    };
}
