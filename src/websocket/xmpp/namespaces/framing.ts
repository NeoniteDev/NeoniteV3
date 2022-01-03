import { Document } from 'xml-parser';
import { PreConfig, states } from '../index'
import builder from 'xmlbuilder2';
import { XMLWriterOptions } from 'xmlbuilder2/lib/interfaces';
import { randomUUID } from 'crypto';

export const xmlns = 'urn:ietf:params:xml:ns:xmpp-framing';

const writerOptions: XMLWriterOptions = {
    headless: true,
    prettyPrint: true
};

export function open(document: Document, config: PreConfig) {
    if (
        !document.root.attributes.to ||
        document.root.attributes.to.toLowerCase() != 'neonitedev.live'
    ) {
        config.websocket.send(
            builder.fragment(
                {
                    'open': {
                        '@xmlns': xmlns,
                        '@from': document.root.attributes.to || 'null',
                        '@id': 'tigase-error-tigase',
                        '@version': '1.0',
                        '@xml:lang': 'en'
                    },
                    'stream:error': {
                        '@xmlns:stream': 'http://etherx.jabber.org/streams',
                        'host-unknown': {
                            '@xmlns': 'urn:ietf:params:xml:ns:xmpp-streams'
                        }
                    },
                    'close': {
                        '@xmlns': xmlns
                    }
                }
            ).end(writerOptions)
        );

        config.websocket.close();
        return;
    }

    if (config.state <= states.opened) {
        if (config.state == states.none) {
            config = {
                ...config,
                id: randomUUID(),
                state: states.opened
            }
        }

        config.websocket.send(
            builder.fragment(
                {
                    'open': {
                        '@xmlns': xmlns,
                        '@from': 'neonite.dev',
                        '@id': config.id
                    },
                    'stream:features': {
                        '@xmlns:stream': 'http://etherx.jabber.org/streams',
                        'mechanisms': {
                            '@xmlns': 'urn:ietf:params:xml:ns:xmpp-sasl',
                            'mechanism': 'PLAIN'
                        }
                    }
                }
            ).end(writerOptions)
        )
    }
    else if (config.state >= states.authed) {
        config.websocket.send(
            builder.fragment(
                {
                    defaultNamespace: {
                        ele: 'jabber:client'
                    }
                },
                {
                    'open': {
                        '@xmlns': xmlns,
                        '@from': 'neonite.dev',
                        '@id': config.id
                    },
                    'stream:features': {
                        '@xmlns:stream': 'http://etherx.jabber.org/streams',
                        'session': { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-session' },
                        'bind': { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-bind' }
                    }
                }
            ).end(writerOptions)
        )
    }
}

export function close(document: Document, config: PreConfig) {
    config.websocket.send(
        builder.create(
            {
                'close': {
                    '@xmlns': xmlns
                }
            }
        ).end(writerOptions)
    )

    if (config.client) {
        config.client.destroy();
    }

    config.websocket.close();
}