import { query } from "./mysqlManager";
import * as types from '../structs/types';
import { escape, escapeId } from 'mysql';
import { join } from "path";

export interface Profiles {
    accountId: string;
    athena: types.profile.Profile,
    commom_core: types.profile.Profile,
    creative: types.profile.Profile,
    common_public: types.profile.Profile
}

interface ProfilesDB {
    accountId: string;
    athena: string,
    commom_core: string,
    creative: string,
    common_public: string
}

export namespace profiles {
    type basicQuery = Omit<types.profile.Profile, 'items' | '_id'>;

    interface basicQueryDB extends Omit<basicQuery, 'stats'> {
        stats: string;
    }

    export async function has(profileId: string, accountId: string): Promise<boolean> {
        const result = await query<number>(`SELECT EXISTS(SELECT * from Profiles WHERE accountId = ? AND ${escapeId(profileId)} IS NOT NULL)`, [accountId]);

        return Object.values(result[0])[0] == 1;
    }

    export async function getInfos(profileId: string, accountId: string): Promise<basicQuery | undefined> {
        const data = (
            await query<basicQueryDB>(
                `SELECT 
                JSON_VALUE(${escapeId(profileId)}, '$.created') as created,
                    JSON_VALUE(${escapeId(profileId)}, '$.updated') as updated,
                    JSON_VALUE(${escapeId(profileId)}, '$.rvn') as rvn,
                    JSON_VALUE(${escapeId(profileId)}, '$.wipeNumber') as wipeNumber,
                    JSON_VALUE(${escapeId(profileId)}, '$.accountId') as accountId,
                    JSON_VALUE(${escapeId(profileId)}, '$.profileId') as profileId,
                    JSON_VALUE(${escapeId(profileId)}, '$.version') as version,
                    JSON_VALUE(${escapeId(profileId)}, '$.commandRevision') as commandRevision,
                    JSON_QUERY(${escapeId(profileId)}, '$.stats') as stats
                FROM Profiles WHERE accountId = ?`,
                [accountId]
            )
        )[0];

        if (!data) {
            return undefined;
        }

        return {
            ...data,
            stats: JSON.parse(data.stats)
        };
    }

    export async function setItemAttr
        (
            itemId: string,
            attributeName: string,
            attributeValue: string | number | Object | Array<any>,
            profileId: string,
            accountId: string
        ) {
        const isValid = itemId.match(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/) != null;

        if (!isValid) {
            return;
        }

        const value = typeof (attributeValue) == 'object' ? `JSON_QUERY(${escape(JSON.stringify(attributeValue, undefined, 0))}, '$')` : escape(attributeValue);

        await query(
            `UPDATE Profiles 
                SET ${escapeId(profileId)} = JSON_SET(${escapeId(profileId)}, ?, ${value})
            WHERE accountId = ?`,
            [
                `$.items.${itemId}.attributes.${attributeName}`,
                accountId
            ]
        )
    }

    export async function setMutliItemAttr
        (
            profileId: string,
            accountId: string,
            itemsAttrs: {
                itemId: string,
                attributeName: string,
                attributeValue: string | number | Object | Array<any>,
            }[]
        ) {

        if (itemsAttrs.length <= 0) {
            return;
        }

        const SetStatements = itemsAttrs.map(
            (attribute) =>
                `${escapeId(profileId)} = 
                CASE WHEN JSON_EXISTS(${escapeId(profileId)}, ${escape(`$.items.${attribute.itemId}.attributes`)}) = 0 
                THEN 
                    JSON_SET(${escapeId(profileId)}, ${escape(`$.items.${attribute.itemId}`)}, JSON_QUERY(${escape(JSON.stringify({ "attributes": { [attribute.attributeName]: attribute.attributeValue } }))}, '$')) 
                ELSE 
                    JSON_SET(${escapeId(profileId)}, ${escape(`$.items.${attribute.itemId}.attributes.${attribute.attributeName}`)}, ${getSQLStatementForValue(attribute.attributeValue)}) END`
        ).join(',')


        await query(
            `UPDATE Profiles 
                SET ${SetStatements}
            WHERE accountId = ?`,
            [accountId]
        )
    }

