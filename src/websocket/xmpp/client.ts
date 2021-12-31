import { WebSocket } from "ws";
import * as crypto from 'crypto';
import { tokenInfo } from "../../structs/types";

interface config {
    websocket: WebSocket,
    resource: string,
    adress: string,
    authorization: tokenInfo,
    id: string
}

export default class {
    constructor(config: config) {
        this.websocket = config.websocket;
        this.id = config.id;
        this.adress = config.adress;
        this.authorization = config.authorization;
        this.resource = config.resource;

        
    }
    
    websocket: WebSocket;
    resource: string;
    adress: string;
    authorization: tokenInfo;
    id: string;

    destroy() {

    }
}