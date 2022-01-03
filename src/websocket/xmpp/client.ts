import { WebSocket } from "ws";
import * as crypto from 'crypto';
import { fulltokenInfo, tokenInfo } from "../../structs/types";
import { xmppClients } from '../../structs/globals'
import party from '../../structs/Party'
import { rawXML } from "./xml";
import { states } from "./index";



export interface config {
    websocket: WebSocket,
    resource: string,
    authorization: fulltokenInfo,
    id: string,
    /** {adress}/{resource} */
    jabberId: string,
    /** jabberId without resource */
    adress: string,
    state:states
}

export default class implements config {
    constructor(config: config) {
        this.websocket = config.websocket;
        this.id = config.id;
        this.adress = config.adress;
        this.authorization = config.authorization;
        this.resource = config.resource;
        this.jabberId = config.jabberId;
    }

    party?: party;
    websocket: WebSocket;
    resource: string;
    authorization: fulltokenInfo;
    id: string;
    state: states = states.binded;

    /** {adress}/{resource} */
    jabberId: string;
    /** jabberId without resource */
    adress: string;

    destroy() {
        this.websocket.send(rawXML.close);
        this.websocket.close();
        xmppClients.remove(this);
    }
}