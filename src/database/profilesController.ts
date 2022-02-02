import { query } from "./mysqlManager";
import * as types from '../structs/types';
import { escape } from 'mysql';

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
        const result = await query<number>(`SELECT EXISTS(SELECT * from Profiles WHERE accountId = ? AND ${profileId} IS NOT NULL)`, [accountId]);

        return Object.values(result[0])[0] == 1;
    }

    export async function getInfos(profileId: string, accountId: string): Promise<basicQuery | undefined> {
        const data = (
            await query<basicQueryDB>(
                `SELECT 
                JSON_VALUE(${profileId}, '$.created') as created,
                    JSON_VALUE(${profileId}, '$.updated') as updated,
                    JSON_VALUE(${profileId}, '$.rvn') as rvn,
                    JSON_VALUE(${profileId}, '$.wipeNumber') as wipeNumber,
                    JSON_VALUE(${profileId}, '$.accountId') as accountId,
                    JSON_VALUE(${profileId}, '$.profileId') as profileId,
                    JSON_VALUE(${profileId}, '$.version') as version,
                    JSON_VALUE(${profileId}, '$.commandRevision') as commandRevision,
                    JSON_QUERY(${profileId}, '$.stats') as stats
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
                SET \`${profileId}\` = JSON_SET(\`${profileId}\`, ?, ${value})
            WHERE accountId = ?`,
            [
                `$.items.${itemId}.attributes.${attributeName}`,
                accountId
            ]
        )
    }

    export async function setRevision(revision: number, profileId: string, accountId: string) {
        await query(
            `UPDATE Profiles 
                SET \`${profileId}\` = JSON_SET(\`${profileId}\`, '$.rvn', ?)
            WHERE accountId = ?`,
            [revision, accountId]
        )
    }

    export async function removeItem(itemId: string, profileId: string, accountId: string) {
        const isValid = itemId.match(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/) != null;
        if (!isValid) {
            return undefined;
        }

        await query(
            `UPDATE Profiles 
                SET \`${profileId}\` = JSON_REMOVE(\`${profileId}\`, '$.items.${itemId}')
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
                    JSON_QUERY(${profileId}, '$.items.${itemId}') as item 
                FROM Profiles WHERE accountId = ?`,
                [accountId]
            )
        )[0].item;

        if (!item) {
            return undefined;
        }

        return JSON.parse(item);
    }


    export async function addItem(itemId: string, itemValue: any, profileId: string, accountId: string) {
        const isValid = itemId.match(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/) != null;
        if (!isValid) {
            return;
        }


        await query(
            `UPDATE Profiles  
                SET \`${profileId}\` = JSON_SET(\`${profileId}\`, '$.items.${itemId}', JSON_QUERY(?, '$')) 
            FROM Profiles WHERE accountId = ?`, [JSON.stringify(itemValue), accountId]
        )
    }

    export async function getStats(profileId: string, accountId: string): Promise<types.profile.Stats | undefined> {
        const stats = (
            await query<{ stats: string }>(
                `SELECT 
                    JSON_QUERY(${profileId}, '$.stats') as stats 
                FROM Profiles WHERE accountId = ?`,
                [accountId]
            )
        )[0].stats;

        if (!stats) {
            return undefined;
        }

        return JSON.parse(stats);
    }


    export async function get(profileId: keyof Omit<Profiles, 'accountId'>, accountId: string): Promise<types.profile.Profile | undefined> {
        const profiles = (await query<ProfilesDB>(`SELECT ${profileId} FROM Profiles WHERE accountId = ?`, [accountId]))[0];

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
            await query(`UPDATE Profiles SET ${profileId} = ? WHERE accountId = ?`, [string, accountId])
        } catch (e) { console.error(e); return false }

        return true;
    }
}