const { throws } = require('assert');

import * as xmppApi from '../xmppManager';
import errors from './errors';
import { PartyConfig, PartyData, partyInvite, partyMember } from './types';
import { party } from '../types/bodies';
import { randomUUID } from 'crypto';
// import parties from '../database/partiesController';
import users from '../database/local/usersController';
import Friends from '../database/local/friendsController';

interface partyUpdate {
    meta: {
        update: Record<string, string>,
        delete: string[]
    },
    config: Record<string, string>

}

export const localParties: Party[] = []

export async function getParty(id: string) {
    /*const partyData = await parties.getById(id);

    if (!partyData) {
        return undefined;
    }

    return new Party(partyData);*/

    return localParties.find(x => x.id == id);
}

class Party implements PartyData {
    constructor(private info?: PartyData) {
        if (info) {
            this.id = info.id;
            this.config = info.config;
            this.updated_at = info.updated_at;
            this.created_at = info.created_at;
            this.revision = info.revision;
            this.invites = info.invites;
            this.meta = info.meta;
            this.members = info.members;
        } else {
            this.id = randomUUID().replaceAll('-', '')
            this.config = {
                "type": "DEFAULT",
                "joinability": "OPEN",
                "discoverability": "ALL",
                "sub_type": "default",
                "max_size": 16,
                "invite_ttl": 14400,
                "join_confirmation": true,
                "intention_ttl": 60
            };
            this.updated_at = new Date().toISOString();
            this.created_at = new Date().toISOString();
            this.revision = 0;
            this.invites = [];
            this.meta = {};
            this.members = [];

            //parties.create(this.getData());
        }
    }

    id: string;
    created_at: string;
    config: PartyConfig;
    updated_at: string;
    revision: number;
    invites: partyInvite[];
    meta: Record<string, string>;
    members: partyMember[]

    getData(): PartyData {
        return {
            id: this.id,
            created_at: this.created_at,
            updated_at: this.updated_at,
            config: this.config,
            members: this.members,
            meta: this.meta,
            invites: this.invites,
            revision: this.revision
        }
    }

    async update(updated: partyUpdate) {
        Object.assign(this.config, updated.config);
        Object.assign(this.meta, updated.meta.update);

        this.meta = Object.fromEntries(
            Object.entries(
                this.meta
            ).filter(
                ([key, value]) => !updated.meta.delete.includes(key)
            )
        );

        this.updated_at = new Date().toISOString();
        this.revision++;

        var captain = this.members.find(x => x.role == "CAPTAIN");

        if (!captain) {
            throw errors.neoniteDev.party.memberNotFound.withMessage('cannot find party leader.');
        }


        //this.updateDB();
 
        this.broadcastMessage(
            {
                sent: new Date().toISOString(),
                type: "com.epicgames.social.party.notification.v0.PARTY_UPDATED",
                revision: this.revision,
                ns: "Fortnite",
                party_id: this.id,
                captain_id: captain.account_id,
                party_state_removed: updated.meta.delete,
                party_state_updated: updated.meta.update,
                party_state_overridden: {},
                party_privacy_type: this.config.joinability,
                party_type: this.config.type,
                party_sub_type: this.config.sub_type,
                max_number_of_members: this.config.max_size,
                invite_ttl_seconds: this.config.invite_ttl,
                created_at: this.created_at,
                updated_at: this.updated_at
            }
        )
    }


    async updateMember(memberId: string, memberDn: string, meta: partyUpdate['meta']) {
        var member = this.members.find(x => x.account_id == memberId);

        if (!member) {
            throw errors.neoniteDev.party.memberNotFound.with(memberId);
        }

        member.meta = Object.fromEntries(
            Object.entries(
                member.meta
            ).filter(
                ([key, value]) => !meta.delete.includes(key)
            )
        )

        Object.assign(member.meta, meta.update);

        member.revision++;
        member.updated_at = new Date().toISOString();

       // await this.updateDB();

        
        this.broadcastMessage(
            {
                "sent": new Date(),
                "type": "com.epicgames.social.party.notification.v0.MEMBER_STATE_UPDATED",
                "revision": member.revision,
                "ns": "Fortnite",
                "party_id": this.id,
                "account_id": member.account_id,
                "account_dn": memberDn,
                "member_state_removed": meta.delete || [],
                "member_state_updated": meta.update || {},
                "joined_at": member.joined_at,
                "updated_at": member.updated_at
            }
        )
    }

    kick() {

    }

    promote() { }

