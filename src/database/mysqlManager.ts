import * as mysql from 'mysql';
import * as crypto from 'crypto';

import { tokenInfo, profile as profileTypes } from '../structs/types';
import * as path from 'path';
import { readFileSync } from 'fs';

export interface Gift {
    from: User['accountId'],
    to: User['accountId'],
    sent: string

}

export interface Profile {
    _id: string;
    created: Date;
    updated: Date;
    rvn: number;
    wipeNumber: number;
    accountId: string;
    profileId: string;
    version: string;
    items: Items;
    stats: Stats;
    commandRevision: number;
}

export interface Items {
}

export interface Stats {
    attributes: {
        [key: string]: string;
    };
}


export interface Profiles {
    accountId: string;
    athena: Profile,
    commom_core: Profile,
    creative: Profile,
    common_public: Profile
}

interface ProfilesDB {
    accountId: string;
    athena: string,
    commom_core: string,
    creative: string,
    common_public: string
}

const database = mysql.createConnection({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '')
})

database.connect();

setInterval(() => database.ping(), 60000); // to avoid idle disconnection

export interface User {
    displayName: string;
    accountId: string;
    email: string;
    password: string;
}

export interface ExchangeCode {
    code: string;
    accountId: string;
    createdAt: number;
    expireAt: number;
}

export interface WebToken {
    token: string;
    accountId: string;
    expireAt: number;
}

export interface findType {
    email?: string;
    accountId?: string;
    displayName?: string;
    password?: string;
}

type supportedProfiles = "common_public" | "athena" | "campaign";

export interface profile {
    "created": string,
    "updated": string,
    "rvn": number,
    "wipeNumber": number,
    "accountId": string,
    "profileId": supportedProfiles,
    "version"?: string,
    "items": Record<string, any>,
    "stats": {
        "attributes": Record<string, any>
    }
}



database.query(`
CREATE TABLE IF NOT EXISTS Accounts (
    displayName varchar(50) not null,
    accountId varchar(32) not null,
    email varchar(255) not null,
    password varchar(255) not null,
    discord_account_id varchar(18),
    google_account_id varchar(20)
);
`)

const queriesDir = path.join(__dirname, '../../resources/sqlQueries/')

database.query(
    readFileSync(path.join(queriesDir, 'ensureExchangeExist.sql'), 'utf-8')
)
database.query('CREATE TABLE IF NOT EXISTS WebTokens (token varchar(32) not null, accountId varchar(32), expireAt BIGINT);')

database.query(
    readFileSync(path.join(queriesDir, 'ensureRefreshExists.sql'), 'utf-8')
)

database.query(
    readFileSync(path.join(queriesDir, 'ensureTokenExists.sql'), 'utf-8')
)

database.query(`CREATE TABLE IF NOT EXISTS purchases (
    purchaseToken VARCHAR(32) NOT NULL,
    accountId VARCHAR(32) NOT NULL,
    offers LONGTEXT NOT NULL,
	ip_hash VARCHAR(32) NOT NULL,
    receiptId VARCHAR(32)
    );
`)

database.query(
    readFileSync(path.join(queriesDir, 'ensureProfilesExist.sql'), 'utf-8')
)


function query<T>(sql: string, values?: any): Promise<T[]> {
    return new Promise((resolve, rejects) => {
        database.query(sql, values, (err, result) => {
            if (err) return rejects(err);
            resolve(result);
        });
    })
}

export namespace refresh_tokens {
    interface refresh extends tokenInfo {
        bearer_token: string
    }

    export async function add(params: refresh) {
        database.query(`DELETE FROM refresh_tokens WHERE expireAt < ?`, [Date.now()]);

        try {
            const entries = Object.entries(params);
            const columnsOrder = entries.flatMap(([key, value]) => key);
            const values = entries.flatMap(([key, value]) => value);

            await query(`INSERT INTO refresh_tokens (${columnsOrder}) VALUES (?)`, [values])
        } catch (e) { console.log(e); return false; }

        return true;
    }

    export async function check(token: string): Promise<boolean> {
        database.query(`DELETE FROM refresh_tokens WHERE expireAt < ?`, [Date.now()]);

        const result = await query<number>(`SELECT EXISTS(SELECT * from refresh_tokens WHERE expireAt > ? AND token = ?)`, [Date.now(), token]);
        return Object.values(result[0])[0] == 1;
    }

    export async function get(token: string): Promise<refresh | undefined> {
        database.query(`DELETE FROM refresh_tokens WHERE expireAt < ?`, [Date.now()]);


        const tokens = await query<refresh>(`SELECT * FROM refresh_tokens WHERE expireAt > ? AND token = ?`, [Date.now(), token]);
        return tokens[0];
    }

    export async function remove(token: string) {
        try {
            await query(`DELETE FROM refresh_tokens WHERE expireAt < ? OR token = ?`, [Date.now(), token])
        } catch (e) { console.log(e); return false; }

        return true;
    }
}

export namespace tokens {
    interface token extends tokenInfo {
        refresh_token?: string;
    }

