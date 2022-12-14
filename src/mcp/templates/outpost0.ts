import { randomUUID } from 'crypto';
import { profile as types } from '../../utils/types';

export const profileId = 'outpost0';

export function handle(accountId: string): types.Profile {
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 0,
        wipeNumber: 1,
        accountId: accountId,
        profileId: "outpost0",
        version: "clawback_promotion_dupe_august_2020",
        items: {
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_blastpowder",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_ore_silver",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_ore_alloy",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_crystal_sunbeam",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_ore_obsidian",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_mechanical_parts_t05",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_mechanical_parts_t02",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_rare_powercell",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_resin",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_powder_t05",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_crystal_quartz",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_rare_mechanism",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_nuts_bolts",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 0,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_ore_brightcore",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_planks",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_ore_malachite",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_crystal_shadowshard",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_twine_t05",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_twine_t01",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_batteries",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_twine_t04",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_herbs",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_mechanical_parts_t04",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_ore_copper",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_powder_t03",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_mechanical_parts_t01",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_twine_t02",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_powder_t01",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_duct_tape",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_twine_t03",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_powder_t02",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_bacon",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 0,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_mechanical_parts_t03",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_ore_coal",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_flowers",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ingredient:ingredient_powder_t04",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "WorldItem:wooditemdata",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "WorldItem:stoneitemdata",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "WorldItem:metalitemdata",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Weapon:edittool",
                attributes: {
                    clipSizeScale: 0,
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    baseClipSize: 0,
                    durability: 1,
                    itemSource: ""
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Weapon:buildingitemdata_wall",
                attributes: {
                    clipSizeScale: 0,
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    baseClipSize: 0,
                    durability: 1,
                    itemSource: ""
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Weapon:buildingitemdata_floor",
                attributes: {
                    clipSizeScale: 0,
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    baseClipSize: 0,
                    durability: 1,
                    itemSource: ""
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Weapon:buildingitemdata_stair_w",
                attributes: {
                    clipSizeScale: 0,
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    baseClipSize: 0,
                    durability: 1,
                    itemSource: ""
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Weapon:buildingitemdata_roofs",
                attributes: {
                    clipSizeScale: 0,
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    baseClipSize: 0,
                    durability: 1,
                    itemSource: ""
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Ammo:ammodatabulletsmedium",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ammo:ammodatashells",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: "None"
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ammo:ammodataenergycell",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: ""
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ammo:ammodatabulletsheavy",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: "None"
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ammo:ammodatabulletslight",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: "None"
                },
                quantity: 999
            },
            [randomUUID()]: {
                templateId: "Ammo:ammodataexplosive",
                attributes: {
                    loadedAmmo: 0,
                    inventory_overflow_date: false,
                    level: 0,
                    alterationDefinitions: [],
                    durability: 1,
                    itemSource: "None"
                },
                quantity: 999
            }
        },
        stats: {
            attributes: {
                inventory_limit_bonus: 0
            }
        },
        commandRevision: 0
    }
}
