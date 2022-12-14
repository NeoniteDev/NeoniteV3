import errors from '../../utils/errors'
import { mcpResponse, Handleparams, multiUpdate } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { validate, ValidationError } from 'jsonschema';
import { randomUUID } from 'crypto';
import * as resources from '../../utils/resources';

export const supportedProfiles = [
    'athena'
]

const rewardGiftBox = 'gb_winterfestreward';

const rewardNodes = resources.getWinterfestRewards();

export async function handle(config: Handleparams, profile: Profile): Promise<mcpResponse> {
    const id = config.body.nodeId.split('.');
    const multiUpdates: Profile[] = [];

    const rewardIds = rewardNodes[config.clientInfos.season];

    const nodeId: string = config.body.nodeId;
    const rewardGraphId: string = config.body.rewardGraphId;

    if (
        typeof nodeId != 'string' ||
        typeof rewardGraphId != 'string' ||
        typeof config.body.rewardCfg != 'string' ||
        rewardIds == undefined
    ) { throw errors.neoniteDev.mcp.invalidPayload; }

    // @ts-ignore
    const itemTemplateId = rewardIds[nodeId];
    const rewardGraphItem = await profile.getItem(rewardGraphId);

    if (
        !itemTemplateId ||
        !rewardGraphItem ||
        !rewardGraphItem.templateId.startsWith('AthenaRewardGraph')
    ) { throw errors.neoniteDev.mcp.itemNotFound.withMessage('Invalid reward node'); }


    const rewardUUID = randomUUID();

    const rewardItem = {
        templateId: itemTemplateId,
        attributes: {
            "creation_time": new Date().toISOString(),
            "max_level_bonus": 0,
            "level": 1,
            "item_seen": false,
            "rnd_sel_cnt": 0,
            "xp": 0,
            "variants": [],
            "favorite": false
        },
        quantity: 1
    }

    const isCommonReward = itemTemplateId.startsWith('HomebaseBannerIcon');
    if (isCommonReward) {
        const common_core = new Profile('common_core', config.accountId);
        common_core.addItem(rewardUUID, rewardItem);
        multiUpdates.push(common_core);
    } else {
        profile.addItem(rewardUUID, rewardItem);
    }

    const giftBotItemId = randomUUID();
    const giftBoxItem = {
        templateId: `GiftBox:${rewardGiftBox}`,
        attributes: {
            "max_level_bonus": 0,
            "fromAccountId": "",
            "lootList": [
                {
                    "itemType": itemTemplateId,
                    "itemGuid": rewardUUID,
                    "itemProfile": isCommonReward ? 'common_core' : 'athena',
                    "attributes": {
                        "creation_time": new Date()
                    },
                    "quantity": 1
                }
            ],
            "level": 1,
            "item_seen": false,
            "xp": 0,
            "giftedOn": new Date(),
            "params": {
                "SubGame": "Athena",
                "winterfestGift": "true"
            },
            "favorite": false
        },
        quantity: 1
    };

    profile.addItem(giftBotItemId, giftBoxItem);

    rewardGraphItem.attributes.reward_nodes_claimed.push(nodeId);
    rewardGraphItem.attributes.reward_keys[0].unlock_keys_used++;
    profile.setMutliItemAttribute(
        [
            {
                itemId: rewardGraphId,
                attributeName: 'reward_nodes_claimed',
                attributeValue: rewardGraphItem.attributes.reward_nodes_claimed
            },
            {
                itemId: rewardGraphId,
                attributeName: 'reward_keys',
                attributeValue: rewardGraphItem.attributes.reward_keys
            }
        ]
    );

    return await profile.generateResponse(config, undefined, ...multiUpdates)
}