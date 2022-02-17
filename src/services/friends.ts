import errors, { ApiError } from '../structs/errors'
import Router from 'express-promise-router';
import verifyAuthorization from '../middlewares/authorization'
import validateMethod from '../middlewares/Method'
import Friends from '../database/friendsController';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from 'http-errors';
import users from '../database/usersController';
import * as xmppApi from '../xmppManager';

const app = Router();

app.get('/api/v1/:accountId/blocklist', verifyAuthorization(), (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    res.json([])
})

app.get('/api/v1/:accountId/recent/fortnite', verifyAuthorization(), (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    res.json([])
})

app.get('/api/v1/:accountId/summary', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    const friendsAndPending = await Friends.getFriends(req.params.accountId, true);

    const incomings = friendsAndPending.filter(x => x.status == 'PENDING' && x.direction == 'INCOMING');
    const outgoings = friendsAndPending.filter(x => x.status == 'PENDING' && x.direction == 'OUTGOING');
    const pending = friendsAndPending.filter(x => x.status == 'PENDING');
    const friends = friendsAndPending.filter(x => x.status == 'ACCEPTED');

    //TODO: colom with queried mutual in friends controller.

    res.json({
        friends: friends.map(x => {
            return {
                accountId: x.accountId,
                groups: [],
                alias: x.alias,
                note: x.note,
                favorite: x.favorite,
                created: x.created,
                // mutual: 0
            }
        }),
        incoming: pending.map(async x => {
            return {
                accountId: x.accountId,
                groups: [],
                alias: x.alias,
                note: x.note,
                favorite: x.favorite,
                created: x.created,
                // mutual: 0
            }
        }),
        outgoing: await Promise.all(
            incomings.map(async x => {
                return {
                    accountId: x.accountId,
                    groups: [],
                    alias: x.alias,
                    note: x.note,
                    favorite: x.favorite,
                    created: x.created,
                    // mutual: 0
                }
            })
        ),
        suggested: [],
        blocklist: [],
        settings: {
            acceptInvites: 'public'
        },
        limitsReached: {
            // we are not really  capping the friend requests but who cares lol. maybe I will add it in the future 
            incoming: incomings.length >= 500,
            outgoing: outgoings.length >= 500,
            accepted: friends.length >= 500
        }
    })
})


app.post('/api/v1/:accountId/blocklist/:friendId', verifyAuthorization(), (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    throw errors.neoniteDev.internal.notImplemented;
})


app.get('/api/v1/:accountId/friends/', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    const friends = await Friends.getFriends(req.params.accountId);

    res.json(
        friends.map(x => {
            return {
                accountId: x.accountId,
                groups: [],
                alias: x.alias,
                note: x.note,
                favorite: x.favorite,
                created: x.created,
                // mutual: 0
            }
        })
    );
})

// get a friendship
app.get('/api/v1/:accountId/friends/:friendId', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    const friendship = await Friends.getFriendship(req.params.accountId, req.params.friendId);

    if (!friendship) {
        throw errors.neoniteDev.friends.friendshipNotFound.withMessage(`Friendship between ${req.params.accountId} and ${req.params.friendId} does not exist`)
    }

    const mutual = await Friends.getMutual(req.params.accountId, req.params.friendId);

    res.json(
        {
            accountId: friendship.accountId,
            groups: [],
            alias: friendship.alias,
            note: friendship.note,
            favorite: friendship.favorite,
            created: friendship.created,
            mutual: mutual.length
        }
    )
})

// get mutual friends
app.get('/api/v1/:accountId/friends/:friendId/mutual', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    const mutuals = await Friends.getMutual(req.params.accountId, req.params.friendId);

    res.json(mutuals);
})

