import { randomUUID } from "crypto";
import { IncomingMessage } from "http";
import { WebSocketServer, VerifyClientCallbackAsync } from "ws";
import GameSessions, { availability } from '../../database/local/gameSessionsController';
import * as crypto from 'crypto';
import GameSession, { groupState } from "./sessions";

export enum states {
    None,
    Connecting,
    QueueFull,
    Waiting,
    FindingMatch,
    Queued,
    /* ReadyCheck,
     SessionAssignment,*/
    Finished
}

interface payload {
    playerId: string,
    partyPlayerIds: string[],
    bucketId: string,
    attributes: Record<string, string>,
    expireAt: Date,
    nonce: string
}

interface messageData {
    "name": string,
    "payload": Record<string, any>
}

const allowedToStartMatches = [
    "98748c9691494acc9b0a92dc73dca5fa"
]

const LocalGameSessions: GameSession[] = [];

var QueuedClients: matchmakingClient[] = [];

export default class matchmakingClient {
    constructor(ws: WebSocket, req: IncomingMessage) {
        this.ws = ws;
        this.req = req;
        this.ticketId = randomUUID();

        // will never happend, just to appease typescript/intellisence
        if (!req.headers.authorization) {
            ws.close(); throw new Error('invalid');
        }

        const AuthArray = req.headers.authorization.split(' ');
        AuthArray.shift();

        const [ticketType, payload, signature] = AuthArray

        if (!AuthArray || !ticketType || !payload || !signature) {
            ws.close(); throw new Error('invalid');
        }

        this.payload = JSON.parse(Buffer.from(payload, 'base64').toString());

        ws.onclose = () => this.onClose();
        ws.onmessage = (data) => {
            if (data.data == 'ping') { return; };
            try {
                var jData = JSON.parse(data.data);
                this.onMessage(jData);
            } catch {
                this.ws.close(1008, 'service.policy_violation.8');
            }
        }

        this.advance();
    }

    payload: payload;
    ws: WebSocket;
    req: IncomingMessage;
    state: states = states.None;
    ticketId: string;
    queuedSince?: Date;
    session?: GameSession;

    async onClose() {
        if (this.session) {
            this.session.onMemberDisconnect(this);
        }

        if (QueuedClients.includes(this)) {
            QueuedClients.remove(this);
        }
    }

    async onMessage(message: messageData) {
        switch (message.name) {
            case 'Exec': {
                var command: string = message.payload.command;

                if (!command) {
                    this.ws.close(4210, 'player.bucket_termination.210');
                    return;
                }

                switch (command) {
                    case 'p.StartMatch': {
                        console.log(this.session, this.session?.creator.ticketId == this.ticketId)
                        if (this.session && this.session.creator.ticketId == this.ticketId) {
                            console.log('startMatch')
                            this.session.startMatch();
                        }
                        break;
                    }

                    default: {
                        this.ws.close(4210, 'player.bucket_termination.210');
                    }
                }
                
                return;
            }
        }
    };

    async advance() {
        switch (this.state) {
            case states.None: {
                this.ws.send(
                    JSON.stringify(
                        {
                            payload: {
                                state: "Connecting"
                            },
                            name: "StatusUpdate"
                        }
                    )
                );

                this.state = states.Connecting;
            }

            case states.Connecting: {
                if (this.payload.attributes['player.option.customKey']) {
                    /*if (!allowedToStartMatches.includes(this.payload.playerId)) {
                        /*this.ws.send(
                            JSON.stringify(
                                {
                                    "name": "Error",
                                    "payload": {
                                        "code": 4401,
                                        "reason": "match.custom_key_not_supported.401"
                                    }
                                }
                            )
                        );*//*

                    this.ws.close(4401, 'match.custom_key_not_supported.401');
                    return; } */

                    this.ws.send(
                        JSON.stringify(
                            {
                                payload: {
                                    state: "Waiting",
                                    totalPlayers: 1,
                                    connectedPlayers: 0
                                },
                                name: "StatusUpdate"
                            }
                        )
                    );

                    var session = new GameSession(this);
                    this.session = session;
                    LocalGameSessions.push(session);
                    break;
                }

                if (QueuedClients.length > 100) {
                    this.ws.send(
                        JSON.stringify(
                            {
                                payload: {
                                    state: "QueueFull"
                                },
                                name: "StatusUpdate"
                            }
                        )
                    );

                    this.state = states.QueueFull;
                    setTimeout(() => this.advance(), 5000)
                    break;
                }

                this.ws.send(
                    JSON.stringify(
                        {
                            payload: {
                                state: "Waiting",
                                totalPlayers: 1,
                                connectedPlayers: 0
                            },
                            name: "StatusUpdate"
                        }
                    )
                );

                this.state = states.Waiting;
                this.advance();
                break;
            }

            case states.QueueFull: {
                if (QueuedClients.length < 300) {
                    this.ws.send(
                        JSON.stringify(
                            {
                                payload: {
                                    state: "Waiting",
                                    totalPlayers: 1,
                                    connectedPlayers: 0
                                },
                                name: "StatusUpdate"
                            }
                        )
                    );

                    this.state = states.Waiting;
                } else {
                    setTimeout(() => this.advance(), 2500)
                    break;
                }
            }

            case states.Waiting: {
                this.ws.send(
                    JSON.stringify({
                        payload: {
                            state: "Queued",
                            ticketId: this.ticketId,
                            queuedPlayers: QueuedClients.length,
                            estimatedWaitSec: QueuedClients.length * 2,
                            status: {}
                        },
                        name: "StatusUpdate"
                    })
                );

                this.queuedSince = new Date();
                QueuedClients.push(this);

                this.state = states.FindingMatch;
            }

            // the rest of the states are handled by the session class
        }
    }

