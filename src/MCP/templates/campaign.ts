import { randomUUID } from 'crypto';
import { profile as types } from '../../structs/types';

export const profileId = 'campaign';

export function handle(accountId: string): types.Profile {
    const loadout = randomUUID();
    const hero_id = randomUUID();
    
    return {
        created: "2020-12-07T22:34:20.080Z",
        updated: "2021-12-19T01:05:31.755Z",
        rvn: 0,
        wipeNumber: 1,
        accountId: accountId,
        profileId: "campaign",
        version: "fix_missing_alterations_for_val_march_2021",
        items: {
            [hero_id]: {
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
                        commanderslot: hero_id
                    },
                    loadout_index: 0,
                    gadgets: []
                },
                quantity: 1
            },
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
                    creation_time: new Date(),
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
                    last_state_change_time: new Date(),
                    challenge_linked_quest_parent: "",
                    max_level_bonus: 0,
                    xp: 0,
                    quest_rarity: "uncommon",
                    favorite: false
                },
                quantity: 1
            },
            [loadout]: {
                templateId: "CosmeticLocker:cosmeticlocker_stw",
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
            },
            [randomUUID()]: {
                templateId: "Quest:homebaseonboarding",
                attributes: {
                    creation_time: new Date(),
                    level: -1,
                    completion_hbonboarding_completezone: 0,
                    item_seen: false,
                    playlists: [],
                    sent_new_notification: true,
                    challenge_bundle_id: "",
                    xp_reward_scalar: 1,
                    challenge_linked_quest_given: "",
                    quest_pool: "",
                    quest_state: "Active",
                    bucket: "",
                    last_state_change_time: new Date(),
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
                templateId: "Quest:achievement_craftfirstweapon",
                attributes: {
                    creation_time: new Date(),
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
                    last_state_change_time: new Date(),
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
                    loadout,
                ],
                collection_book: {},
                mfa_reward_claimed: false,
                quest_manager: {},
                legacy_research_points_spent: 0,
                gameplay_stats: [],
                permissions: [],
                unslot_mtx_spend: 0,
                twitch: {},
                client_settings: {},
                research_levels: {},
                level: 1,
                xp_overflow: 0,
                latent_xp_marker: 0,
                inventory_limit_bonus: 0,
                matches_played: 0,
                xp_lost: 0,
                mode_loadouts: [],
                last_applied_loadout: loadout,
                daily_rewards: {},
                xp: 0,
                packs_granted: 0,
                active_loadout_index: 0
            }
        },
        commandRevision: 3
    }
}
