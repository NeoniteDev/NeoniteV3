import * as express from 'express'
import { CheckAuthorization } from '../middlewares/authorization'
import validateMethod from '../middlewares/Method'
import * as Path from 'path';
import errors from '../structs/errors';
import * as operations from './operations';
import { profileRevisions } from './operations';
import { profile as types } from '../structs/types';

const app = express.Router();

app.post('/api/game/v2/profile/:accountId/client/:command', CheckAuthorization, async (req, res, next) => {
    try {
        if (!req.auth) {
            throw errors.neoniteDev.authentication.authenticationFailed;
        }
        
        const accountId = req.params.accountId;
        const profileId = <types.ProfileID>(typeof req.query.profileId == 'string' ? req.query.profileId : 'common_core');
        const command = req.params.command;
        const revision = typeof req.query.rvn == 'string' && !isNaN(parseInt(req.query.rvn)) ? parseInt(req.query.rvn) : -1;

        if (accountId != req.auth.account_id) {
            throw errors.neoniteDev.authentication.notYourAccount.with(`fortnite:profile:${accountId}:commands`, 'ALL')
        }

        const handle = operations.getHandle(command);

        if (!handle) {
            throw errors.neoniteDev.mcp.operationNotFound.with(command);
        }

        if (
            handle.supportedProfiles != '*' &&
            !handle.supportedProfiles.includes(profileId)
        ) {
            throw errors.neoniteDev.mcp.wrongCommand
                .withMessage(`${command} is not valid on ${profileId} profiles.`)
                .with(command, `player:profile_${profileId}`, profileId)
        }

        const s_profileRevisions = req.get('X-EpicGames-ProfileRevisions');

        var profileRevisions: profileRevisions[] | undefined = undefined;

        if (s_profileRevisions) {
            try {
                profileRevisions = JSON.parse(s_profileRevisions)
            } catch { throw errors.neoniteDev.mcp.invalidHeader; }
        }

        var response = await handle.execute({
            accountId,
            profileId: profileId,
            revision: revision,
            revisions: profileRevisions,
            body: req.body,
            command: command,
        });

        res.json(response);
    } catch (e) {
        next(e)
    }
})

app.use(validateMethod(app))

export default app;