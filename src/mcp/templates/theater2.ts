import { randomUUID } from 'crypto';
import { profile as types } from '../../utils/types';

export const profileId = 'theater0';

export function handle(accountId: string): types.Profile {
    const shotgun_standard_c_ore_t01_id = randomUUID();
    const edged_axe_light_c_ore_t01_id = randomUUID();
    return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        rvn: 0,
        wipeNumber: 1,
        accountId: accountId,
        profileId: "theater2",
        version: "neo_new_theater_dec_2022",
        items: {
            [shotgun_standard_c_ore_t01_id]: {
                templateId: "Weapon:wid_shotgun_standard_c_ore_t01",
                attributes: {
                    loadedAmmo: 5,
                    baseClipSize: 5,
                    durability: 125
                },
                quantity: 1
            },
            [edged_axe_light_c_ore_t01_id]: {
                templateId: "Weapon:wid_edged_axe_light_c_ore_t01",
                attributes: {
                    loadedAmmo: 0,
                    durability: 125
                },
                quantity: 1
            },
            [randomUUID()]: {
                templateId: "Ammo:ammodatashells",
                attributes: {},
                quantity: 12
            }
        },
        stats: {
            attributes: {
                player_loadout:  {
                    bPlayerIsNew:  true,
                    primaryQuickBarRecord:  {
                        slots:  [
                            {},
                            {
                                items:  [
                                    shotgun_standard_c_ore_t01_id.replaceAll('-', '').toUpperCase()
                                ]
                            },
                            {
                                items:  [
                                    edged_axe_light_c_ore_t01_id.replaceAll('-', '').toUpperCase()
                                ]
                            },
                            {}
                        ]
                    },
                    zonesCompleted:  0
                },
                last_event_instance_key:  "1metokvkv71f4ha8hru4ocdkhl[0]1CalendarEvent_Persistent_Phoenix_Winterfest"
            }
        },
        commandRevision: 0
    }
}
