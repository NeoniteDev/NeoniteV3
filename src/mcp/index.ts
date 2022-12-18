import * as express from 'express'
import validateMethod from '../middlewares/Method'
import * as Path from 'path';
import errors from '../utils/errors';
import * as operations from './operations';
import { profileRevision } from './operations';
import { profile as types } from '../utils/types';
import PromiseRouter from 'express-promise-router';
import verifyAuthorization, { reqWithAuth } from '../middlewares/authorization';
import userAgentParse from '../middlewares/useragent';
import { ensureProfileExist, Profile } from './profile';
import { readdirSync } from 'fs';
import * as resources from '../utils/resources';
import { validate, ValidationError } from 'jsonschema';

const app = PromiseRouter();

const shemas = resources.getMcpSchemaList();

app.post('/api/game/v2/profile/:accountId/client/:command', verifyAuthorization(), async (req: reqWithAuth, res, next) => {
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

        const contentType = req.get('Content-Type');
        if (!contentType || !contentType.startsWith('application/json')) {
            throw errors.neoniteDev.internal.unsupportedMediaType;
        }

        const s_profileRevisions = req.get('X-EpicGames-ProfileRevisions');

        var profileRevisions: profileRevision[] | undefined = undefined;

        if (s_profileRevisions) {
            try {
                profileRevisions = JSON.parse(s_profileRevisions)
            } catch { throw errors.neoniteDev.mcp.invalidHeader; }
        }

        if (shemas.has(command)) {
            const result = validate(req.body, resources.getMcpSchema(command));
            if (!result.valid) {
                const validationErrors = result.errors.filter(x => x instanceof ValidationError)
                const invalidFields = validationErrors.map(x => x.argument).join(', ');
                throw errors.neoniteDev.internal.validationFailed.withMessage(`Validation Failed. Invalid fields were [${invalidFields}]`).with(`[${invalidFields}]`)
            }
        }

        const existOrCreated = await ensureProfileExist(profileId, accountId);
        if (!existOrCreated) {
            throw errors.neoniteDev.mcp.templateNotFound
                .withMessage(`Unable to find template configuration for profile ${profileId}`)
                .with(profileId)
        }

        const profile = new Profile(profileId, accountId);
        await profile.init();

        if (profileId == 'athena' && profile.stats.attributes.season_num != req.clientInfos.season) {
            profile.setStat('season_num', req.clientInfos.season);

            if (!profile.stats.attributes.past_seasons) throw errors.neoniteDev.internal.dataBaseError;

            let seasonInfo = profile.stats.attributes.past_seasons.find(x => x.seasonNumber == req.clientInfos.season);

            if (!seasonInfo) {
                seasonInfo = {
                    seasonNumber: req.clientInfos.season,
                    purchasedVIP: false,
                    bookLevel: 1,
                    xpBoost: 0,
                    friendXpBoost: 0,
                    bookXp: 0,
                    numHighBracket: 0,
                    numLowBracket: 0,
                    numWins: 0,
                    seasonLevel: 1,
                    seasonXp: 0,
                }

                profile.stats.attributes.past_seasons.push(seasonInfo);
                profile.setStat('past_seasons', profile.stats.attributes.past_seasons)
            }

            profile.setStat('book_purchased', seasonInfo.purchasedVIP);
            profile.setStat('book_level', seasonInfo.bookLevel);
            profile.setStat('season_match_boost', seasonInfo.xpBoost);
            profile.setStat('season_friend_match_boost', seasonInfo.friendXpBoost);
        }

        const response = await handle.execute({
            accountId,
            profileId: profileId,
            revision: revision,
            revisions: profileRevisions,
            body: req.body,
            command: command,
            clientInfos: req.clientInfos
        }, profile);

        res.setHeader('Content-Type', 'application/json')
        res.json(response);
    } catch (e) {
        next(e)
    }
})

app.post('/api/game/v2/profile/:accountId/public/:command', verifyAuthorization(), async (req, res, next) => {
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

    throw errors.neoniteDev.mcp.operationForbidden.withMessage(`Operation ${command} not allowed via this route`).with(command);
})

app.use(validateMethod(app))



export default app;