import { xml } from "@xmpp/client";
import { randomUUID } from "crypto";
import matchmakingClient, { states } from ".";
import gameSessions, { availability, Session } from "../../database/gameSessionsController";

export enum groupState {
    Queued,
    Finished
}

export default class GameSession {
    constructor(creator: matchmakingClient) {
        creator.state = states.Queued;
        this.creator = creator;
        this.id = randomUUID().replaceAll('-', '');

        this.sessionData = {
            id: this.id,
            availableTo: availability.trusted,
            expireAt: new Date(),
            createdAt: new Date(),
            numPlayers: this.QueuedClients.length + 1,
            maxPlayers: 200,
            minPlayers: 1,
            ownerName: this.creator.payload.playerId,
            serverName: `${this.creator.payload.playerId}-gameserver`,
            severIp: this.creator.payload.attributes['player.option.customKey'],
        }

        gameSessions.create({
            ...this.sessionData,
            expireAt: this.sessionData.expireAt.getTime()
        });

        this.updateQueue();
    }

    sessionData: Session;
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
            this.cancellSession();
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

    cancellSession() {
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