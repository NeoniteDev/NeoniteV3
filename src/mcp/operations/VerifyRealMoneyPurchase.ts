import { mcpResponse, Handleparams, CatalogPurchase } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import errors from '../../structs/errors'
import * as Path from 'path';
import { validate, ValidationError } from 'jsonschema';
import * as fs from 'fs'
import { pendingPurchases } from '../../database/mysqlManager';
import { getCatalog } from '../../online';


const schemaPath = Path.join(__dirname, '../../../resources/schemas/mcp/json/VerifyRealMoneyPurchase.json');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))


export const supportedProfiles = [
    'common_core'
]

interface body {
    appStore: "EpicPurchasingService",
    appStoreId: symbol,
    "receiptId": "EntitlementId",
    "receiptInfo": symbol,
    "purchaseCorrelationId": "E9158CCB4A589A32F55581B80C8825BB"
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

    const pendingPurchase = await pendingPurchases.getAll({ accountId: config.accountId });

    const catalog = await getCatalog();

    if (catalog) {
       /* const Flatcatalog = catalog.storefronts.flatMap((x) => x.catalogEntries)

        const purchases = pendingPurchase.map((x) => {
            var catalogItems = x.offers.map(offId =>
                Flatcatalog.find(y => y.appStoreId.includes(offId))
            );
    
            const fulfillmentIds = catalogItems
                .filter(x => x.requirements.length == 1 && x.requirements[0].requirementType == 'DenyOnFulfillment')
                .map(x => {
                    return x.requirements[0].requiredId;
                });
    
            return {
                fulfillments: fulfillmentIds,
                receipt: x.receiptId,
                catalogItems: catalogItems
            };
        })*/
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