    async play(joinDelaySec: number) {
        if (!this.session) {
            this.ws.close(1006, 'no session is assigned to client!');
            return;
        }

        this.ws.send(
            JSON.stringify(
                {
                    payload: {
                        state: "SessionAssignment",
                        matchId: this.session.id
                    },
                    name: "StatusUpdate"
                }
            )
        )

        this.ws.send(
            JSON.stringify(
                {
                    payload: {
                        sessionId: this.session.id,
                        joinDelaySec: joinDelaySec,
                        matchId: this.session.id
                    },
                    name: "Play"
                }
            )
        )

        this.ws.close(1000);
    }
}

async function updateQueue() {
    const sortedClients = QueuedClients.sort(
        (a, b) => a.queuedSince && b.queuedSince ? a.queuedSince.getDate() - b.queuedSince.getDate() : -1
    );

    sortedClients.forEach((client, index) => {
        client.ws.send(
            JSON.stringify({
                payload: {
                    state: "Queued",
                    ticketId: client.ticketId,
                    queuedPlayers: QueuedClients.length,
                    estimatedWaitSec: index * 0.5,
                    status: LocalGameSessions.length == 0 ? 2 : 3
                },
                name: "StatusUpdate"
            })
        )
    })
}

function processQueueLoop() {
    if (QueuedClients.length <= 0) {
        setTimeout(processQueueLoop, 2500);
        return;
    }

    const sessions = LocalGameSessions.filter(x => x.QueuedClients.length + 1 < x.sessionData.maxPrivatePlayers && x.state == groupState.Queued);

    sessions.forEach((session) => {
        var clientsToSession = QueuedClients.sort(
            (a, b) => a.queuedSince && b.queuedSince ? a.queuedSince?.getDate() - b.queuedSince?.getDate() : -1
        ).slice(0, session.sessionData.maxPrivatePlayers - 1);

        QueuedClients = QueuedClients.filter(x => !clientsToSession.includes(x));

        session.addMultipleToQueue(clientsToSession);
    })


    updateQueue();
    setTimeout(processQueueLoop, 1500)
}

processQueueLoop();

// TODO: table for match perms.
function isEligible(availability: availability, accountId: string) {
    return true;
    // return allowedToStartMatches.includes(accountId);
}

export async function verifyClient(info: Parameters<VerifyClientCallbackAsync>['0'], callback: Parameters<VerifyClientCallbackAsync>['1']) {
    const req = info.req;

    if (req.headers.authorization == undefined) {
        return callback(false, 401);
    }

    const AuthArray = req.headers.authorization.split(' ');
    AuthArray.shift();

    const [ticketType, payload, signature] = AuthArray

    if (!AuthArray || !ticketType || !payload || !signature) {
        return callback(false, 401);
    }

    if (!process.env.mms_key) {
        return callback(false, 500);
    }

    const genSignature = crypto.createHmac('sha256', process.env.mms_key).update(payload).digest().toString('base64')

    if (genSignature != signature) {
        return callback(false, 401);
    }

    return callback(true)
};

export function onConnection(ws: WebSocket, req: IncomingMessage) {
    new matchmakingClient(ws, req);
}