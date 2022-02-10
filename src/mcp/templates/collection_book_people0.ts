import { randomUUID } from 'crypto';
import { profile as types } from '../../structs/types';

export const profileId = 'collection_book_people0';

export function handle(accountId: string): types.Profile {
    return {
        "created": new Date().toISOString(),
        "updated": new Date().toISOString(),
        "rvn": 1,
        "wipeNumber": 9,
        "accountId": accountId,
        "profileId": "collection_book_people0",
        "version": "clawback_promotion_dupe_august_2020",
        "items": {},
        "stats": {
            "attributes": {
                "player_loadout": {},
                "theater_unique_id": "",
                "past_lifetime_zones_completed": 0,
                "last_event_instance_key": "",
                "last_zones_completed": 0,
                "inventory_limit_bonus": 0
            }
        },
        "commandRevision": 0
    }
}