    export async function add(params: token) {
        database.query(`DELETE FROM tokens WHERE expireAt < ?`, [Date.now()]);

        try {
            const entries = Object.entries(params);
            const columnsOrder = entries.flatMap(([key, value]) => key);
            const values = entries.flatMap(([key, value]) => value);

            await query(`INSERT INTO tokens (${columnsOrder}) VALUES (?)`, [values])
        } catch (e) { console.log(e); return false; }

        return true;
    }

    export async function check(token: string): Promise<boolean> {
        database.query(`DELETE FROM tokens WHERE expireAt < ?`, [Date.now()]);

        const result = await query<number>(`SELECT EXISTS(SELECT * from tokens WHERE expireAt > ? AND token = ?)`, [Date.now(), token]);
        return Object.values(result[0])[0] == 1;
    }

    export async function get(token: string): Promise<token | undefined> {
        database.query(`DELETE FROM tokens WHERE expireAt < ?`, [Date.now()]);


        const tokens = await query<token>(`SELECT * FROM tokens WHERE expireAt > ? AND token = ?`, [Date.now(), token]);
        return tokens[0];
    }

    export async function remove(token: string) {
        try {
            await query(`DELETE FROM tokens WHERE expireAt < ? OR token = ?`, [Date.now(), token])
        } catch (e) { console.log(e); return false; }

        return true;
    }
}


export namespace profiles {
    type basicQuery = Omit<profileTypes.Profile, 'items' | '_id'>;

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

        const value = typeof (attributeValue) == 'object' ? `JSON_QUERY(${mysql.escape(JSON.stringify(attributeValue, undefined, 0))}, '$')` : mysql.escape(attributeValue);

