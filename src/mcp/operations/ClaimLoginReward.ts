import { mcpResponse, Handleparams, notification } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../utils/types';
import errors, { neoniteDev } from '../../utils/errors'
import * as path from 'path';
import { readFileSync } from 'fs';
import { validate, ValidationError } from 'jsonschema';

const loginRewards: { itemType: string, quantity: number }[] = JSON.parse(
    readFileSync(
        path.join(__dirname, '../../../resources/campaign/loginRewards.json'), 'utf-8'
    )
);

export const supportedProfiles: types.ProfileID[] = [
    'campaign', 'profile0'
]

export async function handle(config: Handleparams, profile: Profile): Promise<mcpResponse> {
    const notifications: notification[] = [];

    const daily_rewards = profile.stats.attributes.daily_rewards;
    if (!daily_rewards) throw errors.neoniteDev.internal.dataBaseError;

    const lastClaimDate = new Date(daily_rewards.lastClaimDate);
    const daySinceLastClaim = (Date.now() - lastClaimDate.getTime()) / (1000 * 3600 * 24)

    if (daySinceLastClaim >= 1) {
        daily_rewards.nextDefaultReward++;
        daily_rewards.totalDaysLoggedIn++;
        daily_rewards.additionalSchedules.founderspackdailyrewardtoken.rewardsClaimed++;
        daily_rewards.lastClaimDate = new Date().toISOString();

        profile.setStat('daily_rewards', daily_rewards);
        notifications.push(
            {
                type: 'daily_rewards',
                daysLoggedIn: daily_rewards.totalDaysLoggedIn,
                // totalDaysLoggedIn modulo 336 because we only have up 
                // to 336 rewards so after that the cycle starts over at 0
                items: [ loginRewards[daily_rewards.totalDaysLoggedIn % 336] ],
                primary: true
            }
        )
    }

    return await profile.generateResponse(config, notifications);
}