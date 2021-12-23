import { Request, Response, NextFunction } from 'express-serve-static-core'
import { mcpResponse, Handleparams } from '../operations'
import { getOrCreate } from '../profile'
import Errors from '../../structs/errors'

async function handle(config: Handleparams): Promise<mcpResponse> {
    const response: mcpResponse = {
        "profileRevision": 1,
        "profileId": config.profileId,
        "profileChangesBaseRevision": 1,
        "profileChanges": [],
        "serverTime": new Date(),
        "profileCommandRevision": 1,
        "responseVersion": 1
    }


    const profile = await getOrCreate(config.profileId, config.accountId);

    if (!profile) {
        throw Errors.neoniteDev.mcp.templateNotFound
            .withMessage(`Unable to find template configuration for profile ${config.profileId}`)
            .with(config.profileId)
    }

    if (profile.rvn >= config.revision) {

    }

    return response;
}


export default handle;