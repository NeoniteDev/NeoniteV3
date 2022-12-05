import { mcpResponse, Handleparams, multiUpdate, notification } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../structs/types';
import errors from '../../structs/errors'
import * as Path from 'path'
import { validate, ValidationError } from 'jsonschema';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { getCatalog } from '../../online';
import profiles from '../../database/local/profilesController';

const schemaPath = Path.join(__dirname, '../../../resources/schemas/mcp/json/PurchaseCatalogEntry.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))

export const supportedProfiles: types.ProfileID[] = [
    'common_core',
]

interface body {
    "offerId": string,
    "purchaseQuantity"?: number,
    "currency"?: string,
    "currencySubType": string,
    "expectedTotalPrice"?: number,
    "gameContext"?: string
}

const validCurrencyType = ['Other', 'RealMoney', 'GameItem', 'MtxCurrency'];

export async function handle(config: Handleparams<body>): Promise<mcpResponse> {
    const existOrCreated = await ensureProfileExist(config.profileId, config.accountId);

    if (!existOrCreated) {
        throw errors.neoniteDev.mcp.templateNotFound
            .withMessage(`Unable to find template configuration for profile ${config.profileId}`)
            .with(config.profileId)
    }

    const profile = new Profile(config.profileId, config.accountId);
    await profile.init();

    //#region Checkings
    const result = validate(config.body, schema);
    if (!result.valid) {
        const validationErrors = result.errors.filter(x => x instanceof ValidationError)
        const invalidFields = validationErrors.map(x => x.argument).join(', ');
        throw errors.neoniteDev.internal.validationFailed.withMessage(`Validation Failed. Invalid fields were [${invalidFields}]`).with(`[${invalidFields}]`)
    }

    const catalog = await getCatalog();

    if (!catalog) {
        throw errors.neoniteDev.internal.serverError;
    }

    const itemStorefront = catalog.storefronts.find(x => x.catalogEntries.some(x => x.offerId == config.body.offerId));

    if (!itemStorefront) {
        throw errors.neoniteDev.mcp.catalogOutOfDate
            .withMessage(`Could not find catalog item ${config.body.offerId}`)
            .with(config.body.offerId);
    };

    const item = itemStorefront.catalogEntries.find(x => x.offerId == config.body.offerId);

    if (!item) {
        throw errors.neoniteDev.mcp.catalogOutOfDate
            .withMessage(`Could not find catalog item ${config.body.offerId}`)
            .with(config.body.offerId);
    };

    if (!validCurrencyType.includes(config.body.currency || 'null')) {
        throw errors.neoniteDev.mcp.invalidPayload
            .withMessage(`Unable to process command mcp.operations.${config.command}.ts.\nInvalid value "${config.body.currency || 'null'}" of config.body["currency"].\nValue must be one of [${validCurrencyType.join(', ')}]`)
            .with(`mcp.operations.${config.command}.ts`, `[${validCurrencyType.join(', ')}]`);
    };


    const athenaProfile = new Profile('athena', config.accountId);
    await athenaProfile.init();

    if (config.body.currency == 'RealMoney') {
        throw errors.neoniteDev.mcp.invalidParameter.withMessage('PurchaseCatalogEntry cannot be used for RealMoney prices. Use VerifyRealMoneyPurchase flow instead.');
    };

    const price = item.prices.find(x => x.currencyType == config.body.currency && x.currencySubType == config.body.currencySubType);

    if (!price) {
        throw errors.neoniteDev.mcp.catalogOutOfDate
            .withMessage(`Could not find ${config.body.currency}-${config.body.currencySubType} price for catalog item ${config.body.offerId}`)
            .with(config.body.currency || 'null', config.body.currencySubType, config.body.offerId);
    }

    if (
        config.body.expectedTotalPrice != undefined &&
        price.finalPrice != config.body.expectedTotalPrice
    ) {
        throw errors.neoniteDev.mcp.catalogOutOfDate
            .withMessage(`Expected total price of ${config.body.expectedTotalPrice} did not match actual price ${price.finalPrice}`)
            .with(config.body.expectedTotalPrice.toString(), price.finalPrice.toString());
    }

    //#endregion checking

    const lootResultItems = item.itemGrants.map(x => {
        const profileId = x.templateId.startsWith('Athena') ? 'athena' : 'common_core';
        const id = randomUUID();

        const item = {
            templateId: x.templateId,
            attributes: {
                creation_time: new Date().toISOString(),
                max_level_bonus: 0,
                level: 1,
                item_seen: false,
                rnd_sel_cnt: 0,
                xp: 0,
                variants: [],
                favorite: false,
                ...x.attributes
            },
            quantity: x.quantity
        }

        if (profileId == 'athena') {
            athenaProfile.addItem(
                id,
                item
            );
        } else {
            profile.addItem(
                id,
                item
            );
        }

        return {
            itemType: x.templateId,
            itemGuid: id,
            itemProfile: profileId,
            quantity: x.quantity
        }
    });

    const notifications: notification[] = [
        {
            type: 'CatalogPurchase',
            primary: true,
            lootResult: {
                items: lootResultItems
            }
        }
    ];

    return profile.generateResponse(config, notifications, athenaProfile);
}