    export async function setRevision(revision: number, commandRevision: number, profileId: string, accountId: string) {
        await query(
            `UPDATE Profiles 
                SET ${escapeId(profileId)} = JSON_SET(${escapeId(profileId)}, '$.rvn', ?),
                    ${escapeId(profileId)} = JSON_SET(${escapeId(profileId)}, '$.commandRevision', ?)
            WHERE accountId = ?`,
            [revision, commandRevision, accountId]
        )
    }

    export async function removeItem(itemId: string, profileId: string, accountId: string) {
        const isValid = itemId.match(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/) != null;
        if (!isValid) {
            return undefined;
        }

        await query(
            `UPDATE Profiles 
                SET ${escapeId(profileId)} = JSON_REMOVE(${escapeId(profileId)}, ${escape(`$.items.${itemId}`)})
            WHERE accountId = ?`,
            [accountId]
        )
    }

    export async function getItem(itemId: string, profileId: string, accountId: string): Promise<types.profile.ItemValue | undefined> {
        const isValid = itemId.match(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/) != null;
        if (!isValid) {
            return undefined;
        }

        const item = (
            await query<{ item: string }>(
                `SELECT 
                    JSON_QUERY(${escapeId(profileId)}, ${escape(`$.items.${itemId}`)}) as item 
                FROM Profiles WHERE accountId = ?`,
                [accountId]
            )
        )[0].item;

        if (!item) {
            return undefined;
        }

        return JSON.parse(item);
    }

    export async function getItems(itemIds: string[], profileId: string, accountId: string): Promise<Record<string, types.profile.ItemValue>> {
        const items = (
            await query<Record<string, string>>(
                `SELECT 
                    ${itemIds.map((itemId => `JSON_QUERY(${escapeId(profileId)}, ${escape(`$.items.${itemId}`)}) as ${escapeId(itemId)}`)).join(',\n')}
                FROM Profiles WHERE accountId = ?`,
                [accountId]
            )
        )[0];

        return Object.fromEntries(Object.entries(items).map(([key, value]) => [key, JSON.parse(value)]))
    }

    export async function addItem(itemId: string, itemValue: any, profileId: string, accountId: string) {
        const isValid = itemId.match(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/) != null;
        if (!isValid) {
            return;
        }


        await query(
            `UPDATE Profiles  
                SET ${escapeId(profileId)} = JSON_SET(${escapeId(profileId)}, ${escape(`$.items.${itemId}`)}, JSON_QUERY(?, '$')) 
            WHERE accountId = ?`, [JSON.stringify(itemValue), accountId]
        )
    }

    export async function getStats(profileId: string, accountId: string): Promise<types.profile.Stats | undefined> {
        const stats = (
            await query<{ stats: string }>(
                `SELECT 
                    JSON_QUERY(${escapeId(profileId)}, '$.stats') as stats 
                FROM Profiles WHERE accountId = ?`,
                [accountId]
            )
        )[0].stats;

        if (!stats) {
            return undefined;
        }

        return JSON.parse(stats);
    }

    export async function setStat(profileId: string, accountId: string, name: string, value: any) {
        await query<{ stats: string }>(
            `UPDATE Profiles
                SET  ${escapeId(profileId)} =  JSON_SET(${escapeId(profileId)}, ${escape(`$.stats.attributes.${name}`)}, ${getSQLStatementForValue(value)})
            WHERE accountId = ?`,
            [accountId]
        )
    }


    export async function get(profileId: keyof Omit<Profiles, 'accountId'>, accountId: string): Promise<types.profile.Profile | undefined> {
        const profiles = (await query<ProfilesDB>(`SELECT ${escapeId(profileId)} FROM Profiles WHERE accountId = ?`, [accountId]))[0];

        const profile_s = profiles[profileId];

        if (!profiles || !profile_s) {
            return undefined;
        }

        const profile = JSON.parse(profiles[profileId]);

        return profile;
    }

    export async function set(profileId: string, accountId: string, Profile: any): Promise<boolean> {
        const string = JSON.stringify(Profile, undefined, 0);

        try {
            await query(`UPDATE Profiles SET ${escapeId(profileId)} = ? WHERE accountId = ?`, [string, accountId])
        } catch (e) { console.error(e); return false }

        return true;
    }
}

export default profiles;


function getSQLStatementForValue(value: any) {
    return typeof (value) == 'object' ? `JSON_QUERY(${escape(JSON.stringify(value, undefined, 0))}, '$')` : escape(value)
}