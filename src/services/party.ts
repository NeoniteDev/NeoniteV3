import * as express from 'express';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import * as crypto from 'crypto';
import validateMethod from '../middlewares/Method';
import Router from "express-promise-router";
import verifyAuthorization, { reqWithAuth } from '../middlewares/authorization';
import errors, { ApiError, neoniteDev } from '../utils/errors';
import { HttpError } from 'http-errors';
//import parties from '../database/local/partiesController';
import * as xmppApi from '../xmppManager';
import * as Path from 'path';
import { validate } from 'jsonschema';
import * as fs from 'fs'
import { party } from '../types/bodies';
import Party, { getParty, localParties } from '../utils/Party';
import Friends from '../database/local/friendsController';
import Pings from '../database/local/pingsController';
import generateJoinToken from '../utils/EOSvoiceChat';
import { vxGenerateToken } from '../utils/vivox';


const createSchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../resources/schemas/party/json/create.json'), 'utf-8'))
const joinSchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../resources/schemas/party/json/join.json'), 'utf-8'))
const metaSchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../resources/schemas/party/json/meta.json'), 'utf-8'))
const updateSchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../resources/schemas/party/json/partyUpdate.json'), 'utf-8'))

const app = Router();

app.use(express.json());

// create party
app.post('/api/v1/:deploymentId/parties', verifyAuthorization(), async (req, res, next) => {
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

    console.log(sessions, body.join_info.connection.id)
    if (
        !sessions.find(x => x.sessionId == body.join_info.connection.id)
    ) {
        throw errors.neoniteDev.party.userOffline.with(req.auth.account_id);
    }

    const existingParty = localParties.filter(x => x.members.find(mem => mem.account_id == req.auth.account_id))

    if (existingParty.length > 0) {
        throw errors.neoniteDev.party.alreadyInParty.with(req.auth.account_id, 'Fortnite')
    }

    const party = new Party();

    party.addMember(
        {
            id: body.join_info.connection.id,
            meta: body.join_info.connection.meta || {},
            yield_leadership: false
        },
        req.auth.account_id, body.join_info.meta
    );

    party.update(
        {
            config: body.config,
            meta: {
                delete: [],
                update: body.meta || {}
            }
        }
    )

    res.json(party.getData());
})

// update party
app.patch('/api/v1/:deploymentId/parties/:partyId', verifyAuthorization(), async (req, res, next) => {
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

    const body: party.update.Root = req.body;

    validateBody(body, updateSchema);

    const captain = party.members.find(x => x.role == "CAPTAIN");

    if (!captain) {
        throw errors.neoniteDev.party.memberNotFound.withMessage('cannot find party leader.');
    }

    if (req.auth.account_id !== captain.account_id) {
        throw errors.neoniteDev.party.notLeader;
    }

    await party.update({
        config: body.config || {},
        meta: {
            delete: body.meta?.delete || [],
            update: body.meta?.update || {},
        }
    });

    res.status(204).send();
})

// get a party
app.get('/api/v1/:deploymentId/parties/:partyId', verifyAuthorization(), async (req, res, next) => {
    const party = localParties.find(x => x.id == req.params.partyId);

    if (!party) {
        throw errors.neoniteDev.party.partyNotFound.with(req.params.partyId)
    }

    res.json(party.getData());
})


// update party memeber
app.patch('/api/v1/:deploymentId/parties/:partyId/members/:accountId/meta', verifyAuthorization(), async (req, res) => {
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

    party.updateMember(member.account_id, req.auth.displayName, req.body);

    res.status(204).send()
})

// join party by id
app.post('/api/v1/Fortnite/parties/:partyId/members/:accountId/join', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    const party = await getParty(req.params.partyId);

    if (!party) {
        throw errors.neoniteDev.party.partyNotFound.with(req.params.partyId);
    }

    // URGENT TODO: Check if the the user has permission to join.

    const body: party.JoinParty.Root = req.body;

    validateBody(body, joinSchema);

    const existing = party.members.find(x => x.account_id == req.params.accountId);

    if (existing) {
        party.reconnect(body.connection, req.params.accountId);

        return res.json(
            {
                status: "JOINED",
                party_id: party.id
            }
        );
    }

    party.addMember(body.connection, req.params.accountId);

    res.json(
        {
            status: "JOINED",
            party_id: party.id
        }
    );
})

