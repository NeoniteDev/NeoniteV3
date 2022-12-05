import { mcpResponse, Handleparams } from '../operations'
import { ensureProfileExist, Profile } from '../profile'
import errors from '../../structs/errors'
import { loadout, profile as types } from '../../structs/types';
import * as Path from 'path';
import { validate, ValidationError, ValidatorResult } from 'jsonschema';
import * as fs from 'fs'

const schemaPath = Path.join(__dirname, '../../../resources/schemas/mcp/json/SetCosmeticLockerSlot.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))

export const supportedProfiles: types.ProfileID[] = [
    'athena',
    'campaign'
]

interface body {
    "lockerItem": string,
    "category": keyof typeof itemsLenghts,
    "itemToSlot"?: string,
    "slotIndex"?: number,
    "variantUpdates"?: { channel: string, active: string, owned: string[] }[],
    "optLockerUseCountOverride"?: number
}

const itemsLenghts = {
    VehicleDecoration: 1,
    Glider: 1,
    Dance: 6,
    LoadingScreen: 1,
    PetSkin: 1,
    Pickaxe: 1,
    Hat: 1,
    MusicPack: 1,
    MapMarker: 1,
    BattleBus: 1,
    Character: 1,
    CallingCard: 1,
    Charm: 4,
    SkyDiveContrail: 1,
    ItemWrap: 8,
    VictoryPose: 1
}

// so typescript wont yell that body is possibly undefined
function validateBody(body: body | undefined, validatorResult: ValidatorResult): body is body {
    return body != undefined && validatorResult.valid;
}

export async function handle(config: Handleparams<body>): Promise<mcpResponse> {
    const existOrCreated = await ensureProfileExist(config.profileId, config.accountId);

    if (!existOrCreated) {
        throw errors.neoniteDev.mcp.templateNotFound
            .withMessage(`Unable to find template configuration for profile ${config.profileId}`)
            .with(config.profileId)
    }

    const profile = new Profile(config.profileId, config.accountId);
    await profile.init();

    const result = validate(config.body, schema);

    if (!result.valid || !validateBody(config.body, result)) {
        const validationErrors = result.errors.filter(x => x instanceof ValidationError)
        const invalidFields = validationErrors.map(x => x.argument).join(', ');
        throw errors.neoniteDev.internal.validationFailed.withMessage(`Validation Failed. Invalid fields were [${invalidFields}]`).with(`[${invalidFields}]`)
    }


    const lockerItem = await profile.getItem(config.body.lockerItem);

    if (!lockerItem ||
        lockerItem.templateId.split(':').shift() != 'CosmeticLocker'
    ) {
        throw errors.neoniteDev.mcp.itemNotFound
            .withMessage(`Locker item ${config.body.lockerItem} not found`)
            .with(config.body.lockerItem)
    }


    const slotIndex = config.body.slotIndex !== undefined ? config.body.slotIndex : 0;
    const itemToSlot = config.body.itemToSlot || null;

    var slot: types.Category | undefined = lockerItem.attributes.locker_slots_data.slots[config.body.category];


    if (!slot || slot.items[slotIndex] != itemToSlot) {
        if (!slot) {
            var nullArr = new Array<null>(itemsLenghts[config.body.category]).fill(null);
            lockerItem.attributes.locker_slots_data.slots[config.body.category] = slot = {
                "items": nullArr,
                "activeVariants": nullArr
            }
        }

        if (slotIndex === -1) {
            slot.items.fill(config.body.itemToSlot || null);
        } else {
            slot.items[slotIndex] = config.body.itemToSlot || null;
        }

        await profile.setItemAttribute(config.body.lockerItem, 'locker_slots_data', lockerItem.attributes.locker_slots_data);
    }
    

    return profile.generateResponse(config);
}