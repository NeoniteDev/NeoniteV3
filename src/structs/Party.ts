const { throws } = require('assert');

import * as xmppApi from '../xmppManager';
import errors from './errors';
import { PartyConfig, PartyData, partyMember } from './types';
import { party } from '../types/bodies';
import { randomUUID } from 'crypto';
import parties from '../database/partiesController';

interface metaUpdate {
    update: Record<string, string>,
    delete: string[]
}

export async function getParty(id: string) {
    const partyData = await parties.getById(id);

    if (!partyData) {
        return undefined;
    }

    return new Party(partyData);
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

            parties.create(this.getData());
        }
    }

    id: string;
    created_at: string;
    config: PartyConfig;
    updated_at: string;
    revision: number;
    invites: any[];
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

    update(meta: metaUpdate) {
        if ('update' in meta && Object.keys(meta.update).length > 0) {
            Object.assign(this.meta, meta.update);
        }

        if ('delete' in meta) {
            this.meta = Object.fromEntries(
                Object.entries(
                    this.meta
                ).filter(
                    ([key, value]) => !meta.delete.includes(key)
                )
            )
        }

        this.updated_at = new Date().toISOString();
        this.revision++;

        var captain = this.members.find(x => x.role == "CAPTAIN");

        if (!captain) {
            throw errors.neoniteDev.party.memberNotFound.withMessage('cannot find party leader.');
        }

        this.updateDB();

        xmppApi.sendMesageMulti(
            this.members.flatMap(x => x.connections).map(x => x.id),
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
                created_at: this.created_at,
                updated_at: this.updated_at
            }
        );
    }


    updateMember(memberId: string, meta: metaUpdate) {
        var member = this.members.find(x => x.account_id == memberId);

        if (!member) {
            throw errors.neoniteDev.party.memberNotFound.with(memberId);
        }

        Object.assign(member.meta, meta);

        member.meta = Object.fromEntries(
            Object.entries(member.meta).filter(([key, value]) => !meta.delete.includes(key))
        )

        member.updated_at = new Date().toISOString();
        this.updateDB();
        xmppApi.sendMesageMulti(
            this.members.flatMap(x => x.connections).map(x => x.id),
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
                "joined_at": member.joined_at,
                "updated_at": member.updated_at
            }
        )
    }

    kick() {

    }

    promote() { }

    removeMember() { }

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
        this.updateDB();

        xmppApi.sendMesageMulti(
            this.members.flatMap(x => x.connections).map(x => x.id),
            {
                sent: new Date(),
                type: "com.epicgames.social.party.notification.v0.MEMBER_JOINED",
                connection: member.connections[0],
                revision: member.revision,
                ns: "Fortnite",
                party_id: this.id,
                account_id: member.account_id,
                account_dn: accountId,
                member_state_updated: meta,
                joined_at: member.joined_at,
                updated_at: member.updated_at
            }
        )

        /*
        this.members.forEach(partyMember => {
            partyMember.connections.forEach(connection => {
                xmppApi.sendMesage(connection.id, {
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
                            interactionScoreIncremental: { "total": -1, "count": -1 },
                            isFriend: false
                        }
                    ]
                })
            });
        })*/
    }
    private async updateDB() {
        this.updated_at = new Date().toISOString();
        parties.update(this.getData());
    }
}

export default Party;