/*
import * as types from '../../structs/types';

const localParties: types.PartyData[] = [];

namespace parties {
    interface DBvalues {
        id: string,
        partyJson: string
    }


    export async function getByMember(memberId: string) {
        return localParties.find(x => 
            x.members.find(mem => mem.account_id == memberId)
        );
    }

    export async function getById(partyId: string): Promise<types.PartyData | undefined> {
        return localParties.find(x => 
            x.id == partyId
        );
    }

    export async function create(party: types.PartyData) {
        return localParties.push(party);
    }

    export async function updateMeta(id: string, metaString: string) {
        localParties.push(party);
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

export default parties;*/