import { mcpResponse, Handleparams } from '../operations'
import { ensureProfileExist, Profile } from '../profile'
import errors from '../../structs/errors'
import { loadout, profile as types } from '../../structs/types';

export const supportedProfiles: types.ProfileID[] = [
    'athena',
    'campaign'
]

interface body {
    "lockerItem": string,
    "category": string,
    "itemToSlot": string,
    "slotIndex": number,
    "variantUpdates": unknown[],
    "optLockerUseCountOverride": number
}

const validCategory = [
    'Backpack',
    'VictoryPose',
    'LoadingScreen',
    'Character',
    'Glider', 'Dance',
    'CallingCard',
    'ConsumableEmote',
    'MapMarker',
    'Charm',
    'SkyDiveContrail',
    'Hat',
    'PetSkin',
    'ItemWrap',
    'MusicPack',
    'BattleBus',
    'Pickaxe',
    'VehicleDecoration'
]

export async function handle(config: Handleparams<body>): Promise<mcpResponse> {
    const existOrCreated = await ensureProfileExist(config.profileId, config.accountId);

    if (!existOrCreated) {
        throw errors.neoniteDev.mcp.templateNotFound
            .withMessage(`Unable to find template configuration for profile ${config.profileId}`)
            .with(config.profileId)
    }

    const profile = new Profile(config.profileId, config.accountId);
    await profile.init();

    // since the header is optional
    const clientCmdRvn: number = config.revisions?.find(x =>
        x.profileId == config.profileId
    )?.clientCommandRevision;

    const useCommandRevision = clientCmdRvn != undefined;

    const baseRevision = useCommandRevision ? profile.commandRevision : profile.rvn;
    const clientRevision = useCommandRevision ? clientCmdRvn : config.revision;

    const bIsUpToDate = baseRevision == clientRevision;

    const response: mcpResponse = {
        "profileRevision": profile.rvn,
        "profileId": config.profileId,
        "profileChangesBaseRevision": profile.rvn,
        "profileChanges": [],
        "serverTime": new Date(),
        "profileCommandRevision": profile.commandRevision,
        "responseVersion": 1,
        "command": config.command,
    }

    const lockerItem = await profile.getItem(config.body.lockerItem);

    if (!lockerItem ||
        lockerItem.templateId.split(':').shift() != 'CosmeticLocker'
    ) {
        throw errors.neoniteDev.mcp.itemNotFound
            .withMessage(`Locker item ${config.body.lockerItem} not found`)
            .with(config.body.lockerItem)
    }


    const slotIndex = config.body.slotIndex != undefined ? config.body.slotIndex : 0;
    const slot: types.Category = lockerItem.attributes.locker_slots_data.slots[config.body.category];

    slot.items[slotIndex] = config.body.itemToSlot;


    await profile.setItemAttribute(config.body.lockerItem, 'locker_slots_data', lockerItem.attributes.locker_slots_data);

    response.profileChanges.push(
        {
            changeType: "itemAttrChanged",
            itemId: config.body.lockerItem,
            attributeName: 'locker_slots_data',
            attributeValue: lockerItem.attributes.locker_slots_data
        }
    )

    await profile.bumpRvn(response);

    if (!bIsUpToDate) {
        response.profileChanges = [
            {
                changeType: 'fullProfileUpdate',
                profile: await profile.getFullProfile()
            }
        ]
    }

    return response;
}