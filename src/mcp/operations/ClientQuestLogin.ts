import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../utils/types';

import errors, { neoniteDev } from '../../utils/errors'
import { readFileSync } from 'fs';
import * as path from 'path';
import { QuestList } from '../../types/questList';
import { randomUUID } from 'crypto';

export const supportedProfiles: types.ProfileID[] = [
    'athena', 'campaign', 'profile0'
]

// credit to PRO100KatYT for the quest list.
const questsData: QuestList = JSON.parse(
    readFileSync(path.join(__dirname, '../../../resources/quests.json'), 'utf-8')
);

export async function handle(config: Handleparams, profile: Profile): Promise<mcpResponse> {
    if (!profile.stats.attributes.quest_manager)
        throw neoniteDev.internal.dataBaseError;

    const bIsBattleRoyale = config.profileId == 'athena';
    const dailyQuests = bIsBattleRoyale ? questsData.BattleRoyale.Daily : questsData.SaveTheWorld.Daily;

    // here we parse dailyLoginInterval from quest_manager stat
    // to check if it's been at least a day since last quest update
    const dailyLoginInterval = new Date(profile.stats.attributes.quest_manager.dailyLoginInterval)
    const comparedTime = (Date.now() - dailyLoginInterval.getTime()) / (1000 * 3600 * 24)

    if (comparedTime <= 1) { // it's been less than a day, do nothing;
        return profile.generateResponse(config);
    }

    const fullProfile = await profile.getFullProfile();

    // Get all existing daily quests.
    const existingQuests = Object.entries(fullProfile.items)
        .filter(x => { 
            if (!x[1].templateId) { console.log('WTF NO TEMPLATEID' + x[0])}
            return x[1].templateId.startsWith(bIsBattleRoyale ? 'Quest:AthenaDaily' : 'Quest:Daily') 
        })
        .map(x => ({ itemId: x[0], value: x[1] }));

    const uniqueQuests = dailyQuests.filter(x => existingQuests.findIndex(y => y.value.templateId.toLowerCase() == x.templateId.toLowerCase()) == -1);

    if (uniqueQuests.length <= 0) {
        // maybe start to re-assign some already done quests.
    }

    // maybe start to re-assign some already done quests.
    const randomQuest = uniqueQuests[Math.floor(Math.random() * uniqueQuests.length)]

    profile.addItem(
        randomUUID(),
        {
            templateId: randomQuest.templateId,
            attributes: {
                quest_state: "Active",
                level: -1,
                item_seen: false,
                sent_new_notification: false,
                xp_reward_scalar: 1,
                challenge_bundle_id: "",
                challenge_linked_quest_given: "",
                challenge_linked_quest_parent: "",
                playlists: [],
                bucket: "",
                last_state_change_time: new Date().toISOString(),
                max_level_bonus: 0,
                xp: 0,
                quest_rarity: "uncommon",
                favorite: false,
                quest_pool: "",
                creation_time: new Date().toISOString(),
                ...Object.fromEntries(randomQuest.objectives.map(x => [`completion_${x}`, 0]))
            },
            quantity: 1
        }
    );

    const quest_manager = profile.stats.attributes.quest_manager;

    quest_manager.dailyLoginInterval = quest_manager.questPoolStats.dailyLoginInterval = new Date().toISOString();
    quest_manager.dailyQuestRerolls = 1;

    profile.setStat('quest_manager', quest_manager);

    return await profile.generateResponse(config);
}