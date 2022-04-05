import axios from "axios";
import * as xmlBuilder from "xmlbuilder2";
import * as dotenv from 'dotenv'
import { XmppApi } from './types/responses';


if (!process.env.xmppToken) {
    throw new Error('Missing xmppAdminUser or/and xmppAdminPassword in the env');
}

const XmppApiToken = process.env.xmppToken;

const client = axios.create(
    {
        headers: {
            'Accept': 'application/json',
            'Authorization': XmppApiToken
        }
    }
)

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
            '@to': '{{$userName}}', // the plugin will handle
            body: {
                '#': message instanceof Object ? JSON.stringify(message) : message
            }
        }
    })

    var queryString = new URLSearchParams(
        to.map(x => [
            'userNames',
            x
        ])
    ).toString()

    return client.post(
        `https://xmpp.neonitedev.live:9091/plugins/restapi/v1/packets/users/?${queryString}`,
        fragment.end({ headless: true }),
        {
            headers: {
                'Content-Type': 'application/xml'
            }
        }
    ).then(() => { })
}

export async function getChatRooms(): Promise<XmppApi.ChatRoom[]> {
    const response = await client.get<XmppApi.ChatRoomRoot>(`https://xmpp.neonitedev.live:9091/plugins/restapi/v1/chatrooms?servicename=muc`);

    return response.data.chatRoom;
}

export async function getRoomParticipants(roomName: string): Promise<XmppApi.Participant[]> {
    const response = await client.get<XmppApi.ParticipantRoot>(
        `https://xmpp.neonitedev.live:9091/plugins/restapi/v1/chatrooms/${roomName}/participants?servicename=muc`
    );

    return response.data.participant;
}

export async function createChatRoom(roomName: string, naturalName: string, description: string, maxUsers: number, publicRoom: boolean): Promise<XmppApi.ChatRoom> {
    var roomData: XmppApi.ChatRoom = {
        roomName: roomName,
        naturalName: naturalName,
        description: description,
        maxUsers: maxUsers,
        creationDate: new Date().getTime(),
        modificationDate: new Date().getTime(),
        publicRoom: publicRoom,
        registrationEnabled: false,
        canAnyoneDiscoverJID: true,
        canOccupantsChangeSubject: true,
        canOccupantsInvite: true,
        canChangeNickname: true,
        broadcastPresenceRole: [
            'moderator',
            'participant',
            'visitor'
        ],
        admin: [],
        adminGroup: [],
        logEnabled: false,
        loginRestrictedToNickname: false,
        member: [],
        memberGroup: [],
        membersOnly: false,
        moderated: false,
        outcast: [],
        outcastGroup: [],
        owner: [],
        ownerGroup: [],
        persistent: false,
        subject: description
    };

    const response = await client.post(
        `https://xmpp.neonitedev.live:9091/plugins/restapi/v1/chatrooms?servicename=muc`,
        roomData
    );

    return roomData;
}

export async function getUserSessions(accountId: string): Promise<XmppApi.Session[]> {
    if (accountId.length != 32) {
        throw new Error('Invalid AccountId');
    }

    const response = await client.get<XmppApi.SessionResponse>(`https://xmpp.neonitedev.live:9091/plugins/restapi/v1/sessions/${accountId}`);
    return response.data.sessions || response.data.session;
}

