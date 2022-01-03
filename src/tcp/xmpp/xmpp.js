const net = require('net');
const builder = require('xmlbuilder2');
const tls = require('tls');
const parser = require('xml-parser');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
require('colors');

const server = net.createServer();

var baseLog = `[${'TCP XMPP'.cyan}]`;


const options = {
    key: fs.readFileSync(path.join('certs/server.key')),
    cert: fs.readFileSync('certs/server/server.crt'),
    ca: fs.readFileSync('certs/ca/ca.crt'), // authority chain for the clients
    requestCert: true, // ask for a client cert
    //rejectUnauthorized: false, // act on unauthorized clients at the app level
};

server.on('connection', (socket) => {
    console.log(baseLog, 'new connection');

    socket.on('data', (data) => {
        socket.pause()
        const message = data.toString();
        if (message.startsWith('<stream:stream')) {

            var stream_open= builder.fragment(
                {
                    'stream:stream': {
                        '@xmlns': 'jabber:client',
                        '@from': 'neonite.dev',
                        '@id': randomUUID(),
                        '@xml:lang': 'en',
                        '@version': '1.0',
                        '@xmlns:stream': 'http://etherx.jabber.org/streams'
                    }
                }
            ).end().replace(/\/[>]$/g, '>');

            var stream_feature = builder.fragment({
                'stream:features': {
                    '@xmlns:stream': 'http://etherx.jabber.org/streams',
                    '@xmlns': 'urn:ietf:params:xml:ns:xmpp-sasl',
                    mechanisms: {
                        '@xmlns': 'urn:ietf:params:xml:ns:xmpp-sasl',
                        mechanism: ['PLAIN', 'PLAIN', 'PLAIN', "PLAIN", 'plain']
                    },
                    ver: { '@xmlns': "urn:xmpp:features:rosterver"},
                    compression: {
                        '@xmlns': "http://jabber.org/features/compress",
                        method: 'zlib'
                    },
                    session: { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-session' },
                    bind: { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-bind' },
                    starttls: { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-tls' },
                    auth: { '@xmlns': 'http://jabber.org/features/iq-auth' }
                }
            }).end({ headless:true })

            socket.write(stream_open + stream_feature);
        } else if (message.startsWith('<starttls')) {
            var proceed = builder.create({
                'proceed': {
                    '@xmlns': 'urn:ietf:params:xml:ns:xmpp-tls'
                }
            }).end({ headless:true })

            socket.write(proceed);
            socket.wrap(new tls.TLSSocket(socket, options))
        }
        socket.resume();
        console.log(baseLog, 'data'.bgYellow, message);
    })

    socket.on('end', () => {
        console.log(baseLog, 'Client end');
    })

    socket.on('close', () => {
        console.log(baseLog, 'Connection closed');
    })

    socket.on('error', (error) => {
        console.error(baseLog, 'ERROR'.red, error);
    })
});

server.on('listening', () => {
    console.log(baseLog, 'Listening on port', server.address().port);
})

// since it doesn't work.
server.listen(5222);