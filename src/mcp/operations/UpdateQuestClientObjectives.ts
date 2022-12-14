import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../utils/types';
import errors from '../../utils/errors'
import * as resources from '../../utils/resources';
import { validate, ValidationError } from 'jsonschema';

export const supportedProfiles: types.ProfileID[] = [
    'athena', 'campaign', 'profile0'
]

interface body {
    advance: {
        statName: string,
        count: number
    }[]
};


export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {
    const fullProfile = await profile.getFullProfile();

    const quests = Object.entries(fullProfile.items).filter((
        [itemId, value]) => {
            if (!value.templateId) { console.log("WTF no templateID" + itemId)}
            return value.templateId.startsWith('Quest:')
        }
    );

    const updates: { itemId: string, attributeName: string, attributeValue: any }[] = []

    config.body.advance.forEach(x => {
        const item = quests.find(([id, value]) => typeof value.attributes[`completion_${x.statName}`] == 'number');
        if (!item) return undefined;

        const newCompletion = item[1].attributes[`completion_${x.statName}`] + x.count;
        updates.push(
            {
                itemId: item[0],
                attributeName: `completion_${x.statName}`,
                attributeValue: newCompletion,
            }
        );


        if (item[1].templateId == "Quest:homebaseonboarding" && x.statName.toLowerCase() == 'hbonboarding_namehomebase') {
            updates.push(
                {
                    itemId: item[0],
                    attributeName: `quest_state`,
                    attributeValue: 'Claimed',
                }
            );
        }
    });

    if (updates.length > 0) {
        await profile.setMutliItemAttribute(updates);
    }

    return await profile.generateResponse(config);
}