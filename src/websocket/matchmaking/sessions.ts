import { randomUUID } from "crypto";
import matchmakingClient, { states } from ".";
import gameSessions, { availability, session } from "../../database/local/gameSessionsController";

export enum groupState {
    Queued,
    Finished
}

export default class GameSession {
    constructor(creator: matchmakingClient) {
        creator.state = states.Queued;
        this.creator = creator;
        this.id = randomUUID().replaceAll('-', '');

        // like 127.0.0.1:7777
        const ipAndPort = this.creator.payload.attributes['player.option.customKey'].split(':');

        const serverIp = ipAndPort[0];
        const serverPort = parseInt(ipAndPort[1]);

        this.sessionData = {
            id: this.id,
            ownerId: this.creator.payload.playerId,
            ownerName: this.creator.payload.playerId,
            totalPlayers: this.QueuedClients.length + 1,
            serverName: `${this.creator.payload.playerId}-gameserver`,
            serverAddress: serverIp,
            serverPort: isNaN(serverPort) ? 7777 : serverPort,
            maxPrivatePlayers: 200,
            maxPublicPlayers: 0,
            allowInvites: false,
            allowJoinInProgress: false,
            allowJoinViaPresence: false,
            allowJoinViaPresenceFriendsOnly: false,
            attributes: {},
            buildUniqueId: '',
            isDedicated: true,
            lastUpdated: new Date(),
            openPrivatePlayers: 200,
            openPublicPlayers: 0,
            privatePlayers: [this.creator.payload.playerId],
            publicPlayers: [],
            shouldAdvertise: false,
            started: false,
            usesPresence: false,
            usesStats: false
        }

        gameSessions.create(this.sessionData);

        this.updateQueue();
    }

    sessionData: session;
    id: string;
    state: groupState = groupState.Queued;
    QueuedClients: matchmakingClient[] = [];
    creator: matchmakingClient;

    addToQueue(client: matchmakingClient) {
        this.QueuedClients.push(client);
        this.updateQueue();
    }

    addMultipleToQueue(clients: matchmakingClient[]) {
        this.QueuedClients = this.QueuedClients.concat(clients);

        this.QueuedClients.forEach(async (client) => {
            client.session = this;
            client.state = states.Queued;
        });

        this.updateQueue();
    }

    onMemberDisconnect(client: matchmakingClient) {
        if (client.ticketId == this.creator.ticketId) {
            this.cancelSession();
        } else {
            this.updateQueue()
        }
    }

    updateQueue() {
        this.creator.ws.send(
            JSON.stringify(
                {
                    payload: {
                        ticketId: this.creator.ticketId,
                        queuedPlayers: this.QueuedClients.length + 1,
                        estimatedWaitSec: 0,
                        status: {
                            "ticket.status.canStartMatch": "true"
                        },
                        state: "Queued"
                    },
                    name: "StatusUpdate"
                }
            )
        );

        this.QueuedClients.forEach(x => {
            x.ws.send(
                JSON.stringify(
                    {
                        payload: {
                            ticketId: x.ticketId,
                            queuedPlayers: this.QueuedClients.length + 1,
                            estimatedWaitSec: 0,
                            status: {},
                            state: "Queued"
                        },
                        name: "StatusUpdate"
                    }
                )
            )
        })
    }

    startMatch() {
        if (this.state != groupState.Queued) {
            return;
        }

        this.creator.play(0);

        this.state = groupState.Finished;
        this.QueuedClients.forEach(x => {
            x.play(30);
        })
    }

    cancelSession() {
        if (this.state != groupState.Queued) {
            return;
        }

        this.QueuedClients.forEach(x => {
            x.ws.close(4999, "Match was cancelled");
        })

        this.QueuedClients = [];
        this.state = groupState.Finished;

        gameSessions.remove(this.id);
    }
}