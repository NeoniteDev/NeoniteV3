import { query } from "./mysqlManager";
import * as types from '../structs/types';

namespace parties {
    interface DBvalues {
        id: string,
        partyJson: string
    }


    export async function getByMember(memberId: string): Promise<types.PartyData[]> {
        const data = (
            await query<DBvalues>(
                `SELECT * FROM parties WHERE JSON_SEARCH(partyJson, 'one', ?, NULL, '$.members[*].account_id') IS NOT NULL`,
                [memberId]
            )
        );

        return data.map(x => JSON.parse(x.partyJson))
    }

    export async function getById(partyId: string): Promise<types.PartyData | undefined> {
        const data = (
            await query<DBvalues>(
                `SELECT * FROM parties WHERE id = ?`,
                [partyId]
            )
        )[0];

        if (!data) {
            return undefined;
        }

        return JSON.parse(data.partyJson);
    }

    export async function create(party: types.PartyData) {
        await query(
            `INSERT INTO parties (
                id, members, config, meta, invites, created_at, updated_at, revision
            ) VALUES (?)`,
            [
                [
                    party.id,
                    JSON.stringify(party.members),
                    JSON.stringify(party.config),
                    JSON.stringify(party.meta),
                    JSON.stringify(party.invites),
                    JSON.stringify(party.created_at),
                    JSON.stringify(party.updated_at),
                    JSON.stringify(party.revision)
                ]
            ]
        );
    }

    export async function updateMeta(id: string, metaString: string) {
        await query(
            `UPDATE parties SET 
                meta = ?
            WHERE id = ?`,
            [
                JSON.stringify(metaString),
                id
            ]
        );
    }

    export async function updateMember(id: string, memberId: string, member: types.partyMember) {
        await query(
            `UPDATE parties SET 
                members = JSON_SET(members, JSON_SEARCH(JSON_EXTRACT(members, '$[*].account_id'), 'one', ?), ?)
            WHERE id = ?`,
            [
                memberId,
                JSON.stringify(member),
                id
            ]
        );
    }

    export async function addMember(id: string, member: types.partyMember) {
        await query(
            `UPDATE parties SET 
                members = JSON_ARRAY_APPEND(members, '$', JSON_QUERY(?, '$'))
            WHERE id = ?`,
            [
                JSON.stringify(member),
                id
            ]
        );
    }

    export async function removeMember(id: string, memberId: string) {
        await query(
            `UPDATE parties SET 
                members = JSON_REMOVE(numbers, replace(JSON_SEARCH(JSON_EXTRACT(members, '$[*].account_id'), 'one', ?), '"', ''))
            WHERE id = ?`,
            [
                memberId,
                id
            ]
        );
    }

    export async function remove(id: string) {
        await query(
            `DELETE FROM parties where id = ?`,
            [
                id
            ]
        );
    }
}

export default parties;