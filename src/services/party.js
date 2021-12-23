const express = require('express');

const checkMethod = require('./../middlewares/Method');
const { CheckAuthorization, CheckClientAuthorization } = require('./../middlewares/authorization');
const errors = require('../structs/errors');
const Party = require('../structs/Party');
const { ValidatePartyPatch, ValidateMeta } = require('../structs/validation')
const { xmppClients, parties, pings } = require('../structs/globals')
const XmppMessage = require('../structs/xmpp_message');

const app = express.Router();

app.use(express.json())

/**
 * @type {import('./../structs/types')}
 */


// create party
app.post('/api/v1/:deploymentId/parties', CheckAuthorization, (req, res) => {
    if (!req.is('application/json')) {
        throw errors.neoniteDev.internal.unsupportedMediaType;
    }

    const xmppclient = xmppClients.find(x => x.Jid == req.body.join_info?.connection?.id);

    if (!xmppclient) {
        throw errors.neoniteDev.party.userOffline.with(req.auth.account_id)
    }

    const bHaveParty = parties.some(x => x.members.some(p => p.account_id == req.auth.account_id))

    if (bHaveParty) {
        throw errors.neoniteDev.party.alreadyInParty.with(req.auth.account_id, req.params.deploymentId)
    }

    const party = new Party(xmppclient, req.body.config, req.body.join_info, req.body.meta);

    parties.push(party);

    console.log(JSON.parse(JSON.stringify(party)))

    res.json(party.partyInfo());
})

// update party
app.patch('/api/v1/Fortnite/parties/:partyId', CheckAuthorization, (req, res) => {
    if (!req.is('application/json')) {
        throw errors.neoniteDev.internal.unsupportedMediaType;
    }

    ValidatePartyPatch(req.body);

    const party = parties.find(x => x.id == req.params.partyId);

    if (!party) {
        throw errors.neoniteDev.party.partyNotFound.with(req.params.partyId)
    }

    if (party.members.find(x => x.account_id == req.auth.account_id).role != 'CAPTAIN') {
        throw errors.neoniteDev.party.notLeader.with(req.auth.account_id, req.params.partyId);
    }

    party.Update(req.body.meta);

    res.status(204).end();
})

// get a party
app.get('/api/v1/Fortnite/parties/:partyId', CheckAuthorization, (req, res) => {
    const party = parties.find(x => x.id == req.params.partyId);

    if (!party) {
        throw errors.neoniteDev.party.partyNotFound.with(req.params.partyId)
    }

    res.json(party.partyInfo())
})


// update party memeber
app.patch('/api/v1/Fortnite/parties/:partyId/members/:accountId/meta', CheckAuthorization, (req, res) => {
    if (!req.is('application/json')) {
        throw errors.neoniteDev.internal.unsupportedMediaType;
    }

    ValidateMeta(req.body);

    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    const party = parties.find(x => x.id == req.params.partyId)

    if (!party) {
        throw errors.neoniteDev.party.partyNotFound.with(req.params.accountId)
    }

    const member = party.members.find(x => x.xmppClient.jwt.account_id === req.params.accountId)

    if (!member) {
        throw errors.neoniteDev.party.memberNotFound.with(req.params.accountId);
    }

    party.UpdateMember(member.account_id, req.body)

    res.status(204).end()
})


app.get('/api/v1/Fortnite/user/:accountId', CheckAuthorization, async (req, res, next) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    res.json({
        "current": parties.filter(x => x.members.find(x => x.account_id === req.auth.account_id)).map(x => x.partyInfo()),
        "pending": [],
        "invites": [],
        "pings": []
    });
});

// invite a user
app.post('/api/v1/Fortnite/user/:userToPing/pings/:accountId', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    const xmppClient = xmppClients.find(x => x.jwt.iai === req.params.userToPing);

    if (!xmppClient) {
        throw errors.neoniteDev.party.userOffline.with(req.params.userToPing);
    }

    pings.push({ from: req.params.accountId, to: req.params.userToPing });

    new XmppMessage({
        expires: new Date().addHours(1),
        meta: req.body || {},
        ns: "Fortnite",
        pinger_dn: req.auth.DisplayName,
        pinger_id: req.params.accountId,
        sent: new Date(),
        type: "com.epicgames.social.party.notification.v0.PING"
    }).send(xmppClient);


    res.json({
        sent_by: req.params.accountId,
        sent_to: req.params.userToPing,
        sent_at: new Date(),
        expires_at: new Date().addHours(1),
        meta: req.body || {}
    })
})

// join a party from a ping
app.post('/api/v1/Fortnite/user/:accountId/pings/:pingerId/join', CheckAuthorization, (req, res) => {
    if (req.params.accountId !== req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    const ping = pings.find(x => x.from == req.params.pingerId && x.to == req.params.accountId);

    if (!ping) {
        throw errors.neoniteDev.party.pingNotFound.with(req.params.accountId, req.params.pingerId);
    }

    const party = parties.find(x => x.members.find(x => x.account_id === req.params.pingerId));

    if (!party) {
        throw new errors.neoniteDev.party.userHasNoParty.with(req.params.pingerId);
    }

    const xmppClient = xmppClients.find(x => x.jwt.iai === req.auth.account_id);

    party.addMember(xmppClient, req.body);

    res.json({ "status": "JOINED", "party_id": party.id })
});

// view an invited party
app.get('/api/v1/Fortnite/user/:accountId/pings/:pingerId/parties', CheckAuthorization, (req, res) => {
    if (req.params.accountId !== req.auth.account_id) {
        throw errors.neoniteDev.party.notYourAccount.with(req.params.accountId, req.auth.account_id);
    }

    const ping = pings.find(x => x.from == req.params.pingerId && x.to == req.params.accountId);

    if (!ping) {
        throw errors.neoniteDev.party.pingNotFound.with(req.params.accountId, req.params.pingerId);
    }

    const party = parties.find(x => x.members.find(x => x.account_id === req.params.pingerId))

    if (!party) {
        return res.json([]);
    }

    res.json(
        [
            party.partyInfo()
        ]
    )
})

app.use(checkMethod(app));

app.use(() => {
    throw errors.neoniteDev.basic.notFound;
})

app.use(
    /**
    * @param {any} err
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {express.NextFunction} next
    */
    (err, req, res, next) => {
        if (err instanceof ApiException) {
            err
                .Add('originatingService', 'party')
                .apply(res);
        } else if (err instanceof SyntaxError && err.type == 'entity.parse.failed') {
            new ApiException(errors.com.epicgames.common.json_parse_error)
                .With(err.message)
                .Add('originatingService', 'party')
                .apply(res);
        }
        else {
            console.log(err);
            new ApiException(errors.com.epicgames.common.server_error)
                .Add('originatingService', 'party')
                .apply(res);
        }
    }
)

module.exports = app;