import { mcpResponse, Handleparams, CatalogPurchase, multiUpdate } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import errors from '../../structs/errors'
import * as Path from 'path';
import { validate, ValidationError } from 'jsonschema';
import * as fs from 'fs'
import { getCatalog } from '../../online';
import pendingPurchases from '../../database/purchasesController';
import { profile } from '../../structs/types';
import * as crypto from 'crypto';

const schemaPath = Path.join(__dirname, '../../../resources/schemas/mcp/json/VerifyRealMoneyPurchase.json');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))


export const supportedProfiles = [
    'common_core'
]

interface body {
    appStore: "EpicPurchasingService",
    appStoreId: string,
    receiptId: string,
    receiptInfo: string,
    "purchaseCorrelationId": string
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

    // since the header is optional
    const clientCmdRvn: number | undefined = config.revisions?.find(x =>
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
        "notifications": [],
        "profileCommandRevision": profile.commandRevision,
        "responseVersion": 1,
        "command": config.command,
    }

    const result = validate(config.body, schema);

    if (!result.valid) {
        const validationErrors = result.errors.filter(x => x instanceof ValidationError)
        const invalidFields = validationErrors.map(x => x.argument).join(', ');
        throw errors.neoniteDev.internal.validationFailed.withMessage(`Validation Failed. Invalid fields were [${invalidFields}]`).with(`[${invalidFields}]`)
    }

    const catalog = await getCatalog();

    if (!catalog) {
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


    const catalogToOffer = catalog.storefronts.find(catalog => catalog.catalogEntries.find(x => x.appStoreId.includes(config.body.appStoreId)));

    if (!catalogToOffer) {
        throw errors.neoniteDev.mcp.catalogOutOfDate.with(config.body.appStoreId);
    }

    const offer = catalogToOffer.catalogEntries.find(x => x.appStoreId.includes(config.body.appStoreId));

    if (!offer) {
        throw errors.neoniteDev.mcp.catalogOutOfDate.with(config.body.appStoreId);
    }


    const athenaProfile = new Profile('athena', config.accountId);
    await athenaProfile.init();

    const athenaResponse: multiUpdate = {
        "profileRevision": profile.rvn,
        "profileId": config.profileId,
        "profileChangesBaseRevision": profile.rvn,
        "profileChanges": [],
        "notifications": [],
        "profileCommandRevision": profile.commandRevision
    }

    if (catalogToOffer.name == 'CurrencyStorefront') {
        if (!offer.metaInfo) {
            throw errors.neoniteDev.mcp.catalogOutOfDate;
        }

        const MtxQuantity = offer.metaInfo.find(x => x.key == 'MtxQuantity')?.value;
        const MtxBonus = offer.metaInfo.find(x => x.key == 'MtxBonus')?.value;

        if (!MtxQuantity) {
            throw errors.neoniteDev.mcp.catalogOutOfDate;
        }


        let MtxTotal = parseInt(MtxQuantity)

        if (isNaN(MtxTotal)) {
            throw errors.neoniteDev.mcp.catalogOutOfDate;
        }

        if (MtxBonus) {
            let NanPossibleMtxBonus = parseInt(MtxBonus);

            if (!isNaN(NanPossibleMtxBonus)) {
                MtxTotal += NanPossibleMtxBonus;
            }
        }

        const itemId = crypto.randomUUID();
        const itemValue = {
            attributes: {
                platform: "EpicPC"
            },
            quantity: MtxTotal,
            templateId: "Currency:MtxPurchased"
        };

        profile.addItem(
            itemId,
            itemValue
        );

        response.profileChanges.push(
            {
                changeType: 'itemAdded',
                item: itemValue,
                itemId
            }
        );

        response.notifications = [
            {
                primary: true,
                type: 'CatalogPurchase',
                lootResult: {
                    items: [
                        {
                            itemGuid: itemId,
                            itemProfile: 'common_core',
                            itemType: "Currency:MtxPurchased",
                            quantity: MtxTotal
                        }
                    ]
                }
            }
        ];
    } else {
        response.notifications = [
            {
                primary: true,
                type: 'CatalogPurchase',
                lootResult: {
                    items: offer.itemGrants.map(item => {
                        const profileId = item.templateId.startsWith('Athena') ? 'athena' : 'common_core';
                        const itemId = crypto.randomUUID();

                        if (profileId == 'athena') {
                            const itemData = {
                                attributes: {
                                    level: 1,
                                    item_seen: false,
                                    rnd_sel_cnt: 0,
                                    favorite: false,
                                    creation_time: new Date().toISOString(),
                                    ...item.attributes
                                },
                                quantity: item.quantity,
                                templateId: item.templateId
                            };

                            athenaProfile.addItem(itemId, itemData);
                            athenaResponse.profileChanges.push(
                                {
                                    changeType: 'itemAdded',
                                    item: itemData,
                                    itemId: itemId
                                }
                            );
                        } else {
                            const itemData = {
                                attributes: {
                                    level: 1,
                                    item_seen: false,
                                    rnd_sel_cnt: 0,
                                    favorite: false,
                                    creation_time: new Date().toISOString(),
                                    ...item.attributes
                                },
                                quantity: item.quantity,
                                templateId: item.templateId
                            };

                            profile.addItem(itemId, itemData);
                            response.profileChanges.push(
                                {
                                    changeType: 'itemAdded',
                                    item: itemData,
                                    itemId: itemId
                                }
                            );
                        }

                        return {
                            itemGuid: itemId,
                            itemProfile: profileId,
                            itemType: item.templateId,
                            quantity: item.quantity
                        }
                    })
                }
            }
        ];
    }

    if (response.profileChanges.length > 0) {
        await profile.bumpRvn(response);
    }

    if (athenaResponse.profileChanges.length > 0) {
        await athenaProfile.bumpRvn(athenaResponse);
        response.multiUpdate = [ athenaResponse ];
    }

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