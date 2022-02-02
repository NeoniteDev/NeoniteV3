import axios from "axios";
import * as xmlBuilder from "xmlbuilder2";
import * as dotenv from 'dotenv'

/// <reference path="types/responses.d.ts"/>

declare module XmppRestApi {
    export interface SessionResponse {
        sessions: Session[];
        session: Session[];
    }

    export interface Session {
        sessionId: string;
        username: string;
        resource: string;
        node: string;
        sessionStatus: string;
        presenceStatus: string;
        presenceMessage: string;
        priority: number;
        hostAddress: string;
        hostName: string;
        creationDate: number;
        lastActionDate: number;
        secure: boolean;
    }
}

if (!process.env.xmppAdminUser || !process.env.xmppAdminPassword) {
    throw new Error('Missing xmppAdminUser or/and xmppAdminPassword in the env');
}

const AdminUser = process.env.xmppAdminUser;
const AdminPass = process.env.xmppAdminPassword;

const client = axios.create({
    auth: {
        username: AdminUser,
        password: AdminPass
    },
    headers: {
        'Accept': 'application/json'
    }
})

export async function sendMesage(to: string, message: object | string) {
    const fragment = xmlBuilder.fragment({
        message: {
            '@from': 'xmpp-admin@xmpp.neonitedev.live',
            '@to': to,
            body: {
                '#': message instanceof Object ? JSON.stringify(message) : message
            }
        }
    })

    return client.post(
        `https://xmpp.neonitedev.live:9091/plugins/restapi/v1/packets/user/${to}`,
        fragment.end({ headless: true }),
        {
            headers: {
                'Content-Type': 'application/xml'
            }
        }
    ).then(() => { })
}

export function sendMesageMulti(to: string[], message: object | string) {
    const fragment = xmlBuilder.fragment({
        message: {
            '@from': 'xmpp-admin@xmpp.neonitedev.live',
            body: {
                '#': message instanceof Object ? JSON.stringify(message) : message
            }
        }
    })

    return Promise.all(
        to.map(user => {
            // fragment.root().att('to', user);
            var xml = fragment.end({ headless: true });
            return client.post(
                `https://xmpp.neonitedev.live:9091/plugins/restapi/v1/packets/user/${user}`,
                fragment.end({ headless: true }),
                {
                    headers: {
                        'Content-Type': 'application/xml',
                    }
                }
            ).then(() => { })
        })
    );
}



export async function getUserSessions(accountId: string): Promise<XmppRestApi.Session[]> {
    if (accountId.length != 32) {
        throw new Error('Invalid AccountId');
    }

    const response = await client.get<XmppRestApi.SessionResponse>(`https://xmpp.neonitedev.live:9091/plugins/restapi/v1/sessions/${accountId}`);
    return response.data.sessions || response.data.session;
}

