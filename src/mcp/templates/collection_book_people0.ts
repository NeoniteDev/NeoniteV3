import { randomUUID } from 'crypto';
import { profile as types } from '../../utils/types';

export const profileId = 'collection_book_people0';

export function handle(accountId: string): types.Profile {
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 0,
        wipeNumber: 1,
        accountId: accountId,
        profileId: "collection_book_people0",
        version: "clawback_promotion_dupe_august_2020",
        items: {
            [randomUUID()]: {
                templateId: "CollectionBookPage:pageHeroes_Commando",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:pageHeroes_Constructor",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:pageHeroes_Ninja",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:pageHeroes_Outlander",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:pagePeople_Defenders",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:pagePeople_Survivors",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:pagePeople_Leads",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:pagePeople_UniqueLeads",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:PageSpecial_Winter2017_Heroes",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:PageSpecial_Halloween2017_Heroes",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:PageSpecial_Halloween2017_Workers",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:PageSpecial_ChineseNewYear2018_Heroes",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:PageSpecial_SpringItOn2018_People",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:PageSpecial_StormZoneCyber_Heroes",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:PageSpecial_Blockbuster2018_Heroes",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:PageSpecial_ShadowOps_Heroes",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:PageSpecial_RoadTrip2018_Heroes",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:PageSpecial_WildWest_Heroes",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:PageSpecial_StormZone_Heroes",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "CollectionBookPage:PageSpecial_Scavenger_Heroes",
                attributes: {
                    sectionStates: [

                    ],
                    state: "Active"
                },
                quantity: 1
            }
        },
        stats: {
            attributes: {
                player_loadout: {},
                theater_unique_id: "",
                past_lifetime_zones_completed: 0,
                last_event_instance_key: "",
                last_zones_completed: 0,
                inventory_limit_bonus: 0
            }
        },
        commandRevision: 0
    }
}
