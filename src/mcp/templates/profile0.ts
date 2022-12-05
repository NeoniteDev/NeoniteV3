import { randomUUID } from 'crypto';
import { profile as types } from '../../structs/types';

export const profileId = 'profile0';

export function handle(accountId: string): types.Profile {
    return {
        created: "2020-12-07T22:34:20.080Z",
        updated: "2022-02-18T17:08:14.880Z",
        rvn: 1,
        wipeNumber: 1,
        accountId: accountId,
        profileId: "profile0",
        version: "neonite_support_online_test_0.6",
        items: {
            [randomUUID()]: {
                templateId: "Schematic:ammo_bulletslight",
                attributes: {
                    legacy_alterations: [],
                    max_level_bonus: 0,
                    refund_legacy_item: false,
                    level: 1,
                    item_seen: false,
                    alterations: [],
                    xp: 0,
                    refundable: false,
                    alteration_base_rarities: [],
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Quest:achievement_protectthesurvivors",
                attributes: {
                    creation_time: "2020-12-07T22:34:20.072Z",
                    level: -1,
                    item_seen: false,
                    playlists: [],
                    completion_custom_protectthesurvivors: 0,
                    sent_new_notification: true,
                    challenge_bundle_id: "",
                    xp_reward_scalar: 1,
                    challenge_linked_quest_given: "",
                    quest_pool: "",
                    quest_state: "Active",
                    bucket: "",
                    last_state_change_time: "2020-12-07T22:34:20.072Z",
                    challenge_linked_quest_parent: "",
                    max_level_bonus: 0,
                    xp: 0,
                    quest_rarity: "uncommon",
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CosmeticLocker:cosmeticlocker_stw",
                attributes: {
                    locker_slots_data: {
                        slots: {
                            MusicPack: {
                                items: [
                                    "AthenaMusicPack:musicpack_018_glitter"
                                ]
                            },
                            LoadingScreen: {
                                items: [
                                    "AthenaLoadingScreen:lsid_random"
                                ],
                                activeVariants: [
                                    null
                                ]
                            },
                            Dance: {
                                items: [
                                    "AthenaDance:eid_swimdance",
                                    "AthenaDance:spid_025_crazycastle",
                                    "AthenaDance:eid_boogiedown",
                                    "AthenaDance:eid_dancemoves",
                                    "AthenaDance:eid_respectthepeace",
                                    "AthenaDance:eid_swimdance"
                                ],
                                activeVariants: [
                                    null,
                                    null,
                                    null,
                                    null,
                                    null,
                                    null
                                ]
                            },
                            Pickaxe: {
                                items: [
                                    "AthenaPickaxe:pickaxe_id_stw001_tier_1"
                                ]
                            },
                            ItemWrap: {
                                items: [
                                    "AthenaItemWrap:wrap_098_birthday2019",
                                    "AthenaItemWrap:wrap_098_birthday2019",
                                    "AthenaItemWrap:wrap_098_birthday2019",
                                    "AthenaItemWrap:wrap_098_birthday2019",
                                    "AthenaItemWrap:wrap_098_birthday2019",
                                    "AthenaItemWrap:wrap_098_birthday2019",
                                    "AthenaItemWrap:wrap_098_birthday2019",
                                    "AthenaItemWrap:wrap_098_birthday2019"
                                ],
                                activeVariants: [
                                    null,
                                    null,
                                    null,
                                    null,
                                    null,
                                    null,
                                    null,
                                    null
                                ]
                            },
                            Backpack: {
                                items: [
                                    "AthenaBackpack:bid_stwhero"
                                ]
                            }
                        }
                    },
                    use_count: 0,
                    banner_icon_template: "brskirmishluckyllamas",
                    banner_color_template: "defaultcolor21",
                    locker_name: "",
                    item_seen: false,
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Quest:homebaseonboarding",
                attributes: {
                    creation_time: "2020-12-07T22:34:20.072Z",
                    level: -1,
                    completion_hbonboarding_completezone: 1,
                    item_seen: false,
                    playlists: [],
                    sent_new_notification: true,
                    challenge_bundle_id: "",
                    xp_reward_scalar: 1,
                    challenge_linked_quest_given: "",
                    quest_pool: "",
                    quest_state: "Active",
                    bucket: "",
                    last_state_change_time: "2020-12-07T22:34:20.072Z",
                    challenge_linked_quest_parent: "",
                    max_level_bonus: 0,
                    completion_hbonboarding_namehomebase: 0,
                    completion_hbonboarding_watchsatellitecine: 0,
                    xp: 0,
                    quest_rarity: "uncommon",
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "ConditionalAction:generic_instance",
                attributes: {
                    alt_profile_types: [
                        "athena"
                    ],
                    _private: true,
                    devName: "MAJOR: Holiday - Phoenix",
                    conditions: {
                        event: {
                            instanceId: "1metokvkv71f4ha8hru4ocdkhl[0]1",
                            eventName: "CalendarEvent_Persistent_Phoenix_Winterfest",
                            eventStart: "2021-11-21T00:00:00.000Z",
                            eventEnd: "2022-01-25T00:00:00.000Z",
                            startActions: {
                                hasRun: true,
                                conversions: [],
                                itemsToGrant: [
                                    {
                                        templateId: "Weapon:wid_edged_axe_light_c_ore_t01",
                                        quantity: 1
                                    },
                                    {
                                        templateId: "Weapon:wid_shotgun_standard_c_ore_t01",
                                        quantity: 1
                                    }
                                ],
                                questsToUnpause: []
                            },
                            endActions: {
                                hasRun: false,
                                conversions: [],
                                itemsToRemove: [
                                    {
                                        templateId: "AccountResource:phoenixxp",
                                        quantity: 2147483647
                                    },
                                    {
                                        templateId: "Stat:technology_phoenix",
                                        quantity: 2147483647
                                    },
                                    {
                                        templateId: "Stat:resistance_team_phoenix",
                                        quantity: 2147483647
                                    },
                                    {
                                        templateId: "Stat:fortitude_team_phoenix",
                                        quantity: 2147483647
                                    },
                                    {
                                        templateId: "Stat:offense_team_phoenix",
                                        quantity: 2147483647
                                    },
                                    {
                                        templateId: "Stat:technology_team_phoenix",
                                        quantity: 2147483647
                                    },
                                    {
                                        templateId: "Stat:fortitude_phoenix",
                                        quantity: 2147483647
                                    },
                                    {
                                        templateId: "Stat:offense_phoenix",
                                        quantity: 2147483647
                                    },
                                    {
                                        templateId: "Stat:resistance_phoenix",
                                        quantity: 2147483647
                                    }
                                ],
                                questsToPause: []
                            },
                            metaData: {
                                grantTo: "theater2",
                                endAction: "{\"actionClassName\":\"com.epicgames.fortnite.core.game.managers.calendareventactions.ResetSeasonalTheaterCalendarEventAction\",\"profile\:\"campaign\"}"
                            }
                        }
                    }
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Hero:hid_commando_grenadegun_uc_t01",
                attributes: {
                    outfitvariants: [],
                    backblingvariants: [],
                    gender: 0,
                    level: 1,
                    item_seen: false,
                    squad_slot_idx: -1,
                    portrait: "",
                    hero_name: "DefaultHeroName",
                    max_level_bonus: 0,
                    squad_id: "",
                    mode_loadouts: [],
                    xp: 0,
                    slotted_building_id: "",
                    refundable: false,
                    building_slot_used: -1,
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Quest:achievement_craftfirstweapon",
                attributes: {
                    creation_time: "2020-12-07T22:34:20.072Z",
                    completion_custom_craftfirstweapon: 0,
                    level: -1,
                    item_seen: false,
                    playlists: [],
                    sent_new_notification: true,
                    challenge_bundle_id: "",
                    xp_reward_scalar: 1,
                    challenge_linked_quest_given: "",
                    quest_pool: "",
                    quest_state: "Active",
                    bucket: "",
                    last_state_change_time: "2020-12-07T22:34:20.072Z",
                    challenge_linked_quest_parent: "",
                    max_level_bonus: 0,
                    xp: 0,
                    quest_rarity: "uncommon",
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Schematic:ammo_shells",
                attributes: {
                    legacy_alterations: [],
                    max_level_bonus: 0,
                    refund_legacy_item: false,
                    level: 1,
                    item_seen: false,
                    alterations: [],
                    xp: 0,
                    refundable: false,
                    alteration_base_rarities: [],
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Schematic:sid_assault_auto_c_ore_t00",
                attributes: {
                    legacy_alterations: [],
                    max_level_bonus: 0,
                    refund_legacy_item: false,
                    level: 1,
                    item_seen: false,
                    alterations: [],
                    xp: 0,
                    refundable: false,
                    alteration_base_rarities: [],
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Schematic:ammo_explosive",
                attributes: {
                    legacy_alterations: [],
                    max_level_bonus: 0,
                    refund_legacy_item: false,
                    level: 1,
                    item_seen: false,
                    alterations: [],
                    xp: 0,
                    refundable: false,
                    alteration_base_rarities: [],
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CampaignHeroLoadout:defaultloadout",
                attributes: {
                    loadout_name: "",
                    team_perk: "",
                    crew_members: {
                        followerslot5: "",
                        followerslot4: "",
                        followerslot3: "",
                        followerslot2: "",
                        followerslot1: "",
                        commanderslot: "c2ec0af3-0c33-4b2c-bc54-4658ef7f9f2d"
                    },
                    loadout_index: 0,
                    gadgets: []
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Schematic:ammo_bulletsmedium",
                attributes: {
                    legacy_alterations: [],
                    max_level_bonus: 0,
                    refund_legacy_item: false,
                    level: 1,
                    item_seen: false,
                    alterations: [],
                    xp: 0,
                    refundable: false,
                    alteration_base_rarities: [],
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Schematic:ammo_bulletsheavy",
                attributes: {
                    legacy_alterations: [],
                    max_level_bonus: 0,
                    refund_legacy_item: false,
                    level: 1,
                    item_seen: false,
                    alterations: [],
                    xp: 0,
                    refundable: false,
                    alteration_base_rarities: [],
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "HomebaseNode:startnode_commandcenter",
                attributes: {
                    item_seen: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "ConditionalAction:generic_instance",
                attributes: {
                    alt_profile_types: [
                        "athena"
                    ],
                    _private: true,
                    devName: "STORE: Holiday - Event - Campaign Currency",
                    conditions: {
                        event: {
                            instanceId: "0cvvfkbj6de5p3celsoin89pka[0]1",
                            eventName: "CalendarEvent_Persistent_Holiday_EventCurrency",
                            eventStart: "2021-11-21T00:00:00.000Z",
                            eventEnd: "2022-01-25T00:00:00.000Z",
                            startActions: {
                                hasRun: true,
                                conversions: [],
                                itemsToGrant: [],
                                questsToUnpause: [],
                                eventCurrencyToSet: {
                                    templateId: "AccountResource:eventcurrency_snowballs",
                                    cf: 1.0
                                }
                            },
                            endActions: {
                                hasRun: false,
                                conversions: [
                                    {
                                        recipe: {
                                            static_results: [
                                                {
                                                    templateId: "CardPack:cardpack_event_persistent_holiday",
                                                    quantity: 1
                                                }
                                            ],
                                            static_costs: [
                                                {
                                                    templateId: "AccountResource:eventcurrency_snowballs",
                                                    quantity: 500
                                                }
                                            ],
                                            static_catalysts: []
                                        },
                                        quantity: -1,
                                        convert_remainder_up: true
                                    }
                                ],
                                itemsToRemove: [],
                                questsToPause: [],
                                eventCurrencyToUnset: "AccountResource:eventcurrency_snowballs"
                            },
                            metaData: {}
                        }
                    }
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CosmeticLocker:cosmeticlocker_stw",
                attributes: {
                    locker_slots_data: {
                        slots: {
                            MusicPack: {
                                items: [
                                    "AthenaMusicPack:musicpack_018_glitter"
                                ]
                            },
                            LoadingScreen: {
                                items: [
                                    "AthenaLoadingScreen:lsid_random"
                                ],
                                activeVariants: [
                                    null
                                ]
                            },
                            Dance: {
                                items: [
                                    "AthenaDance:eid_swimdance",
                                    "AthenaDance:spid_025_crazycastle",
                                    "AthenaDance:eid_boogiedown",
                                    "AthenaDance:eid_dancemoves",
                                    "AthenaDance:eid_respectthepeace",
                                    "AthenaDance:eid_swimdance"
                                ],
                                activeVariants: [
                                    null,
                                    null,
                                    null,
                                    null,
                                    null,
                                    null
                                ]
                            },
                            Pickaxe: {
                                items: [
                                    "AthenaPickaxe:pickaxe_id_stw001_tier_1"
                                ]
                            },
                            ItemWrap: {
                                items: [
                                    "AthenaItemWrap:wrap_098_birthday2019",
                                    "AthenaItemWrap:wrap_098_birthday2019",
                                    "AthenaItemWrap:wrap_098_birthday2019",
                                    "AthenaItemWrap:wrap_098_birthday2019",
                                    "AthenaItemWrap:wrap_098_birthday2019",
                                    "AthenaItemWrap:wrap_098_birthday2019",
                                    "AthenaItemWrap:wrap_098_birthday2019",
                                    "AthenaItemWrap:wrap_098_birthday2019"
                                ],
                                activeVariants: [
                                    null,
                                    null,
                                    null,
                                    null,
                                    null,
                                    null,
                                    null,
                                    null
                                ]
                            },
                            Backpack: {
                                items: [
                                    "AthenaBackpack:bid_stwhero"
                                ]
                            }
                        }
                    },
                    use_count: 0,
                    banner_icon_template: "brskirmishluckyllamas",
                    banner_color_template: "defaultcolor21",
                    locker_name: "",
                    item_seen: false,
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "ConditionalAction:generic_instance",
                attributes: {
                    alt_profile_types: [
                        "athena"
                    ],
                    _private: true,
                    devName: "MAJOR: Holiday - Lobby",
                    conditions: {
                        event: {
                            instanceId: "58h1fi5pi9dvl5qk8f18ri9p3g[0]1",
                            eventName: "CalendarEvent_Persistent_LobbyStW_Winterfest",
                            eventStart: "2021-11-21T00:00:00.000Z",
                            eventEnd: "2022-01-25T00:00:00.000Z",
                            startActions: {
                                hasRun: true,
                                conversions: [],
                                itemsToGrant: [],
                                questsToUnpause: []
                            },
                            endActions: {
                                hasRun: false,
                                conversions: [],
                                itemsToRemove: [],
                                questsToPause: []
                            },
                            metaData: {}
                        }
                    }
                },
                quantity: 1
            }
        },
        stats: {
            attributes: {
                node_costs: {},
                use_random_loadout: false,
                mission_alert_redemption_record: {
                    lastClaimedGuidPerTheater: null,
                    lastClaimTimesMap: null
                },
                rewards_claimed_post_max_level: 0,
                loadouts: [
                    "9ab663bf-750a-4210-9d84-f0695426f483",
                    "f584de6f-0bcd-4284-820b-849c57a45b00"
                ],
                collection_book: {
                    
                },
                bans: {},
                mfa_reward_claimed: false,
                quest_manager: {
                    dailyLoginInterval: "2021-12-23T18:14:14.755Z",
                    dailyQuestRerolls: 1
                },
                legacy_research_points_spent: 0,
                gameplay_stats: [],
                permissions: [],
                unslot_mtx_spend: 0,
                twitch: {},
                client_settings: {},
                research_levels: {},
                level: 1,
                current_mtx_platform: 'Epic',
                weekly_purchases: {},
                daily_purchases: {},
                mode_loadouts: [],
                in_app_purchases: {},
                daily_rewards: {},
                monthly_purchases: {},
                named_counters: {
                    SubGameSelectCount_Athena: {
                        current_count: 0
                    },
                    SubGameSelectCount_Campaign: {
                        current_count: 0
                    }
                },
                default_hero_squad_id: '',
                xp_overflow: 0,
                latent_xp_marker: 0,
                packs_granted: 0,
                event_currency: {
                    templateId: "AccountResource:eventcurrency_snowballs",
                    cf: 1.0
                },
                homebase: {
                    bannerColorId: "DefaultColor15",
                    bannerIconId: "OT1Banner",
                    flagColor: -1,
                    flagPattern: -1,
                    townName: "Neonite"
                },
                inventory_limit_bonus: 0,
                matches_played: 0,
                xp_lost: 0,
                last_applied_loadout: "f584de6f-0bcd-4284-820b-849c57a45b00",
                xp: 0,
                active_loadout_index: 0
            }
        },
        commandRevision: 0
    }
}
