const { throws } = require('assert');
const { randomUUID } = require('crypto');
const { create: builder } = require('xmlbuilder2');
const XmppMessage = require('./xmpp_message');

function WithoutProperties(obj, ...keys) {
    var target = {};
    for (var i in obj) {
        if (keys.indexOf(i) >= 0) continue;
        if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
        target[i] = obj[i];
    }
    return target;
}

/**
 * @typedef {import('./types').XmppClient} XmppClient
 * @typedef {import('./types').PartyConfig} PartyConfig
 */
class Party {
    /** @param {XmppClient} creator */
    constructor(creator, config, join_info, meta) {
        /** @type {string} */
        this.id = randomUUID();

        this.members = [
            {
                account_id: creator.jwt.in_app_id,
                meta: join_info.connection.meta || {},
                connections: [
                    {
                        id: creator.Jid,
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
                xmppClient: creator
            }
        ];

        this.meta = meta;

        /**
         * @type {PartyConfig}
         */
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

    partyInfo() {
        return {
            id: this.id,
            created_at: this.created_at,
            updated_at: this.updated_at,
            config: this.config,
            members: this.members.map(x => WithoutProperties(x, 'xmppClient')),
            applicants: [],
            meta: this.meta,
            invites: this.invites,
            revision: this.revision
        }
    }

    /** @param {{ update: { [key: string]: string  } delete: string[]}} meta */
    Update(meta) {
        if ('update' in meta && Object.keys(meta.update).length > 0) {
            Object.assign(this.meta, meta.update);
        }

        if ('delete' in meta) {
            meta.delete.forEach(del => delete this.meta[del]);
        }

        this.updated_at = new Date();

        this.revision++;

        this.sendMessageToAll(
            {
                sent: new Date().toISOString(),
                type: "com.epicgames.social.party.notification.v0.PARTY_UPDATED",
                revision: this.revision,
                ns: "Fortnite",
                party_id: this.id,
                captain_id: this.members.find(x => x.role == "CAPTAIN").account_id,
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

    /** 
     * @param {string} memberId
     */
    UpdateMember(memberId, meta) {
        var member = this.members.find(x => x.account_id == memberId);

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

    /** @param {XmppClient} xmppClient */
    addMember(xmppClient, joinInfo, meta) {
        var member = {
            account_id: xmppClient.jwt.in_app_id,
            connections: [joinInfo.connection],
            joined_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            meta: joinInfo.meta,
            revision: 0,
            role: "MEMBER",
            xmppClient: xmppClient
        };

        this.members.push(member);


        this.sendMessageToAll(
            {
                sent: new Date().toISOString(),
                type: "com.epicgames.social.party.notification.v0.MEMBER_JOINED",
                connection: member.connections[0],
                revision: member.revision,
                ns: "Fortnite",
                party_id: this.id,
                account_id: member.account_id,
                account_dn: xmppClient.jwt.in_app_id,
                member_state_updated: meta,
                joined_at: "2021-11-19T03:31:34.818Z",
                updated_at: "2021-11-19T03:31:34.698Z"
            }
        );

        this.members.forEach(partyMember => {
            new XmppMessage(
                {
                    type: 'com.epicgames.social.interactions.notification.v2',
                    interactions: [
                        {
                            _type: 'InteractionUpdateNotification',
                            fromAccountId: member.account_id,
                            toAccountId: partyMember.account_id,
                            app: 'Chapter_2__Season_8',
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

    sendMessageToAll(message) {
        const x_message = new XmppMessage(message);

        this.members.forEach(member => {
            x_message.send(member.xmppClient);
        })
    }
}

module.exports = Party