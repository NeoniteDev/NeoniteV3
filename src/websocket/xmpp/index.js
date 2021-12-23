const Websocket = require('ws');
const JWT = require('jsonwebtoken');
const parser = require('xml-parser');
const { create: builder } = require('xmlbuilder2');
const { XMLBuilderImpl } = require('xmlbuilder2/lib/builder/XMLBuilderImpl');
const { objects: builderObjects, namespaces, string: xmlStrings, build_server_error, validation, validate } = require('./xml.js');
const path = require('path')
const crypto = require('crypto')

const { xmppClients } = require('../../structs/globals')


/**
 * @typedef {import('./../../structs/types').XmppClient} XmppClient
 * @typedef {import('./../../structs/types').Credentials} Credentials
 * @typedef {import('./../../structs/types').Jwt} Jwt

*/

/**
* @type {Websocket.VerifyClientCallbackAsync}
*/
module.exports.VerifyClient = (info, callback) => {
    if (info.req.headers['sec-websocket-protocol'] != 'xmpp') {
        return callback(false, 400);
    }

    callback(true)
}

/**
 * @param {Websocket} ws
 */
module.exports.onConnection = (ws, req) => {
    console.log(`[${'XMPP'.yellow}]`, `New Connection`);

    const id = crypto.randomUUID();
    var bisAuthed = false

    /** @type {Jwt} */
    var jwt;

    var bIsOpened = false;
    var bBindedResource = false;
    var resourcenumber = 1;


    /** @type {XmppClient} */
    const xmppClient = {};

    xmppClient.Websocket = ws;

    const _send = ws.send;

    ws.send = function () {
        if (arguments[0] instanceof XMLBuilderImpl) {
            arguments[0] = arguments[0].root().end({ headless: true, prettyPrint: true })
        }

        _send.apply(this, arguments);
    }

    ws.onclose = function () {
        if (xmppClients.includes(xmppClient)) {
            xmppClients.remove(xmppClient);
        }

        xmppClients.forEach(client => {
            client.Websocket.send(builder({
                presence: {
                    '@from': xmppClient.Jid,
                    '@type': 'unavailable',
                    status: {
                        '#': xmppClient.presence ? JSON.stringify(xmppClient.presence) : 'Playing Fortnite'
                    }
                }
            }))
        })
    }

    ws.onerror = function () {
        if (bIsOpened) {
            ws.send(
                '<stream:error>\n' +
                '    <internal-server-error\n' +
                "        xmlns='urn:ietf:params:xml:ns:xmpp-streams'/>\n" +
                '</stream:error>'
            )
        }

        ws.close(1011);
    }

    ws.onmessage = function ({ data: msg }) {
        const xml = parser(msg).root;

        if (!xml && bIsOpened) {
            const build = builder({
                'stream:error': {
                    '@xmlns:stream': 'http://etherx.jabber.org/streams',
                    'not-well-formed': { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-streams' }
                }
            }).end({ headless: true });

            ws.send(build + xmlStrings.close);
            ws.close();
            return;
        }
        else if (!xml) {
            return;
        }

        if (!bIsOpened && xml.name === 'open') {
            if (xml.attributes.to != 'Neonite.dev') {
                const build = builderObjects.build_tigase_error(msg, xml);

                ws.send(build + xmlStrings.close);
                ws.close()
                return;
            }

            if ('xmlns' in xml.attributes && xml.attributes.xmlns !== namespaces['xmpp-framing']) {
                const build = build_server_error(msg);
                build.att('xmlns', namespaces['xmpp-framing']);
                build.ele({
                    'invalid-namespace': {
                        'host-unknown': { '@xmlns': namespaces['xmpp-stream'] }
                    }
                })
            }

            ws.send(builder(builderObjects.open).root().att('id', id));
            ws.send(builder(builderObjects['stream:features']))
            bIsOpened = true;
            return;
        } else if (!bIsOpened) {
            return;
        }

        switch (xml.name) {
            case 'open': {
                if (xml.attributes.to != 'Neonite.dev') {
                    const build = builderObjects.build_tigase_error(msg);

                    ws.send(build + xmlStrings.close);
                    ws.close()
                    return;
                }

                ws.send(builder(builderObjects.open).root().att('id', id));
                ws.send(builder(builderObjects['stream:features-session']))
                break;
            }

            case 'auth': {
                var validation = validate(msg, 'SASL');

                if (validation.errors) {
                    const build = builder(
                        {
                            'stream:error': {
                                'invalid-xml': { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-streams' }
                            }
                        }
                    ).end({ headless: true });

                    ws.send(build + '\n' + xmlStrings.close);
                    ws.close();
                    return;
                }

                if (xml.attributes.mechanism != 'PLAIN') {
                    ws.send(
                        builder({
                            failure: {
                                '@xmlns': 'urn:ietf:params:xml:ns:xmpp-sasl',
                                'invalid-mechanism': {}
                            }
                        })
                    );
                    return;
                }

                const AuthArray = Object.entries(Buffer.from(xml.content, 'base64').toString().split('\u0000'));

                AuthArray.shift();

                /** @type {Credentials} */
                const Auth = Object.fromEntries(
                    AuthArray.map(([index, value]) => [index == 1 ? 'Username' : 'Password', value])
                )

                try {
                    const jwt_token = Auth.Password.replace(/eg1~/i, '');
                    jwt = JWT.verify(jwt_token, 'ec0cd96e1c7d5832913b126786c441e20b2230c6')
                } catch (e) {
                    ws.send(builder(builderObjects['auth-failure']).root().txt(e.toString()));
                    return;
                }



                if (Auth.Username != jwt.sub) {
                    ws.send(builder(builderObjects['auth-failure']));
                    return;
                }


                bisAuthed = true;
                xmppClient.jwt = jwt;
                xmppClient.token = Auth.Password;
                ws.send(builder(builderObjects['auth-succes']))

                break;
            }

            case 'iq': {
                var validation = validate(msg, 'client');

                if (validation.errors) {
                    const build = builder(
                        {
                            'stream:error': {
                                'invalid-xml': { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-streams' }
                            }
                        }
                    ).end({ headless: true });

                    ws.send(build + '\n' + xmlStrings.close);
                    ws.close();
                    return;
                }

                switch (xml.children[0].name) {
                    case 'bind': {
                        var bind = xml.children[0];
                        var s_bind = builder(msg).root().first().toString();

                        var validation = validate(s_bind, 'binding');

                        if (validation.errors) {
                            const build = builder(
                                {
                                    'stream:error': {
                                        'invalid-xml': { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-streams' }
                                    }
                                }
                            ).end({ headless: true });
        
                            ws.send(build + '\n' + xmlStrings.close);
                            ws.close();
                            return;
                        }

                        if (!bisAuthed) {
                            return ws.send(builder(builderObjects.session_not_authorized(msg)));
                        }
                        var resource = bind.children[0]?.content;

                        if (!resource) {
                            resource = 'Neonite-' + resourcenumber;
                            resourcenumber++;
                        }

                        const sameJidUsers = xmppClients.find(x => { x.resource = resource; })

                        if (sameJidUsers) {
                            sameJidUsers.Websocket.close();
                            xmppClients.remove(sameJidUsers);
                        }

                        xmppClient.resource = resource;

                        xmppClient.Jid = `${xmppClient.jwt.iai}@Neonite.dev/${resource}`;

                        const build = builder(builderObjects['iq-response']).root();
                        build.att('to', xmppClient.Jid);
                        build.att('id', xml.attributes.id || undefined);
                        build.ele({
                            bind: {
                                '@xmlns': 'urn:ietf:params:xml:ns:xmpp-bind',
                                jid: xmppClient.Jid
                            }
                        });

                        bBindedResource = true;
                        ws.send(build);
                        break;
                    }
                    case 'session': {
                        if (!bisAuthed) {
                            return ws.send(builder(builderObjects.session_not_authorized(msg)));
                        }

                        if (!bBindedResource) {
                            ws.send(builder(builderObjects.not_binded(msg)));
                            ws.send(builder(builderObjects.service_unavailable(msg)));
                            return;
                        }

                        xmppClients.push(xmppClient);

                        const build = builder(builderObjects['iq-response']).root();

                        build.att('to', xmppClient.Jid);
                        build.att('id', xml.attributes.id || undefined);
                        build.ele({
                            session: {
                                '@xmlns': 'urn:ietf:params:xml:ns:xmpp-session',
                            }
                        });

                        ws.send(build);
                        break;
                    }
                    case 'ping': {
                        const build = builder(builderObjects['iq-response']).root();

                        build.att('to', xmppClient.Jid);
                        build.att('id', xml.attributes.id || undefined);
                        build.ele({
                            'ping': {
                                '@xmlns': 'urn:xmpp:ping',
                            }
                        });

                        ws.send(build);
                        break;
                    }

                    default: {
                        ws.send(builder(builderObjects.feature_not_implemented(msg)));
                        break;
                    }
                }
                break;
            }

            case 'presence': {
                var validation = validate(msg, 'client');

                if (validation.errors) {
                    const build = builder({
                        'stream:error': {
                            'invalid-xml': { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-streams' }
                        }
                    }).end({ headless: true });

                    ws.send(build + '\n' + xmlStrings.close);
                    ws.close();
                    return;
                }


                if (!bisAuthed) {
                    const BuildObject = builderObjects.session_not_authorized(msg);
                    BuildObject.error.text['#'] = 'You must authenticate session first, before you can send any message or presence packet.';

                    ws.send(builder(BuildObject));
                    ws.send(builder(builderObjects.service_unavailable(msg)));
                    return;
                }

                if (!bBindedResource) {
                    ws.send(builder(builderObjects.not_binded(msg)));
                    ws.send(builder(builderObjects.service_unavailable(msg)));
                    return;
                }

                try {
                    xmppClient.presence = JSON.parse(xml.children.find(x => x.name == 'status').content);
                } catch { }

                const Build = builder(msg).root();

                if (xml.attributes.to) {
                    // todo
                }

                if (!xml.attributes.xmlns) {
                    Build.att('xmlns', 'jabber:client');
                }

                Build.att('from', xmppClient.Jid);

                xmppClients.forEach(client => {
                    if (client.Jid == xmppClient.Jid)
                        return;

                    Build.att('to', client.Jid);
                    client.Websocket.send(Build);

                    if ('presence' in xmppClient) {
                        ws.send(builder({
                            presence: {
                                '@from': client.Jid,
                                '@to': xmppClient.Jid,
                                status: {
                                    '#': JSON.stringify(xmppClient.presence)
                                }
                            }
                        }))
                    }

                })

                break;
            }

            default: {
                if (!bBindedResource && bisAuthed) {
                    ws.send(builder(builderObjects.not_binded(msg)));
                    ws.send(builder(builderObjects.service_unavailable(msg)));
                    return;
                }

                ws.send(builder(builderObjects.feature_not_implemented(msg)));
                break;
            }
        }
    }
};

function exitHandler() {
    xmppClients.forEach(client => {
        client.Websocket.send(xmlStrings['system-shutdown'] + '\n' + xmlStrings.close);
        client.Websocket.close(1012);
    })

    process.exit()
}

process.on('SIGINT', exitHandler.bind());
process.on('SIGUSR1', exitHandler.bind());
process.on('SIGUSR2', exitHandler.bind());
