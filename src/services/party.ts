import * as express from 'express';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import * as crypto from 'crypto';
import validateMethod from '../middlewares/Method';
import Router from "express-promise-router";
import { VerifyAuthorization, CheckClientAuthorization } from '../middlewares/authorization';
import errors, { ApiError, neoniteDev } from '../structs/errors';
import { HttpError } from 'http-errors';
import parties from '../database/partiesController';
import * as xmppApi from '../xmppManager';
import * as Path from 'path';
import { validate } from 'jsonschema';
import * as fs from 'fs'
import { party } from '../types/bodies';
import Party, { getParty } from '../structs/Party';
import Friends from '../database/friendsController';
import Pings from '../database/pingsController';
import generateJoinToken from '../structs/EOSvoiceChat';


const createSchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../resources/schemas/party/json/create.json'), 'utf-8'))
const joinSchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../resources/schemas/party/json/join.json'), 'utf-8'))
const metaSchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../resources/schemas/party/json/meta.json'), 'utf-8'))
const updateSchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../resources/schemas/party/json/partyUpdate.json'), 'utf-8'))

const app = Router();

app.use(express.json());

// create party
app.post('/api/v1/:deploymentId/parties', VerifyAuthorization, async (req, res, next) => {
    if (!req.is('application/json')) {
        throw errors.neoniteDev.internal.unsupportedMediaType;
    }

    if (!req.auth.account_id) {
        return res.sendStatus(400);
    }

    const body: party.CreateParty.root = req.body;

    validateBody(body, createSchema);

    if (!body.join_info.connection.id) {
        throw errors.neoniteDev.party.userOffline.with(req.auth.account_id);
    }

    const sessions = await xmppApi.getUserSessions(req.auth.account_id);

    if (
        !sessions.find(x => x.sessionId == body.join_info.connection.id)
    ) {
        throw errors.neoniteDev.party.userOffline.with(req.auth.account_id);
    }

    const existingParty = await parties.getByMember(req.auth.account_id);

    if (existingParty.length > 0) {
        throw errors.neoniteDev.party.alreadyInParty.with(req.auth.account_id, 'Fortnite')
    }

    const party = new Party();

    party.addMember(body.join_info.connection, req.auth.account_id, body.meta)
    res.json(party.getData());
})

// update party
app.patch('/api/v1/:deploymentId/parties/:partyId', VerifyAuthorization, async (req, res, next) => {
    if (!req.is('application/json')) {
        throw errors.neoniteDev.internal.unsupportedMediaType;
    }

    if (!req.auth.account_id) {
        return res.sendStatus(400);
    }

    const party = await getParty(req.params.partyId);

    if (!party) {
        throw errors.neoniteDev.party.partyNotFound.with(req.params.partyId)
    }

    const body: party.MetaUpdate.Root = req.body;

    validateBody(body, updateSchema);

    const captain = party.members.find(x => x.role == "CAPTAIN");

    if (!captain) {
        throw errors.neoniteDev.party.memberNotFound.withMessage('cannot find party leader.');
    }

    if (req.auth.account_id !== captain.account_id) {
        throw errors.neoniteDev.party.notLeader;
    }

    party.update(body);
    res.status(204).send();
})

// get a party
app.get('/api/v1/:deploymentId/parties/:partyId', VerifyAuthorization, async (req, res, next) => {
    const party = await parties.getById(req.params.partyId)

    if (!party) {
        throw errors.neoniteDev.party.partyNotFound.with(req.params.partyId)
    }

    res.json(party);
})


// update party memeber
app.patch('/api/v1/:deploymentId/parties/:partyId/members/:accountId/meta', VerifyAuthorization, async (req, res) => {
    if (!req.is('application/json')) {
        throw errors.neoniteDev.internal.unsupportedMediaType;
    }

    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    const party = await getParty(req.params.partyId);

    if (!party) {
        throw errors.neoniteDev.party.partyNotFound.with(req.params.partyId);
    }

    const member = party.members.find(x => x.account_id == req.params.accountId)

    if (!member) {
        throw errors.neoniteDev.party.memberNotFound.with(req.params.accountId);
    }

    party.updateMember(member.account_id, req.body);

    res.status(204).send()
})

// get current user parties
app.get('/api/v1/:deploymentId/user/:accountId', VerifyAuthorization, async (req, res, next) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    const pings = await Pings.getUserPings(req.params.accountId);

    res.json({
        "current": await parties.getByMember(req.params.accountId),
        "pending": [],
        "invites": [],
        "pings": pings
    });
});

// "ping" a user
app.post('/api/v1/:deploymentId/user/:friendId/pings/:accountId', VerifyAuthorization, async (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    if (req.params.accountId === req.params.friendId) {
        throw errors.neoniteDev.party.selfPing;
    }

    const friendShip = await Friends.getFriendship(req.params.accountId, req.params.friendId);

    if (!friendShip) {
        throw errors.neoniteDev.party.pingForbidden.withMessage(`User [${req.params.accountId}] is not authorized to send pings to [${req.params.friendId}].`)
    }

    const targetSessions = await xmppApi.getUserSessions(req.params.friendId);

    if (targetSessions.length <= 0) {
        throw errors.neoniteDev.party.userOffline.with(req.params.friendId);
    }

    // todo urgent: database ping table


    const existingPings = await Pings.get(req.params.accountId, req.params.friendId);

    if (existingPings.length > 0) {
        await Pings.remove(req.params.accountId, req.params.friendId);
    }

    const meta = req.body.meta != undefined ? mapObject<string>(req.body.meta) : {};

    const ping = {
        sent_by: req.params.accountId,
        sent_to: req.params.friendId,
        sent_at: new Date(),
        expires_at: new Date().addHours(1),
        meta: meta
    };

    await Pings.create(ping);

    xmppApi.sendMesage(
        `${req.params.friendId}@xmpp.neonitedev.live`,
        {
            expires: ping.expires_at,
            meta: meta,
            ns: "Fortnite",
            pinger_dn: req.auth.displayName,
            pinger_id: ping.sent_by,
            sent: ping.sent_at,
            type: "com.epicgames.social.party.notification.v0.PING"
        }
    );

    res.json(ping);
})