    async inviteUser(invitedId: string, inviterId: string, meta: Record<string, string>) {
        const inviter = this.members.find(x => x.account_id == inviterId);

        if (!inviter) {
            throw new Error('inviter not found');
        }

        const invitedFriends = await Friends.getFriends(invitedId);

        var invite = {
            party_id: this.id,
            sent_by: inviterId,
            meta: meta,
            sent_to: invitedId,
            sent_at: new Date(),
            updated_at: new Date(),
            expires_at: new Date().addHours(1),
            status: 'SENT'
        };

        this.invites.push(invite);
        //await this.updateDB();

        xmppApi.sendMesage(
            `${invitedId}@xmpp.neonitedev.live`,
            {
                "sent": new Date(),
                "type": "com.epicgames.social.party.notification.v0.INITIAL_INVITE",
                "meta": meta,
                "ns": "Fortnite",
                "party_id": this.id,
                "inviter_id": inviterId,
                "inviter_dn": inviter['connections'][0].meta['urn:epic:member:dn_s'],
                "invitee_id": invitedId,
                "sent_at": invite.sent_at,
                "updated_at": invite.updated_at,
                "friends_ids": this.members.filter(member =>
                    invitedFriends.find(friend => friend.accountId == member.account_id)
                ).map(x => x.account_id),
                "members_count": this.members.length
            }
        );
    }

    async cancelInvite(sent_to: string) {
        var invite = this.invites.find(x => x.sent_to == sent_to);
        var inviter = this.members.find(x => x.account_id == sent_to);

        if (!invite) {
            throw new Error('invation not found');
        }

        this.invites.remove(invite);
        //this.updateDB();

        xmppApi.sendMesage(
            `${sent_to}@xmpp.neonitedev.live`,
            {
                sent: new Date(),
                type: 'com.epicgames.social.party.notification.v0.INVITE_CANCELLED',
                meta: invite.meta,
                ns: 'Fortnite',
                party_id: this.id,
                inviter_id: invite.sent_by,
                inviter_dn: inviter ? inviter['connections'][0].meta['urn:epic:member:dn_s'] : '',
                invitee_id: invite.sent_to,
                sent_at: invite.sent_at,
                updated_at: new Date(),
                expires_at: invite.expires_at
            }
        );
    }

    async removeMember(memeberId: string) {
        var memeber = this.members.find(x => x.account_id == memeberId);

        if (!memeber) {
            throw errors.neoniteDev.party.memberNotFound.with(memeberId);
        }

        this.members.remove(memeber);

        //await this.updateDB();

        this.broadcastMessage(
            {
                account_id: memeberId,
                member_state_update: {},
                ns: "Fortnite",
                party_id: this.id,
                revision: this.revision,
                sent: new Date(),
                type: "com.epicgames.social.party.notification.v0.MEMBER_LEFT"
            }
        )
    }

    reconnect(connection: party.JoinParty.Connection, accountId: string, meta?: Record<string, string>) {
        const member = this.members.find(x => x.account_id == accountId);

        if (!member) {
            throw errors.neoniteDev.party.memberNotFound.with(accountId);
        }

        member.connections = [
            connection
        ];

        //parties.updateMember(this.id, member.account_id, member);
/*
        this.broadcastMessage(
            {
                sent: new Date(),
                type: "com.epicgames.social.party.notification.v0.MEMBER_JOINED",
                connection: member.connections[0],
                revision: member.revision,
                ns: "Fortnite",
                party_id: this.id,
                account_id: member.account_id,
                account_dn: accountId,
                member_state_updated: connection.meta,
                joined_at: member.joined_at,
                updated_at: member.updated_at
            }
        );*/
    }

    addMember(connection: party.JoinParty.Connection, accountId: string, meta?: Record<string, string>) {
        var member: partyMember = {
            account_id: accountId,
            connections: [connection],
            joined_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            meta: meta || {},
            revision: 0,
            role: this.members.length == 0 ? "CAPTAIN" : "MEMBER"
        }

        this.members.push(member);
        //parties.addMember(this.id, member);

        this.broadcastMessage(
            {
                sent: new Date(),
                type: "com.epicgames.social.party.notification.v0.MEMBER_JOINED",
                connection: member.connections[0],
                revision: member.revision,
                ns: "Fortnite",
                party_id: this.id,
                account_id: member.account_id,
                account_dn: accountId,
                member_state_updated: connection.meta,
                joined_at: member.joined_at,
                updated_at: member.updated_at
            }
        );
    }

    deleteParty() {
       // return parties.remove(this.id);
       localParties.remove(this);
    }

    broadcastMessage(message: object) {
        console.log(this.members.flatMap(x => x.connections).map(x => x.id))
        return xmppApi.sendMesageMulti(
            this.members.flatMap(x => x.connections).map(x => x.id),
            message
        )
    }

   /* private updateDB() {
        this.updated_at = new Date().toISOString();
        parties.update(this.getData());
    }*/
}

export default Party;