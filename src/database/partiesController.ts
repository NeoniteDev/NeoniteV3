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
                id, partyJson
            ) VALUES (?)`,
            [
                [
                    party.id,
                    JSON.stringify(party),
                ]
            ]
        );
    }

    export async function update(party: types.PartyData) {
        await query(
            `UPDATE parties
                SET partyJson = ?
            WHERE id = ?`,
            [
                JSON.stringify(party),
                party.id
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