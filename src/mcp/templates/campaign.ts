import { randomUUID } from 'crypto';
import { profile as types } from '../../utils/types';

export const profileId = 'campaign';

export function handle(accountId: string): types.Profile {
  const loadout = randomUUID();
  const hero_id = randomUUID();
  const currentTime = new Date().toISOString();

  return {
    created: currentTime,
    updated: currentTime,
    rvn: 0,
    wipeNumber: 1,
    accountId: accountId,
    profileId: "campaign",
    version: "fix_missing_alterations_for_val_march_2021",
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
          creation_time: currentTime,
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
          last_state_change_time: currentTime,
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
        templateId: "Quest:achievement_craftfirstweapon",
        attributes: {
          creation_time: currentTime,
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
        node_costs: {
          research_node_default_page: {
            "Token:collectionresource_nodegatetoken01": 3537002
          },
          homebase_node_default_page: {
            "Token:homebasepoints": 9435858
          }
        },
        use_random_loadout: false,
        mission_alert_redemption_record: {
          claimData: []
        },
        rewards_claimed_post_max_level: 0,
        selected_hero_loadout: "CampaignHeroLoadout1",
        loadouts: [
          "CosmeticLocker:cosmeticlocker_stw",
          "CosmeticLocker:cosmeticlocker_stw_1"
        ],
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
        mfa_reward_claimed: true,
        quest_manager: {
          dailyLoginInterval: "2020-02-05T19:05:26.904Z",
          'dailyQuestRerolls': 1,
          'questPoolStats': {
            'poolStats': [
              {
                poolName: "weeklyquestroll_09",
                nextRefresh: "2020-01-16T00:00:00.000Z",
                rerollsRemaining: 1,
                questHistory: [
                  "Quest:weeklyquest_tiered_completemissionalerts_t10"
                ]
              },
              {
                poolName: "maydaydailyquest_01",
                nextRefresh: "2020-01-19T16:10:14.532Z",
                rerollsRemaining: 1,
                questHistory: [
                  "Quest:maydayquest_2019_daily_complete"
                ]
              },
              {
                poolName: "stormkingdailyquest_01",
                nextRefresh: "2020-02-06T19:05:26.904Z",
                rerollsRemaining: 1,
                questHistory: []
              },
              {
                poolName: "holdfastdaily_part2_01",
                nextRefresh: "2020-02-06T19:05:26.903Z",
                rerollsRemaining: 0,
                questHistory: [
                  "Quest:s11_holdfastquest_d2_soldier",
                  "Quest:s11_holdfastquest_d2_outlander",
                  "Quest:s11_holdfastquest_d2_ninja",
                  "Quest:s11_holdfastquest_d2_ninja",
                  "Quest:s11_holdfastquest_d2_ninja",
                  "Quest:s11_holdfastquest_d2_outlander",
                  "Quest:s11_holdfastquest_d2_ninja",
                  "Quest:s11_holdfastquest_d2_constructor",
                  "Quest:s11_holdfastquest_d2_outlander"
                ]
              },
              {
                poolName: "dailywargamesstonewood_01",
                nextRefresh: "2020-02-06T19:05:26.902Z",
                rerollsRemaining: 1,
                questHistory: []
              },
              {
                poolName: "weeklyquestroll_10",
                nextRefresh: "2020-02-06T00:00:00.000Z",
                rerollsRemaining: 1,
                questHistory: [
                  "Quest:weeklyquest_tiered_completemissionalerts_t12",
                  "Quest:weeklyquest_tiered_completemissionalerts_t12",
                  "Quest:weeklyquest_tiered_completemissionalerts_t11",
                  "Quest:weeklyquest_tiered_completemissionalerts_t12",
                  "Quest:weeklyquest_tiered_completemissionalerts_t11",
                  "Quest:weeklyquest_tiered_completemissionalerts_t12",
                  "Quest:weeklyquest_tiered_completemissionalerts_t11",
                  "Quest:weeklyquest_tiered_completemissionalerts_t11",
                  "Quest:weeklyquest_tiered_completemissionalerts_t11",
                  "Quest:weeklyquest_tiered_completemissionalerts_t11",
                  "Quest:weeklyquest_tiered_completemissionalerts_t11",
                  "Quest:weeklyquest_tiered_completemissionalerts_t12",
                  "Quest:weeklyquest_tiered_completemissionalerts_t12",
                  "Quest:weeklyquest_tiered_completemissionalerts_t12"
                ]
              },
              {
                poolName: "holdfastdaily_part1_01",
                nextRefresh: "2020-02-06T19:05:26.902Z",
                rerollsRemaining: 0,
                questHistory: [
                  "Quest:s11_holdfastquest_d1_construct",
                  "Quest:s11_holdfastquest_d1_cramp",
                  "Quest:s11_holdfastquest_d1_burner",
                  "Quest:s11_holdfastquest_d1_burner",
                  "Quest:s11_holdfastquest_d1_ice",
                  "Quest:s11_holdfastquest_d1_burner",
                  "Quest:s11_holdfastquest_d1_construct",
                  "Quest:s11_holdfastquest_d1_construct",
                  "Quest:s11_holdfastquest_d1_cramp"
                ]
              },
              {
                poolName: "starlightdailyquest_01",
                nextRefresh: "2020-02-06T19:05:26.903Z",
                rerollsRemaining: 1,
                questHistory: []
              },
              {
                poolName: "dailywargamescanny_01",
                nextRefresh: "2020-02-06T19:05:26.901Z",
                rerollsRemaining: 1,
                questHistory: []
              },
              {
                poolName: "dailywargamesplankerton_01",
                nextRefresh: "2020-02-06T19:05:26.901Z",
                rerollsRemaining: 1,
                questHistory: []
              }
            ],
            dailyLoginInterval: "2020-02-05T19:05:26.904Z",
            poolLockouts: {
              poolLockouts: [
                {
                  lockoutName: "Weekly"
                }
              ]
            }
          }
        },
        legacy_research_points_spent: 0,
        gameplay_stats: [
          {
            statName: "zonescompleted",
            statValue: 1
          }
        ],
        permissions: [],
        unslot_mtx_spend: 0,
        twitch: {},
        client_settings: {
          pinnedQuestInstances: []
        },
        research_levels: {
          technology: 120,
          fortitude: 120,
          offense: 120,
          resistance: 120
        },
        level: 309,
        xp_overflow: 0,
        latent_xp_marker: "4977938",
        event_currency: {
          templateId: "AccountResource:eventcurrency_snowballs",
          cf: 9111182
        },
        inventory_limit_bonus: 100000,
        matches_played: 0,
        xp_lost: 0,
        mode_loadouts: [],
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
        last_applied_loadout: "CosmeticLocker:cosmeticlocker_stw_1",
        xp: 0,
        packs_granted: 1056,
        active_loadout_index: 0
      },
    },
    commandRevision: 0
  }
}