        await query(
            `UPDATE Profiles 
                SET \`${profileId}\` = JSON_SET(\`${profileId}\`, '$.items.${itemId}.attributes.${attributeName}', ${value})
            WHERE accountId = ?`,
            [accountId]
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

    export async function getItem(itemId: string, profileId: string, accountId: string): Promise<profileTypes.ItemValue | undefined> {
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

    export async function getStats(profileId: string, accountId: string): Promise<profileTypes.Stats | undefined> {
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


    export async function get(profileId: keyof Omit<Profiles, 'accountId'>, accountId: string): Promise<profileTypes.Profile | undefined> {
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

export namespace webTokens {
    export async function killAll(accountId: string, excludeToken: string) {
        database.query(`DELETE FROM WebTokens WHERE expireAt < ? OR accountId = ? AND token <> ?`, [Date.now(), accountId, excludeToken]);
    }

    export async function get(token: string) {
        database.query(`DELETE FROM WebTokens WHERE expireAt < ?`, [Date.now()]);
        const tokens = await query<WebToken>(`SELECT * FROM WebTokens WHERE expireAt > ? AND token = ?`, [Date.now(), token]);
        return tokens.at(0);
    }

    export async function add(token: string, accountId: string, expires: Date) {
        database.query(`DELETE FROM WebTokens WHERE expireAt < ?`, [Date.now()]);
        const result = await query(`INSERT INTO WebTokens (token, accountId, expireAt) VALUES (?)`, [[token, accountId, expires.getTime()]])
        return !(result instanceof Error);
    }
}

export namespace exchanges {
    // code varchar(32) not null, accountId varchar(32) not null, createdAt BIGINT not null, expireAt BIGINT not null
    export async function add(code: string, accountId: string, created: Date, expire: Date) {
        database.query(`DELETE FROM ExchangeCodes WHERE expireAt < ?`, [Date.now()]);

        await query<ExchangeCode>(
            `INSERT INTO ExchangeCodes (code, accountId, createdAt, expireAt) VALUES (?)`,
            [
                [
                    code,
                    accountId,
                    created.getTime(),
                    expire.getTime()
                ]
            ]
        );

        return;
    }

    export async function remove(code: string) {
        try {
            await database.query(`DELETE FROM ExchangeCodes WHERE expireAt < ? OR code = ?`, [Date.now(), code]);
        } catch {
            return false;
        }

        return true;
    }

    export async function get(code: string) {
        database.query(`DELETE FROM ExchangeCodes WHERE expireAt < ?`, [Date.now()]);
        const codes = await query<ExchangeCode>(`SELECT * FROM ExchangeCodes WHERE expireAt > ? AND code = ?`, [Date.now(), code]);
        return codes.at(0);
    }
}




export namespace users {
    export async function add(user: User) {
        const entries = Object.entries(user);
        const columnsOrder = entries.flatMap(x => x.at(0)).join(', ');
        const values = entries.flatMap(x => x.at(1));
        const result = await query(`INSERT INTO Accounts (${columnsOrder}) VALUES (?)`, [values])
    }

    export async function get(user: findType): Promise<User | undefined> {
        var type = user.accountId ? 'accountId' : user.displayName ? 'displayName' : user.email ? 'email' : undefined;

        var findValue = user.accountId || user.displayName || user.email;

        if (!findValue || !type) {
            throw new Error('Invalid value(s)');
        }

        var conditions = []

        if (user.accountId) {
            conditions.push(`accountId=${mysql.escape(user.accountId)}`)
        }

        if (user.email) {
            conditions.push(`email=${mysql.escape(user.email)}`)
        }

        if (user.displayName) {
            conditions.push(`displayName=${mysql.escape(user.displayName)}`)
        }

        if (user.password) {
            conditions.push(`password=${mysql.escape(user.password)}`)
        }

        if (conditions.length <= 0) {
            throw new Error('no conditions');
        }


        const users = await query(`SELECT * FROM Accounts WHERE ${conditions.join(' AND ')}`);

        const FoundUser: any = users[0];

        if (FoundUser) {
            var valid =
                typeof FoundUser.accountId == 'string' &&
                typeof FoundUser.displayName == 'string' &&
                typeof FoundUser.email == 'string' &&
                typeof FoundUser.password == 'string'

            if (!valid) {
                return undefined;
            } else {
                return FoundUser;
            }
        } else {
            return undefined;
        }
    }

    export function gets(userIds: string[]): Promise<User[]> {
        const validUsers = userIds.filter(x => x.length == 32 && x.match(/^[0-9a-f]{8}[0-9a-f]{4}[0-5][0-9a-f]{3}[089ab][0-9a-f]{3}[0-9a-f]{12}$/) != null);
        return query<User>(`SELECT * FROM Accounts WHERE accountId IN (?)`, [validUsers]);
    }
}
/*
purchaseToken VARCHAR(32) NOT NULL,
    accountId VARCHAR(32) NOT NULL,
    offers LONGTEXT NOT NULL);
 */

export namespace pendingPurchases {
    interface purchase {
        purchaseToken: string,
        offers: string[],
        accountId: string,
        ip_hash: string,
        receiptId: string
    }

    const allowed = ['purchaseToken', 'offers', 'accountId', 'ip_hash', 'receiptId']

    type dbpruchase = Omit<purchase, 'offers'> & { offers: string };

    export async function getAll(value: Partial<Omit<purchase, 'offers'>>): Promise<purchase[]> {
        const entries = Object.entries(value);

        // @ts-ignore
        if (value.offers) {
            return [];
        }

        if (entries.length <= 0) {
            return [];
        }

        if (entries.map(x => x[0]).find(x => !allowed.includes(x))) {
            return [];
        }

        if ('accountId' in value && typeof value.accountId != 'string' ||
            'ip_hash' in value && typeof value.ip_hash != 'string' ||
            'purchaseToken' in value && typeof value.purchaseToken != 'string' ||
            'receiptId' in value && typeof value.receiptId != 'string'
        ) {
            return [];
        }


        const contions = entries.map(([key, value]) => `\`${key}\` = ${mysql.escape(value)}`).join(' AND ');

        const purchases = await query<dbpruchase>(`SELECT * FROM purchases WHERE ${contions}`);


        return purchases.map((x) => {
            return {
                ...x,
                offers: JSON.parse(x.offers)
            }
        });
    }
    export async function get(value: Partial<Omit<purchase, 'offers'>>): Promise<purchase | undefined> {
        // @ts-ignore
        if (value.offers) {
            return undefined;
        }

        const purchases = await getAll(value);
        return purchases[0];
    }

    export async function add(param: purchase) {
        try {
            var purchase: dbpruchase = {
                ...param,
                offers: JSON.stringify(param.offers)
            }

            const entries = Object.entries(purchase);

            if (entries.length != 4) {
                return false;
            }

            if (!purchase.accountId || !purchase.ip_hash || !purchase.offers || !purchase.purchaseToken) {
                return false;
            }

            if (typeof purchase.accountId != 'string' ||
                typeof purchase.ip_hash != 'string' ||
                typeof purchase.offers != 'object' ||
                typeof purchase.purchaseToken != 'string') {
                return false;
            }

            const columnsOrder = entries.flatMap(x => x.at(0)).join(', ');
            const values = entries.flatMap(x => x.at(1));
            const result = await query(`INSERT INTO purchases (${columnsOrder}) VALUES (?)`, [values])
        } catch (e) { console.error(e); return false; }
    }

    export function setReceiptId(purchaseToken: string, receiptId: string) {
        return query(`UPDATE Profiles SET receiptId = \`${receiptId}\` WHERE purchaseToken = ?`, [purchaseToken])
    }

    export async function remove(param: purchase) {
        try {
            const entries = Object.entries(param);

            if (entries.length <= 0) {
                return false;
            }

            if (entries.map(x => x[0]).find(x => !allowed.includes(x))) {
                return false;
            }

            if ('accountId' in param && typeof param.accountId != 'string' ||
                'ip_hash' in param && typeof param.ip_hash != 'string' ||
                'offers' in param && typeof param.offers != 'object' ||
                'purchaseToken' in param && typeof param.purchaseToken != 'string' ||
                'receiptId' in param && typeof param.receiptId != 'string'
            ) {
                return false;
            }


            const contions = entries.map(([key, value]) => `\`${key}\` = ${mysql.escape(value)}`).join(' AND ');

            if (contions.length <= 0) {
                return false;
            }

            await query(`DELETE FROM tokens WHERE ${contions}`);
        } catch (e) { console.error(e); return false; }
    }
}