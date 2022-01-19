import * as builder from 'xmlbuilder2';
import {} from '../xmppManager';

export default class xmppMessage {
    constructor(message: any) {
        this.message = message;
    }

    message: object;

    send(client: any) {
        
    }
}