import * as builder from 'xmlbuilder2';
import Client from '../websocket/xmpp/client'

export default class xmppMessage {
    constructor(message: object) {
        this.message = message;
    }

    message: object;

    send(client: Client) {
        const fragment = builder.fragment("message").root()
            .att('xmlns', "jabber:client")
            .att('to', client.jabberId)
            .att("from", "xmpp-admin@neonite.dev")
            .ele('body')
            .txt(JSON.stringify(this.message, undefined, 0))
            .up()
            .end({ headless: true, prettyPrint: true });

        client.websocket.send(fragment);
    }
}