// add friend
app.post('/api/v1/:accountId/friends/:friendId', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    const existingRequest = await Friends.getRequest(req.params.accountId, req.params.friendId);

    if (existingRequest.length > 0) {
        var incomming = existingRequest.find(x => x.direction == 'INCOMING');
        
        if (incomming) {
            await Friends.acceptRequest(req.params.accountId, req.params.friendId);

            sendFriendShipUpdate(req.params.accountId, req.params.friendId, 'ACCEPTED', incomming.created);
            return res.status(204);
        }

        throw errors.neoniteDev.friends.requestAlreadySent
            .withMessage(`Friendship request has already been sent to ${req.params.friendId}`)
            .with(req.params.friendId);
    } else {
        const friendUser = await users.getById(req.params.friendId);

        if (!friendUser) {
            throw errors.neoniteDev.friends.accountNotFound.withMessage(`Account ${req.params.friendId} does not exist`).with(req.params.friendId)
        }

        await Friends.addRequest(req.params.accountId, req.params.friendId);
        sendFriendShipUpdate(req.params.accountId, req.params.friendId, 'PENDING', new Date());
    }

    res.status(204).send();
})


// public api


app.get('/api/public/friends/:accountId', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    const includePending = req.query.includePending === 'true';
    const friends = await Friends.getFriends(req.params.accountId, includePending);

    res.json(
        friends.map(x => {
            return {
                accountId: x.accountId,
                status: x.status,
                direction: x.direction,
                created: x.created,
                favorite: x.favorite
            }
        })
    );
})

app.post('/api/public/friends/:accountId/:friendId', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    const existingRequest = await Friends.getRequest(req.params.accountId, req.params.friendId);

    if (existingRequest.length > 0) {
        var incomming = existingRequest.find(x => x.direction == 'INCOMING');

        if (incomming) {
            await Friends.acceptRequest(req.params.accountId, req.params.friendId);

            sendFriendShipUpdate(req.params.accountId, req.params.friendId, 'ACCEPTED', incomming.created);
            return res.status(204);
        }

        throw errors.neoniteDev.friends.requestAlreadySent
            .withMessage(`Friendship request has already been sent to ${req.params.friendId}`)
            .with(req.params.friendId);
    } else {
        const friendUser = await users.getById(req.params.friendId);

        if (!friendUser) {
            throw errors.neoniteDev.friends.accountNotFound.withMessage(`Account ${req.params.friendId} does not exist`).with(req.params.friendId)
        }

        await Friends.addRequest(req.params.accountId, req.params.friendId);
        sendFriendShipUpdate(req.params.accountId, req.params.friendId, 'PENDING', new Date());
    }

    res.status(204).send();
})

app.get('/api/public/blocklist/:accountId/', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    res.json(
        {
            blockedUsers: []
        }
    )
})

app.get('/api/public/list/fortnite/:accountId/recentPlayers', verifyAuthorization(), async (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }

    res.json([]);
})

function sendFriendShipUpdate(from: string, to: string, status: string, created: Date) {
    xmppApi.sendMesageMulti(
        [`${from}@xmpp.neonitedev.live`, `${to}@xmpp.neonitedev.live`],
        {
            "type": "FRIENDSHIP_REQUEST",
            "timestamp": new Date(),
            "from": from,
            "to": to,
            "status": status
        }
    );

    xmppApi.sendMesage(
        `${to}@xmpp.neonitedev.live`,
        {
            "payload": {
                "accountId": from,
                "status": status,
                "direction": "INBOUND",
                "created": created,
                "favorite": false
            },
            "type": "com.epicgames.friends.core.apiobjects.Friend",
            "timestamp": new Date()
        }
    );

    xmppApi.sendMesage(
        `${from}@xmpp.neonitedev.live`,
        {
            "payload": {
                "accountId": to,
                "status": status,
                "direction": "OUTBOUND",
                "created": created,
                "favorite": false
            },
            "type": "com.epicgames.friends.core.apiobjects.Friend",
            "timestamp": new Date()
        }
    );
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
            errors.neoniteDev.internal.jsonParsingFailed.with(err.message).apply(res);
        } else if (err instanceof HttpError) {
            var error = errors.neoniteDev.internal.unknownError;
            error.statusCode = err.statusCode;
            error.withMessage(err.message).apply(res);
        }
        else {
            console.error(err)
            errors.neoniteDev.internal.serverError.apply(res);
        }
    }
)


module.exports = app;
