import errors from '../../structs/errors'
import { mcpResponse, Handleparams, multiUpdate } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import * as Path from 'path';
import { validate, ValidationError } from 'jsonschema';
import * as fs from 'fs'
import { randomUUID } from 'crypto';


export const supportedProfiles = [
    'athena'
]

const schemaPath = Path.join(__dirname, '../../../resources/schemas/mcp/json/UnlockRewardNode.json');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))

const rewardGiftBox = 'gb_winterfestreward';

const rewardsNodeIds = {
    'Node': {
        A: {
            2: 'HomebaseBannerIcon:brs19_winterfest2021',
            3: 'AthenaSkyDiveContrail:trails_id_137_turtleneckcrystal',
            4: 'AthenaItemWrap:wrap_429_holidaysweater',
            5: 'AthenaLoadingScreen:lsid_393_winterfest2021',
            6: 'AthenaMusicPack:musicpack_117_winterfest2021',
            7: 'AthenaDance:eid_epicyarn',
            8: 'AthenaCharacter:cid_a_310_athena_commando_F_scholarfestive',
            9: 'AthenaPickaxe:pickaxe_id_731_scholarfestivefemale1h',
            10: 'AthenaItemWrap:wrap_430_winterlights',
            11: 'AthenaDance:spid_346_winterfest_2021',
            12: 'AthenaPickaxe:pickaxe_ID_732_shovelmale',
        },
        B: {
            1: 'AthenaDance:emoji_s19_animwinterfest2021',
        },
        C: {
            1: 'AthenaGlider:glider_id_335_logarithm_40qgl'
        }
    }
}

export async function handle(config: Handleparams): Promise<mcpResponse> {
    const existOrCreated = await ensureProfileExist(config.profileId, config.accountId);

    if (!existOrCreated) {
        throw errors.neoniteDev.mcp.templateNotFound
            .withMessage(`Unable to find template configuration for profile ${config.profileId}`)
            .with(config.profileId)
    }

    const profile = new Profile(config.profileId, config.accountId);
    await profile.init();

    const id = config.body.nodeId.split('.');

    const result = validate(config.body, schema);

    if (!result.valid) {
        const validationErrors = result.errors.filter(x => x instanceof ValidationError)
        const invalidFields = validationErrors.map(x => x.argument).join(', ');
        throw errors.neoniteDev.internal.validationFailed.withMessage(`Validation Failed. Invalid fields were [${invalidFields}]`).with(`[${invalidFields}]`)
    }

    const multiUpdates: Profile[] = [];

    if (
        typeof config.body.nodeId == 'string' &&
        typeof config.body.rewardGraphId == 'string' &&
        typeof config.body.rewardCfg == 'string'
    ) {
        // @ts-ignore
        const NodeRewardTemplateId: string | undefined = rewardsNodeIds[id[1]]?.[id[2]]?.[id[3]];

        const nodeId: string = config.body.nodeId;
        const rewardGraphId: string = config.body.rewardGraphId;

        const RewardGraphItem = await profile.getItem(rewardGraphId);


        if (
            NodeRewardTemplateId &&
            RewardGraphItem &&
            RewardGraphItem.templateId.startsWith('AthenaRewardGraph')
        ) {
            const rewardUUID = randomUUID();
            const isCommonCoreReward = NodeRewardTemplateId.startsWith('HomebaseBannerIcon');

            const rewardItem = {
                templateId: NodeRewardTemplateId,
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

            if (isCommonCoreReward) {
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
                            "itemType": NodeRewardTemplateId,
                            "itemGuid": rewardUUID,
                            "itemProfile": isCommonCoreReward ? 'common_core' : 'athena',
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


            RewardGraphItem.attributes.reward_nodes_claimed.push(nodeId);
            RewardGraphItem.attributes.reward_keys[0].unlock_keys_used++;

            profile.addItem(giftBotItemId, giftBoxItem);
            profile.setMutliItemAttribute(
                [
                    {
                        itemId: rewardGraphId,
                        attributeName: 'reward_nodes_claimed',
                        attributeValue: RewardGraphItem.attributes.reward_nodes_claimed
                    },
                    {
                        itemId: rewardGraphId,
                        attributeName: 'reward_keys',
                        attributeValue: RewardGraphItem.attributes.reward_keys
                    }
                ]
            );
        } else { console.log('Nope', NodeRewardTemplateId, RewardGraphItem) }
    }


    return profile.generateResponse(config, undefined, ...multiUpdates)
}