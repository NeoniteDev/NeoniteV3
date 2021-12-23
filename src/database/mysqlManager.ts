import * as mysql from 'mysql';
import { tokenInfo, profile as profileTypes } from '../structs/types';

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
    athena: Profile[],
    commom_core: Profile[],
    creative: Profile[],
    common_public: Profile[]
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



database.query('CREATE TABLE IF NOT EXISTS Accounts (displayName varchar(50) not null, accountId varchar(32) not null, email varchar(255) not null, password varchar(255) not null);')
database.query('CREATE TABLE IF NOT EXISTS ExchangeCodes (code varchar(32) not null, accountId varchar(32) not null, createdAt BIGINT not null, expireAt BIGINT not null);')
database.query('CREATE TABLE IF NOT EXISTS WebTokens (token varchar(32) not null, accountId varchar(32), expireAt BIGINT);')
database.query('CREATE TABLE IF NOT EXISTS Profiles (accountId varchar(32) not null, athena LONGTEXT, common_core LONGTEXT, campaign LONGTEXT);')
database.query(`CREATE TABLE IF NOT EXISTS tokens
(
    token varchar(32) not null, 
    clientId varchar(32) not null,
    auth_method varchar(50) not null,
    internal INT not null,
    expireAt BIGINT not null,
    client_service varchar(50) not null,
    refresh_token varchar(50),
    deviceId varchar(32),
    account_id varchar(32),
    displayName varchar(50),
    in_app_id varchar(32)
);
`)

database.query(`CREATE TABLE IF NOT EXISTS refresh_tokens
(
    token varchar(32) not null, 
    clientId varchar(32) not null,
    auth_method varchar(50) not null,
    internal INT not null,
    expireAt BIGINT not null,
    client_service varchar(50) not null,
    bearer_token varchar(32) not null,
    deviceId varchar(32),
    account_id varchar(32),
    displayName varchar(50),
    in_app_id varchar(32)
);
`)


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
    export async function get(profileId: string, accountId: string): Promise<profileTypes.Profile | undefined | undefined> {
        const s_profile = (await query<string>('SELECT ? FROM Profiles WHERE accountId = ?', [profileId, accountId]))[0];

        if (!s_profile) {
            return undefined;
        }

        const profile = JSON.parse(s_profile);

        return profile;
    }

    export async function add(profileId: string, accountId: string, Profile: any): Promise<boolean> {
        try {
            await query(`INSERT INTO Profiles (accountId, ${profileId}) VALUES (?)`, [accountId, JSON.stringify(Profile, null, 0)])
        } catch { return false }

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
    export async function add(code, accountId, created: Date, expire: Date) {
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

    export async function getAll(user: Omit<findType, 'password'>) {
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
    
        if (conditions.length <= 0) {
            throw new Error('no conditions');
        }
    
        const users = await query(`SELECT * FROM Accounts WHERE ${conditions.join(' OR ')}`);
        return users;
    }
}