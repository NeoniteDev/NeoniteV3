const Websocket = require('ws');
const { IncomingMessage } = require('http')
const { randomUUID: uuid } = require('crypto')

/**
 * @typedef {import('./../../structs/types').MatchmakingAuth} MatchmakingAuth
 */


/**
 * @type {(this: Server, socket: WebSocket, request: IncomingMessage)} ws
 */
module.exports.onConnection = (ws, req) => {
    /**
     * @type {MatchmakingAuth}
     */
    const Auth = req.Auth;

    const _send = ws.send;

    ws.send = function (data) {
        if (data instanceof Object) {
            arguments[0] = JSON.stringify(arguments[0])
        }
        return _send.apply(this, arguments);
    }

    const ticketId = uuid().replace(/-/g, '');
    const matchId = uuid().replace(/-/g, '');

    ws.send({
        payload:
        {
            state: "Connecting"
        },
        name: "StatusUpdate"
    });

    var wait = 0;


    wait += 1000;
    setTimeout(() =>
        ws.send({
            payload:
            {
                state: "Waiting",
                totalPlayers: 1,
                connectedPlayers: 0
            },
            name: "StatusUpdate"
        }), wait
    );


    wait += 1000;
    setTimeout(() =>
        ws.send({
            payload:
            {
                state: "Queued",
                queuedPlayers: 1,
                estimatedWaitSec: 3,
                status: 2,
                ticketId: ticketId
            },
            name: "StatusUpdate"
        }), wait
    );


    wait += 3000;
    setTimeout(() =>
        ws.send({
            payload:
            {
                state: "ReadyCheck",
                matchId: matchId,
                status: "PASSED",
                durationSec: 2,
                ready: true,
                responded: 1,
                totalPlayers: 1,
                readyPlayers: 1
            },
            name: "StatusUpdate"
        }), wait
    );

    wait += 2000;
    setTimeout(() =>
        ws.send({
            payload:
            {
                state: "SessionAssignment",
                matchId: matchId
            },
            name: "StatusUpdate"
        }), wait
    );

    wait += 1000;
    setTimeout(() =>
        ws.send({
            payload:
            {
                sessionId: matchId,
                joinDelaySec: 2,
                matchId: matchId
            },
            name: "Play"
        }), wait
    );



}

/**
 * @type {Websocket.VerifyClientCallbackAsync}
 */
module.exports.VerifyClient = (info, callback) => {
    const req = info.req;

    if (!req.headers.authorization) {
        callback(false, 401);
    }

    const AuthArray = req.headers.authorization.split(' ');
    AuthArray.shift();

    const [ticketType, payload, signature] = AuthArray

    if (!AuthArray || !ticketType || !payload || !signature) {
        callback(false, 401);
    }

    info.req.Auth = {
        ticketType,
        payload,
        signature
    }

    return callback(true)
}