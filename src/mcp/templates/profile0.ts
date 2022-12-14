import { randomUUID } from 'crypto';
import { profile as types } from '../../utils/types';

export const profileId = 'profile0';

export function handle(accountId: string): types.Profile {
    const currentTime = new Date().toISOString();
    return {
        created: "2020-12-07T22:34:20.080Z",
        updated: "2022-02-18T17:08:14.880Z",
        rvn: 0,
        wipeNumber: 1,
        accountId: accountId,
        profileId: "profile0",
        version: "neonite_support_online_test_0.6",
        //
        items: {
            [randomUUID()]: {
                templateId: "Quest:homebaseonboarding",
                attributes: {
                    // completed the playable tutorial (set to done since we don't have a gameserver duh)
                    completion_hbonboarding_completezone: 1,
                    // watched the sattelite view scene
                    completion_hbonboarding_watchsatellitecine: 0,
                    // named homebase
                    completion_hbonboarding_namehomebase: 0,
                    quest_state: "Active",
                    creation_time: currentTime,
                    level: -1,
                    item_seen: false,
                    playlists: [],
                    sent_new_notification: true,
                    challenge_bundle_id: "",
                    xp_reward_scalar: 1,
                    challenge_linked_quest_given: "",
                    quest_pool: "",
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
                templateId: "Quest:homebaseonboardingafteroutpost",
                attributes: {
                    quest_state: "Active",
                    // There is an issue where we are not able to purchase a card pack so set to true
                    completion_purchase_card_pack: 0,
                    completion_open_card_pack: 0,
                    completion_hbonboarding_watchoutpostunlock: 1,
                    last_state_change_time: currentTime,
                    max_level_bonus: 0,
                    level: -1,
                    item_seen: false,
                    xp: 0,
                    sent_new_notification: true,
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Quest:homebaseonboardinggrantschematics",
                attributes: {
                    quest_state: "Claimed",
                    completion_questcomplete_outpostquest_t1_l1: 0,
                    last_state_change_time: currentTime,
                    max_level_bonus: 0,
                    level: -1,
                    item_seen: false,
                    xp: 0,
                    sent_new_notification: true,
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Quest:homebasequest_researchpurchase",
                attributes: {
                    quest_state: "Claimed",
                    completion_unlock_skill_tree_researchfortitude: 0,
                    last_state_change_time: currentTime,
                    max_level_bonus: 0,
                    level: -1,
                    item_seen: false,
                    xp: 0,
                    sent_new_notification: true,
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Quest:achievement_craftfirstweapon",
                attributes: {
                    quest_state: "Claimed",
                    completion_custom_craftfirstweapon: 0,
                    level: -1,
                    item_seen: false,
                    playlists: [],
                    sent_new_notification: true,
                    challenge_bundle_id: "",
                    xp_reward_scalar: 1,
                    quest_pool: "",
                    bucket: "",
                    creation_time: currentTime,
                    last_state_change_time: currentTime,
                    challenge_linked_quest_parent: "",
                    challenge_linked_quest_given: "",
                    max_level_bonus: 0,
                    xp: 0,
                    quest_rarity: "uncommon",
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Quest:achievement_protectthesurvivors",
                attributes: {
                    quest_state: "Claimed",
                    completion_custom_protectthesurvivors: 1,
                    creation_time: currentTime,
                    level: -1,
                    item_seen: false,
                    playlists: [],
                    sent_new_notification: true,
                    challenge_bundle_id: "",
                    xp_reward_scalar: 1,
                    challenge_linked_quest_given: "",
                    quest_pool: "",
                    bucket: "",
                    last_state_change_time: currentTime,
                    challenge_linked_quest_parent: "",
                    max_level_bonus: 0,
                    xp: 0,
                    quest_rarity: "uncommon",
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Quest:homebasequest_completeexpedition",
                attributes: {
                    quest_state: "Claimed",
                    last_state_change_time: currentTime,
                    max_level_bonus: 1,
                    level: -1,
                    item_seen: true,
                    xp: 0,
                    sent_new_notification: true,
                    favorite: false,
                    completion_collectexpedition: 1
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Quest:homebasequest_slotfireteamalphaworker",
                attributes: {
                    quest_state: "Claimed",
                    completion_assign_worker_to_fire_squadone: 0,
                    last_state_change_time: currentTime,
                    max_level_bonus: 0,
                    level: -1,
                    item_seen: true,
                    xp: 0,
                    sent_new_notification: true,
                    favorite: false,
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Quest:homebasequest_unlockemtworker",
                attributes: {
                    quest_state: "Claimed",
                    completion_unlock_skill_tree_emtworker: 0,
                    last_state_change_time: currentTime,
                    max_level_bonus: 0,
                    level: -1,
                    item_seen: true,
                    xp: 0,
                    sent_new_notification: true,
                    favorite: false,
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Quest:homebasequest_unlockfireteamalphaworker",
                attributes: {
                    quest_state: "Claimed",
                    completion_unlock_skill_tree_fireteamalpha: 0,
                    last_state_change_time: currentTime,
                    max_level_bonus: 0,
                    level: -1,
                    item_seen: true,
                    xp: 0,
                    sent_new_notification: true,
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Schematic:Gadget_Generic_Turret",
                attributes: {
                    alteration_slots: [
                        {
                            Type: "GameplaySlot",
                            NumSlots: 1
                        },
                        {
                            Type: "AttributeSlot",
                            NumSlots: 1
                        }
                    ],
                    max_level_bonus: 0,
                    level: 1,
                    item_seen: true,
                    alterations: [],
                    xp: 0,
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Schematic:Ammo_EnergyCell",
                attributes: {
                    alteration_slots: [
                        {
                            Type: "GameplaySlot",
                            NumSlots: 1
                        },
                        {
                            Type: "AttributeSlot",
                            NumSlots: 1
                        }
                    ],
                    max_level_bonus: 0,
                    level: 1,
                    item_seen: true,
                    alterations: [],
                    xp: 0,
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Schematic:Ammo_BulletsHeavy",
                attributes: {
                    alteration_slots: [
                        {
                            Type: "GameplaySlot",
                            NumSlots: 1
                        },
                        {
                            Type: "AttributeSlot",
                            NumSlots: 1
                        }
                    ],
                    max_level_bonus: 0,
                    level: 1,
                    item_seen: true,
                    alterations: [],
                    xp: 0,
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Schematic:Ammo_Shells",
                attributes: {
                    alteration_slots: [
                        {
                            Type: "GameplaySlot",
                            NumSlots: 1
                        },
                        {
                            Type: "AttributeSlot",
                            NumSlots: 1
                        }
                    ],
                    max_level_bonus: 0,
                    level: 1,
                    item_seen: true,
                    alterations: [],
                    xp: 0,
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Schematic:Ammo_BulletsLight",
                attributes: {
                    alteration_slots: [
                        {
                            Type: "GameplaySlot",
                            NumSlots: 1
                        },
                        {
                            Type: "AttributeSlot",
                            NumSlots: 1
                        }
                    ],
                    max_level_bonus: 0,
                    level: 1,
                    item_seen: true,
                    alterations: [],
                    xp: 0,
                    favorite: false
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Schematic:Ammo_BulletsMedium",
                attributes: {
                    alteration_slots: [
                        {
                            Type: "GameplaySlot",
                            NumSlots: 1
                        },
                        {
                            Type: "AttributeSlot",
                            NumSlots: 1
                        }
                    ],
                    max_level_bonus: 0,
                    level: 1,
                    item_seen: true,
                    alterations: [],
                    xp: 0,
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
            templateId: "profile_v2",
            attributes: {
                node_costs: {
                    t1_main_nodepage_layer1: {
                        'Token:homebasepoints': 5
                    }
                },
                mission_alert_redemption_record: {
                    lastClaimTimesMap: {
                        General: {
                            missionAlertGUIDs: [
                                "",
                                "",
                                ""
                            ],
                            lastClaimedTimes: [
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z"
                            ]
                        },
                        StormLow: {
                            missionAlertGUIDs: [
                                "",
                                "",
                                "",
                                ""
                            ],
                            lastClaimedTimes: [
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z"
                            ]
                        },
                        Halloween: {
                            missionAlertGUIDs: [
                                "",
                                "",
                                "",
                                "",
                                "",
                                "",
                                "",
                                "",
                                "",
                                ""
                            ],
                            lastClaimedTimes: [
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z"
                            ]
                        },
                        Horde: {
                            missionAlertGUIDs: [
                                "",
                                "",
                                "",
                                "",
                                "",
                                ""
                            ],
                            lastClaimedTimes: [
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z"
                            ]
                        },
                        Storm: {
                            missionAlertGUIDs: [
                                "",
                                "",
                                "",
                                "",
                                "",
                                "",
                                "",
                                "",
                                "",
                                ""
                            ],
                            lastClaimedTimes: [
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z",
                                "2016-11-20T21:27:32.998Z"
                            ]
                        }
                    },
                    oldestClaimIndexForCategory: [
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                twitch: {},
                client_settings: {
                    pinnedQuestInstances: []
                },
                level: 10,
                named_counters: {
                    SubGameSelectCount_Campaign: {
                        current_count: 0,
                        last_incremented_time: ""
                    },
                    SubGameSelectCount_Athena: {
                        current_count: 0,
                        last_incremented_time: ""
                    }
                },
                default_hero_squad_id: "",
                collection_book: {
                    pages: [
                        "CollectionBookPage:pageheroes_commando",
                        "CollectionBookPage:pageheroes_constructor",
                        "CollectionBookPage:pageheroes_ninja",
                        "CollectionBookPage:pageheroes_outlander",
                        "CollectionBookPage:pagepeople_defenders",
                        "CollectionBookPage:pagepeople_survivors",
                        "CollectionBookPage:pagepeople_leads",
                        "CollectionBookPage:pagepeople_uniqueleads",
                        "CollectionBookPage:pagespecial_winter2017_heroes",
                        "CollectionBookPage:pagespecial_halloween2017_heroes",
                        "CollectionBookPage:pagespecial_halloween2017_workers",
                        "CollectionBookPage:pagespecial_chinesenewyear2018_heroes",
                        "CollectionBookPage:pagespecial_springiton2018_people",
                        "CollectionBookPage:pagespecial_stormzonecyber_heroes",
                        "CollectionBookPage:pagespecial_blockbuster2018_heroes",
                        "CollectionBookPage:pagespecial_shadowops_heroes",
                        "CollectionBookPage:pagespecial_roadtrip2018_heroes",
                        "CollectionBookPage:pagespecial_wildwest_heroes",
                        "CollectionBookPage:pagespecial_stormzone_heroes",
                        "CollectionBookPage:pagespecial_scavenger_heroes",
                        "CollectionBookPage:pagemelee_axes_weapons",
                        "CollectionBookPage:pagemelee_axes_weapons_crystal",
                        "CollectionBookPage:pagemelee_clubs_weapons",
                        "CollectionBookPage:pagemelee_clubs_weapons_crystal",
                        "CollectionBookPage:pagemelee_scythes_weapons",
                        "CollectionBookPage:pagemelee_scythes_weapons_crystal",
                        "CollectionBookPage:pagemelee_spears_weapons",
                        "CollectionBookPage:pagemelee_spears_weapons_crystal",
                        "CollectionBookPage:pagemelee_swords_weapons",
                        "CollectionBookPage:pagemelee_swords_weapons_crystal",
                        "CollectionBookPage:pagemelee_tools_weapons",
                        "CollectionBookPage:pagemelee_tools_weapons_crystal",
                        "CollectionBookPage:pageranged_assault_weapons",
                        "CollectionBookPage:pageranged_assault_weapons_crystal",
                        "CollectionBookPage:pageranged_shotgun_weapons",
                        "CollectionBookPage:pageranged_shotgun_weapons_crystal",
                        "CollectionBookPage:page_ranged_pistols_weapons",
                        "CollectionBookPage:page_ranged_pistols_weapons_crystal",
                        "CollectionBookPage:pageranged_snipers_weapons",
                        "CollectionBookPage:pageranged_snipers_weapons_crystal",
                        "CollectionBookPage:pageranged_explosive_weapons",
                        "CollectionBookPage:pagetraps_wall",
                        "CollectionBookPage:pagetraps_ceiling",
                        "CollectionBookPage:pagetraps_floor",
                        "CollectionBookPage:pagespecial_weapons_ranged_medieval",
                        "CollectionBookPage:pagespecial_weapons_ranged_medieval_crystal",
                        "CollectionBookPage:pagespecial_weapons_melee_medieval",
                        "CollectionBookPage:pagespecial_weapons_melee_medieval_crystal",
                        "CollectionBookPage:pagespecial_winter2017_weapons",
                        "CollectionBookPage:pagespecial_winter2017_weapons_crystal",
                        "CollectionBookPage:pagespecial_ratrod_weapons",
                        "CollectionBookPage:pagespecial_ratrod_weapons_crystal",
                        "CollectionBookPage:pagespecial_weapons_ranged_winter2017",
                        "CollectionBookPage:pagespecial_weapons_ranged_winter2017_crystal",
                        "CollectionBookPage:pagespecial_weapons_melee_winter2017",
                        "CollectionBookPage:pagespecial_weapons_melee_winter2017_crystal",
                        "CollectionBookPage:pagespecial_weapons_chinesenewyear2018",
                        "CollectionBookPage:pagespecial_weapons_crystal_chinesenewyear2018",
                        "CollectionBookPage:pagespecial_stormzonecyber_ranged",
                        "CollectionBookPage:pagespecial_stormzonecyber_melee",
                        "CollectionBookPage:pagespecial_stormzonecyber_ranged_crystal",
                        "CollectionBookPage:pagespecial_stormzonecyber_melee_crystal",
                        "CollectionBookPage:pagespecial_blockbuster2018_ranged",
                        "CollectionBookPage:pagespecial_blockbuster2018_ranged_crystal",
                        "CollectionBookPage:pagespecial_roadtrip2018_weapons",
                        "CollectionBookPage:pagespecial_roadtrip2018_weapons_crystal",
                        "CollectionBookPage:pagespecial_weapons_ranged_stormzone2",
                        "CollectionBookPage:pagespecial_weapons_ranged_stormzone2_crystal",
                        "CollectionBookPage:pagespecial_weapons_melee_stormzone2",
                        "CollectionBookPage:pagespecial_weapons_melee_stormzone2_crystal",
                        "CollectionBookPage:pagespecial_hydraulic",
                        "CollectionBookPage:pagespecial_hydraulic_crystal",
                        "CollectionBookPage:pagespecial_scavenger",
                        "CollectionBookPage:pagespecial_scavenger_crystal"
                    ],
                    maxBookXpLevelAchieved: 0
                },
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
                bans: {},
                gameplay_stats: [
                    {
                        statName: "zonescompleted",
                        statValue: 1
                    }
                ],
                inventory_limit_bonus: 100000,
                current_mtx_platform: "Epic",
                weekly_purchases: {},
                daily_purchases: {
                    lastInterval: "2017-08-29T00:00:00.000Z",
                    purchaseList: {
                    }
                },
                mode_loadouts: [
                    {
                        loadoutName: "Default",
                        selectedGadgets: [
                            "",
                            ""
                        ]
                    }
                ],
                in_app_purchases: {
                    receipts: [
                    ],
                    fulfillmentCounts: {
                    },
                    ignoredReceipts: [],
                    refreshTimers: {
                        EpicPurchasingService: {
                            nextEntitlementRefresh: '2022-12-10T20:24:46.024Z'
                        },
                    }
                },
                daily_rewards: {
                    nextDefaultReward: 0,
                    totalDaysLoggedIn: 0,
                    lastClaimDate: "0001-01-01T00:00:00.000Z",
                    additionalSchedules: {
                        founderspackdailyrewardtoken: {
                            rewardsClaimed: 0,
                            claimedToday: true
                        }
                    }
                },
                monthly_purchases: {},
                xp: 0,
                homebase: {
                    townName: "",
                    bannerIconId: "OT11Banner",
                    bannerColorId: "DefaultColor15",
                    flagPattern: -1,
                    flagColor: -1
                },
                packs_granted: 13
            }
        },
        commandRevision: 0
    }
}
