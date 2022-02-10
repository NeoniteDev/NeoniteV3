import { randomUUID } from 'crypto';
import { profile as types } from '../../structs/types';

export const profileId = 'profile0';

export function handle(accountId: string): types.Profile {
    return {
        "created": new Date().toISOString(),
        "updated": new Date().toISOString(),
        "rvn": 1,
        "wipeNumber": 4,
        "accountId": accountId,
        "profileId": "profile0",
        "version": "ut_base",
        "items": {},
        "stats": {
            "templateId": "profile_v2",
            "attributes": {
                "CountryFlag": "Unreal",
                "GoldStars": 0,
                "login_rewards": {
                    "nextClaimTime": null,
                    "level": 0,
                    "totalDays": 0
                },
                "Avatar": "UT.Avatar.0",
                "inventory_limit_bonus": 0,
                "daily_purchases": {},
                "in_app_purchases": {},
                "LastXPTime": 0,
                "XP": 0,
                "Level": 0,
                "BlueStars": 0,
                "RecentXP": 0,
                "boosts": [],
                "new_items": {}
            }
        },
        "commandRevision": 0
    }
}