app.delete('/api/v1/Fortnite/parties/:partyId/members/:accountId', verifyAuthorization(), async (req, res) => {
    const party = await getParty(req.params.partyId);

    if (!party) {
        throw errors.neoniteDev.party.partyNotFound.with(req.params.partyId);
    }

    var partyMember = party.members.find(x => x.account_id == req.params.accountId);

    if (!partyMember) {
        throw errors.neoniteDev.party.memberNotFound.with(req.params.accountId);
    }

    var partyLeader = party.members.find(x => x.role == 'CAPTAIN');

    if (!partyLeader) {
        throw errors.neoniteDev.internal.unknownError;
    }

    if (req.auth.account_id != req.params.accountId && partyLeader.account_id != req.params.accountId) {
        throw errors.neoniteDev.party.notLeader;
    }


    if (party.members.length == 1) {
        await party.deleteParty();
    } else {
        await party.removeMember(req.params.accountId);
    }

    res.status(204).end()
})

// get current user parties
app.get('/api/v1/:deploymentId/user/:accountId', verifyAuthorization(), async (req, res, next) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    const pings = await Pings.getUserPings(req.params.accountId);

    res.json({
        "current": localParties.filter(x => x.members.find(mem => mem.account_id == req.auth.account_id)).map(x => x.getData()),
        "pending": [],
        "invites": [],
        "pings": pings
    });
});

// invite a user to the party 
app.post('/api/v1/:deploymentId/parties/:partyId/invites/:accountId', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId == req.auth.account_id) {
        throw errors.neoniteDev.party.selfInvite;
    }

    const party = await getParty(req.params.partyId);

    if (!party) {
        throw errors.neoniteDev.party.partyNotFound.with(req.params.partyId);
    }

    if (typeof req.body != 'object') {
        throw errors.neoniteDev.basic.jsonMappingFailed;
    }

    party.inviteUser(req.params.accountId, req.auth.account_id, req.body);
})

// invite a user to the party 
app.post('/api/v1/:deploymentId/parties/:partyId/invites/:accountId', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId == req.auth.account_id) {
        throw errors.neoniteDev.party.selfInvite;
    }

    const party = await getParty(req.params.partyId);

    if (!party) {
        throw errors.neoniteDev.party.partyNotFound.with(req.params.partyId);
    }

    if (typeof req.body != 'object') {
        throw errors.neoniteDev.basic.jsonMappingFailed;
    }

    const meta = req.body != undefined ? mapObject<string>(req.body) : {};

    var member = party.members.find(x => x.account_id == req.auth.account_id);

    if (!member) {
        throw errors.neoniteDev.party.memberNotFound.with(req.auth.account_id);
    }

    party.inviteUser(req.params.accountId, req.auth.account_id, meta);

    if (req.query.sendPing === 'true') {
        console.log('cheking pings')
        const existingPing = await Pings.get(req.params.accountId, req.params.friendId);

        if (existingPing) {
            await Pings.remove(req.params.accountId, req.params.friendId);
        }

        const ping = {
            sent_by: req.params.accountId,
            sent_to: req.params.friendId,
            sent_at: new Date(),
            expires_at: new Date().addHours(1),
            meta: meta
        };

        console.log('created ping')
        await Pings.create(ping);

        console.log('sending message')
        xmppApi.sendMesage(
            `${req.params.accountId}@xmpp.neonitedev.live`,
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

        console.log('done sending message')
    }

    res.status(204).send();
})


