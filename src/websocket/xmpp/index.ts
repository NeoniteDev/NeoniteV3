import * as websocket from 'ws';
import * as parser from 'xml-parser';
import { create as builder } from 'xmlbuilder2';
import * as crypto from 'crypto';
import Client, { config as Config } from './client';
import { xmppClients } from '../../structs/globals'
import { validateToken } from '../../middlewares/authorization'
import { } from 'colors';

import { objects as builderObjects, buildFunctions, namespaces, rawXML, validate } from './xml';
import { XMLWriterOptions } from 'xmlbuilder2/lib/interfaces';
import { stat } from 'fs';
import { fulltokenInfo, tokenInfo } from '../../structs/types';

//                  null <-------------------- accountId -----------------------> null <--------------------------------------------------- token ------------------------------------------------------>
const authRegexp = /\x00([0-9a-f]{8}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{12})\x00([0-9a-f]{8}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{12}|eg1[~](?:[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*))/;

/**
 * @typedef {import('./../../structs/types').XmppClient} XmppClient
 * @typedef {import('./../../structs/types').Credentials} Credentials
 * @typedef {import('./../../structs/types').Jwt} Jwt

*/

export function onConnection(ws: websocket, req: verifyClientInfos['req']) {
    var client: Client | undefined = undefined;

    const writerOptions: XMLWriterOptions = {
        headless: true
    };

    const config: PreConfig = {
        websocket: ws,
        state: states.none
    }

    console.log(`[${'XMPP'.yellow}]`, `New Connection`);

    ws.onerror = function () {
        if (config.state > states.none) {
            ws.send(rawXML['internal-server-error']);
        }

        ws.close(1011);
    }

    var idleTimeout = setTimeout(() => {
        if (config.client) {
            config.client.destroy()
        } else {
            ws.close();
        }
    }, 120000);

    ws.onmessage = async function ({ data }) {
        const msg = data.toString()
        const xml = parser(msg).root;

        if (!xml) {
            if (config.state > states.none) {
                const build = builder({
                    'stream:error': {
                        '@xmlns:stream': 'http://etherx.jabber.org/streams',
                        'not-well-formed': { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-streams' }
                    }
                }).end(writerOptions);

                ws.send(build + rawXML.close);
                ws.close();
            }

            return;
        }
    }
};

function exitHandler() {
    xmppClients.forEach(client => {
        client.websocket.send(rawXML['system-shutdown'] + '\n' + rawXML.close);
        client.websocket.close(1012);
    })

    process.exit();
}

process.on('SIGINT', exitHandler.bind(this));
process.on('SIGUSR1', exitHandler.bind(this));
process.on('SIGUSR2', exitHandler.bind(this));

type verifyClientInfos = Parameters<websocket.VerifyClientCallbackAsync>['0'];
type verifyClientCB = Parameters<websocket.VerifyClientCallbackAsync>['1'];

export function verifyClient(info: verifyClientInfos, callback: verifyClientCB) {
    if (info.req.headers['sec-websocket-protocol'] != 'xmpp') {
        return callback(false, 400);
    }

    callback(true)
}

export interface xmlnsHandler {
    xmlns: string,
    handle: (document: parser.Document, config: PreConfig) => void
}

export enum states {
    none,
    opened,
    authed,
    binded,
    started = 3
}

interface config extends Config {
    client: Client;
}

interface PreConfigNone extends Partial<config> {
    websocket: websocket,
    state: states.none,
}

interface PreConfigOpened extends Omit<PreConfigNone, 'state'> {
    id: string,
    state: states.opened,
}

interface PreConfigAuthed extends Omit<PreConfigOpened, 'state'> {
    authorization: fulltokenInfo,
    state: states.authed,
    adress: string,
}

interface preConfigStarted extends config {
    client: Client,
    state: states.started
}


export type PreConfig = PreConfigNone | PreConfigOpened | PreConfigAuthed | preConfigStarted;
