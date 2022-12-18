import { randomUUID } from 'crypto';
import { profile as types } from '../../utils/types';

export const profileId = 'common_core';

export function handle(accountId: string): types.Profile {
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 0,
        wipeNumber: 1,
        accountId: accountId,
        profileId: 'common_core',
        items: {
            'Currency:MtxPurchased': {
                attributes: {
                    platform: "EpicPC"
                },
                quantity: 0,
                templateId: "Currency:MtxPurchased"
            }
        },
        stats: {
            attributes: {
                survey_data: {
                    allSurveysMetadata: {
                        numTimesCompleted: 0,
                        lastTimeCompleted: "2016-11-20T21:27:32.998Z"
                    },
                    metadata: {
                    }
                },
                mtx_affiliate: 'neonite',
                current_mtx_platform: "EpicPC",
                mtx_purchase_history: {},
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
        'commandRevision': 0
    }
}