// "ping" a user
app.post('/api/v1/:deploymentId/user/:friendId/pings/:accountId', verifyAuthorization(), async (req, res) => {
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

    const existingPings = await Pings.get(req.params.accountId, req.params.friendId);

    if (existingPings) {
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
        targetSessions[0].sessionId,
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
app.delete('/api/v1/:deploymentId/user/:accountId/pings/:pingerId', verifyAuthorization(), async (req, res) => {
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
app.post('/api/v1/:deploymentId/user/:accountId/pings/:pingerId/join', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId !== req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    if (req.params.accountId === req.params.pingerId) {
        throw errors.neoniteDev.party.selfPing;
    }

    const body: party.JoinParty.Root = req.body;

    validateBody(body, joinSchema);

    const partyData = localParties.find(x => x.members.findIndex(mem => mem.account_id == req.params.pingerId) != -1)

    if (!partyData) {
        throw errors.neoniteDev.party.userHasNoParty.with(req.params.pingerId);
    }

    const partyPing = await Pings.get(req.params.pingerId, req.params.accountId);

    if (partyPing) {
        throw errors.neoniteDev.party.pingNotFound.withMessage(`Ping from [${req.params.pingerId}] to [${req.params.accountId}] does not exist.`)
    }

    Pings.remove(req.params.pingerId, req.params.accountId);

    const party = new Party(partyData);

    party.addMember(body.connection, req.auth.account_id, body.meta);

    // TODO: Join confimation
    res.json({ "status": "JOINED", "party_id": party.id });
});

// view an invited party
app.get('/api/v1/:deploymentId/user/:accountId/pings/:pingerId/parties', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId !== req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    const partyPing = await Pings.get(req.params.pingerId, req.params.accountId);

    if (!partyPing) {
        throw errors.neoniteDev.party.pingNotFound.withMessage(`Ping from [${req.params.pingerId}] to [${req.params.accountId}] does not exist.`);
    }

    const partyData = localParties.find(x => x.members.findIndex(mem => mem.account_id == req.params.pingerId) != -1);

    res.json(partyData);
})

app.post('/api/v1/Fortnite/parties/:partyId/members/:accountId/conferences/connection', verifyAuthorization(), async (req: reqWithAuth, res) => {
    if (req.params.accountId !== req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    const party = localParties.find(x => x.id == req.params.partyId)

    if (!party) {
        throw errors.neoniteDev.party.partyNotFound.with(req.params.partyId);
    }

    const partyMemeber = party.members.find(x => x.account_id == req.params.accountId);

    if (!partyMemeber) {
        throw errors.neoniteDev.party.memberNotFound.with(req.params.accountId);
    }


    const providers: Record<string, Object> = {};

    const bIsRtcp = typeof req.body.providers == 'object' && typeof req.body.providers.rtcp == 'object';

    const bIsVixox = (
        (
            typeof req.body.providers == 'object' &&
            typeof req.body.providers.vivox == 'object'
        ) || !bIsRtcp
    );


    if (bIsRtcp) {
        const joinToken = await generateJoinToken(party.id, req.auth.account_id);

        const participant = joinToken.participants[0];

        if (!participant) {
            throw errors.neoniteDev.internal.eosError;
        }

        providers.rtcp = {
            participant_token: participant.token,
            client_base_url: joinToken.clientBaseUrl,
            room_name: joinToken.roomId
        }
    }


    if (bIsVixox &&
        process.env.vivoxDomain != undefined &&
        process.env.vivoxAppName != undefined &&
        process.env.vivoxSecret != undefined
    ) {
        const channel_uri = `sip:confctl-g-${process.env.vivoxAppName}.p-${party.id}@${process.env.vivoxDomain}`;
        const user_uri = `sip:.${process.env.vivoxAppName}.${req.auth.account_id}.@${process.env.vivoxDomain}`;

        const vivoxClaims = {
            "iss": process.env.vivoxAppName,
            "exp": Math.floor(new Date().addHours(2).getTime() / 1000),
            "vxa": "join",
            "f": user_uri,
            "t": channel_uri
        };

        const token = vxGenerateToken(process.env.vivoxSecret, vivoxClaims);

        providers.vivox = {
            "authorization_token": token,
            "channel_uri": channel_uri,
            "user_uri": user_uri
        }
    }

    if (!bIsRtcp || !bIsVixox) {
        throw errors.neoniteDev.internal.serverError;
    }

    res.json(
        {
            "providers": providers
        }
    );
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
    return Object.fromEntries(
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