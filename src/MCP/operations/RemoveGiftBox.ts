import errors from '../../structs/errors'
import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import * as Path from 'path';
import { validate, ValidationError } from 'jsonschema';
import * as fs from 'fs'

const schemaPath = Path.join(__dirname, '../../../resources/schemas/mcp/json/RemoveGiftBox.json');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))

export const supportedProfiles = '*';

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
    const clientCmdRvn: number = config.revisions?.find(x =>
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
        "profileCommandRevision": profile.commandRevision,
        "responseVersion": 1,
        "command": config.command,
    }

    const result = validate(config.body, schema);

    if (!result.valid) {
        console.log(result.errors[0].path)
        const InvalidFields = result.errors.filter(x => x instanceof ValidationError).map(x => x)
        throw errors.neoniteDev.internal.validationFailed.withMessage(``)
    }

    const giftBoxItemIds: any[] = config.body.giftBoxItemIds;

    const removePromises : Array<Promise<void>> = [];

    if (giftBoxItemIds &&
        giftBoxItemIds instanceof Array &&
        giftBoxItemIds.length > 0
    ) {
        for (let giftBoxItemId of giftBoxItemIds) {
            const item = await profile.getItem(giftBoxItemId);
            const isGiftBox = item.templateId.startsWith('GiftBox:');

            if (isGiftBox) {
                var promise = profile.removeItem(giftBoxItemId);
                removePromises.push(promise);

                response.profileChanges.push(
                    {
                        changeType: 'itemRemoved',
                        itemId: giftBoxItemId
                    }
                )
            }
        }

        await Promise.all(removePromises);

        profile.bumpRvn(response);
    }

    if (!bIsUpToDate) {
        response.profileChanges = [
            {
                changeType: 'fullProfileUpdate',
                profile: await profile.getFullProfile()
            }
        ]
    }

    response.profileRevision = profile.rvn;
    response.profileCommandRevision = profile.commandRevision;

    return response;
}