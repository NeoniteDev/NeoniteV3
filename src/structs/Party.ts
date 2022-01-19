const { throws } = require('assert');
const { randomUUID } = require('crypto');

import { sendMessageTo } from '../xmppManager';
sendMessageTo('', {});


import xmppMessage from './xmpp_message'
import errors from './errors';
import { PartyConfig, partyMember } from './types';

interface metaUpdate {
    update: Record<string, string>,
    delete: string[]
}

class Party {
    constructor(creator: any, config: any, join_info: any, meta: any) {
        this.id = randomUUID();

        this.members = [
            {
                account_id: creator.authorization.account_id,
                meta: join_info.connection.meta || {},
                connections: [
                    {
                        id: creator.jabberId,
                        connected_at: new Date(),
                        updated_at: new Date(),
                        yield_leadership: false,
                        meta: join_info.connection.meta
                    }
                ],
                revision: 0,
                updated_at: new Date(),
                joined_at: new Date(),
                role: "CAPTAIN",
                //xmppClient: creator
            }
        ];

        this.clients = [ creator ]

        this.meta = meta;
        this.config = Object.assign({
            type: 'DEFAULT',
            joinability: 'INVITE_AND_FORMER',
            discoverability: 'INVITED_ONLY',
            sub_type: 'default',
            max_size: 16,
            invite_ttl: 14400,
            join_confirmation: true
        }, config);

        this.created_at = new Date();

        this.updated_at = new Date();

        this.revision = 0;

        this.invites = [];
    }

    id: string;
    created_at: Date;
    config: PartyConfig;
    updated_at: Date;
    revision: number;
    invites: any[];
    meta: Record<string, string>;
    members: partyMember[]
    clients: any[];

    partyInfo() {
        return {
            id: this.id,
            created_at: this.created_at,
            updated_at: this.updated_at,
            config: this.config,
            members: this.members,
            applicants: [],
            meta: this.meta,
            invites: this.invites,
            revision: this.revision
        }
    }

    Update(meta: metaUpdate) {
        if ('update' in meta && Object.keys(meta.update).length > 0) {
            Object.assign(this.meta, meta.update);
        }

        if ('delete' in meta) {
            meta.delete.forEach(del => delete this.meta[del]);
        }

        this.updated_at = new Date();

        this.revision++;

        var captain = this.members.find(x => x.role == "CAPTAIN");

        if (!captain) {
            throw errors.neoniteDev.party.memberNotFound.withMessage('cannot find party leader.');
        }

        this.sendMessageToAll(
            {
                sent: new Date().toISOString(),
                type: "com.epicgames.social.party.notification.v0.PARTY_UPDATED",
                revision: this.revision,
                ns: "Fortnite",
                party_id: this.id,
                captain_id: captain.account_id,
                party_state_removed: meta.delete || [],
                party_state_updated: meta.update || {},
                party_state_overridden: {},
                party_privacy_type: this.config,
                party_type: this.config.type,
                party_sub_type: this.config.sub_type,
                max_number_of_members: this.config.max_size,
                invite_ttl_seconds: this.config.invite_ttl,
                created_at: this.created_at.toISOString(),
                updated_at: this.updated_at.toISOString()
            }
        )
    }


    UpdateMember(memberId: string, meta: metaUpdate) {
        var member = this.members.find(x => x.account_id == memberId);

        if (!member) {
            throw errors.neoniteDev.party.memberNotFound.with(memberId);
        }

        // @ts-ignore
        Object.entries(meta.update).forEach(([key, value]) => { member.meta[key] = value })

        this.sendMessageToAll(
            {
                "sent": new Date(),
                "type": "com.epicgames.social.party.notification.v0.MEMBER_STATE_UPDATED",
                "revision": member.revision,
                "ns": "Fortnite",
                "party_id": this.id,
                "account_id": member.account_id,
                "account_dn": Buffer.from(member.account_id, 'hex').toString(),
                "member_state_removed": meta.delete || [],
                "member_state_updated": meta.update || {},
                "joined_at": new Date(),
                "updated_at": new Date()
            }
        );
    }

    Kick() { }

    Promote() { }

    RemoveMember() { }

    addMember(client: any, joinInfo: any, meta: Record<string, string>) {
        var member: partyMember = {
            account_id: client.authorization.account_id,
            connections: [joinInfo.connection],
            joined_at: new Date(),
            updated_at: new Date(),
            meta: joinInfo.meta,
            revision: 0,
            role: "MEMBER"
        }

        this.members.push(member);
        this.clients.push(client);

        this.sendMessageToAll(
            {
                sent: new Date(),
                type: "com.epicgames.social.party.notification.v0.MEMBER_JOINED",
                connection: member.connections[0],
                revision: member.revision,
                ns: "Fortnite",
                party_id: this.id,
                account_id: member.account_id,
                account_dn: client.authorization.account_id,
                member_state_updated: meta,
                joined_at: new Date(),
                updated_at: new Date()
            }
        );

        this.members.forEach(partyMember => {
            new xmppMessage(
                {
                    type: 'com.epicgames.social.interactions.notification.v2',
                    interactions: [
                        {
                            _type: 'InteractionUpdateNotification',
                            fromAccountId: member.account_id,
                            toAccountId: partyMember.account_id,
                            app: 'Chapter_3__Season_1',
                            interactionType: 'PartyJoined',
                            namespace: 'Fortnite',
                            happenedAt: Date.now(),
                            interactionScoreIncremental: { "total": 1, "count": 1 },
                            isFriend: true
                        }
                    ]
                }
            )
        })
    }

    sendMessageToAll(message: object) {
        const x_message = new xmppMessage(message);

        this.clients.forEach(client => {
            x_message.send(client);
        })
    }
}

export default Party;