// remove a ping
app.delete('/api/v1/:deploymentId/user/:accountId/pings/:pingerId', VerifyAuthorization, async (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    if (req.params.accountId === req.params.pingerId) {
        throw errors.neoniteDev.party.selfPing;
    }

    await Pings.remove(req.params.accountId, req.params.friendId);

    res.status(204).send()
})

// join a party from a ping
app.post('/api/v1/:deploymentId/user/:accountId/pings/:pingerId/join', VerifyAuthorization, async (req, res) => {
    if (req.params.accountId !== req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    if (req.params.accountId === req.params.pingerId) {
        throw errors.neoniteDev.party.selfPing;
    }

    const body: party.JoinParty.Root = req.body;

    validateBody(body, joinSchema);

    const partyData = (await parties.getByMember(req.params.pingerId))[0];

    if (!partyData) {
        throw errors.neoniteDev.party.userHasNoParty.with(req.params.pingerId);
    }

    const pings = await Pings.get(req.params.pingerId, req.params.accountId);

    if (pings.length <= 0) {
        throw errors.neoniteDev.party.pingNotFound.withMessage(`Ping from [${req.params.pingerId}] to [${req.params.accountId}] does not exist.`)
    }

    Pings.remove(req.params.pingerId, req.params.accountId);

    const party = new Party(partyData);

    party.addMember(body.connection, req.auth.account_id, body.meta);

    // TODO: Join confimation
    res.json({ "status": "JOINED", "party_id": party.id });
});

// view an invited party
app.get('/api/v1/:deploymentId/user/:accountId/pings/:pingerId/parties', VerifyAuthorization, async (req, res) => {
    if (req.params.accountId !== req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    const pings = await Pings.get(req.params.pingerId, req.params.accountId);

    if (pings.length <= 0) {
        throw errors.neoniteDev.party.pingNotFound.withMessage(`Ping from [${req.params.pingerId}] to [${req.params.accountId}] does not exist.`);
    }

    const partyData = await parties.getByMember(req.params.pingerId);

    res.json(partyData);
})

app.post('/api/v1/Fortnite/parties/:partyId/members/:accountId/conferences/connection', VerifyAuthorization, async (req, res) => {
    if (req.params.accountId !== req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    const partyData = await parties.getById(req.params.partyId);

    if (!partyData) {
        throw errors.neoniteDev.party.userHasNoParty.with(req.params.pingerId);
    }

    const partyMemeber = partyData.members.find(x => x.account_id == req.params.accountId);

    if (!partyMemeber) {
        throw errors.neoniteDev.party.memberNotFound.with(req.params.accountId);
    }

    const joinToken = await generateJoinToken(partyData.id);

    const participant = joinToken.participants.find(x => x.puid == process.env.eosProductId);

    if (!participant) {
        throw errors.neoniteDev.internal.eosError;
    }

    res.json({
        "providers": {
            "rtcp": {
                "participant_token": participant.token,
                "client_base_url": joinToken.clientBaseUrl,
                "room_name": joinToken.roomId
            }
        }
    })
})


function validateBody(body: any, schema: any) {
    const validatorResult = validate(body, schema);

    if (!validatorResult.valid) {
        var error = errors.neoniteDev.internal.validationFailed;
        validatorResult.errors.forEach((err) => {
            if (!error.response.validationFailures) {
                error.response.validationFailures = {};
            }

            error.response.validationFailures[`body.${err.path.length !== 0 ? err.path.join('.') + '.' : ''}${err.argument}`] = {
                "fieldName": `body.${err.path.length !== 0 ? err.path.join('.') + '.' : ''}${err.argument}`,
                "errorMessage": err.message,
                "errorCode": "ValidationError",
                "invalidValue": "",
                "messageVars": {}
            }
        })

        throw error;
    }
}

function mapObject<T = any>(var1: Record<string, any>, objectPartent = []): Record<string, T> {
    if (typeof var1 != 'object') {
        throw errors.neoniteDev.basic.jsonMappingFailed.with.apply(globalThis, objectPartent);
    }
    return  Object.fromEntries(
        Object.entries(var1).filter(x => x !== null).map(
            ([key, value]) => {
                if (typeof value == 'number') {
                    return [key, value.toString()];
                }

                if (typeof value == 'string') {
                    return [key, value];
                }

                throw errors.neoniteDev.basic.jsonMappingFailed.with.apply(globalThis, objectPartent).with(key);
                return [];
            }
        )
    )
}

app.use(validateMethod(app));

app.use(() => {
    throw errors.neoniteDev.basic.notFound;
})

app.use(
    (err: any, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof ApiError) {
            err.apply(res);
        }
        else if (err instanceof HttpError && err.type == 'entity.parse.failed') {
            neoniteDev.internal.jsonParsingFailed.with(err.message).apply(res);
        } else if (err instanceof HttpError) {
            var error = neoniteDev.internal.unknownError;
            error.statusCode = err.statusCode;
            error.withMessage(err.message).apply(res);
        }
        else {
            console.error(err)
            neoniteDev.internal.serverError.apply(res);
        }
    }
)

module.exports = app;