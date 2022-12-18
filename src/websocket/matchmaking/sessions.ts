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

        // Neonite:Live:4774386:0:NAE:playlist_defaultsolo:PC:public:1
        const [game, env, netcl] = creator.payload.bucketId.split(':');

        this.sessionData = {
            "id": this.id,
            "ownerId": "Neonite",
            "ownerName": "Kemo",
            "serverName": "Neonite",
            "serverAddress": serverIp,
            "serverPort": isNaN(serverPort) ? 7777 : serverPort,
            "totalPlayers": 0,
            "maxPublicPlayers": 10,
            "openPublicPlayers": 10,
            "maxPrivatePlayers": 1,
            "openPrivatePlayers": 5,
            "attributes": {},
            "publicPlayers": [],
            "privatePlayers": [],
            "allowJoinInProgress": false,
            "shouldAdvertise": false,
            "isDedicated": true,
            "usesStats": false,
            "allowInvites": false,
            "usesPresence": false,
            "allowJoinViaPresence": true,
            "allowJoinViaPresenceFriendsOnly": false,
            "buildUniqueId": parseInt(netcl),
            "lastUpdated": new Date(),
            "started": false
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