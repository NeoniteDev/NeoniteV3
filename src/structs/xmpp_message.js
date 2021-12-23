const { create: builder } = require('xmlbuilder2');

module.exports = class XmppMessage {
    constructor(message) {
        this.message = message;
    }

    build(from = "xmpp-admin@neonite.dev") {
        return builder("message").root()
        .att('xmlns', "jabber:client")
        .att('to', this.to)
        .att("from", from)
        .ele('body')
        .txt(JSON.stringify(this.message, null, 0))
        .up()
        .end({ headless: true, prettyPrint: true });
    }

    /** @param {import('./types').XmppClient} xmppClient */
    send(xmppClient) {
        this.to = xmppClient.Jid;
        xmppClient.Websocket.send(this.build())
    }
}