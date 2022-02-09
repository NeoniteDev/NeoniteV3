import { query } from "./mysqlManager";
import * as types from '../structs/types';
import * as nodeCache from 'node-cache';

const cache = new nodeCache(
    {
        maxKeys: 15000,
        checkperiod: 180
    }
);

const rAccountId = /^[0-9a-f]{8}[0-9a-f]{4}[0-5][0-9a-f]{3}[089ab][0-9a-f]{3}[0-9a-f]{12}$/;

export interface User {
    displayName: string;
    accountId: string;
    email: string;
    password: string;
    discord_account_id?: string,
    discord_user_name?: string,
    google_display_name?: string,
    google_account_id?: string,
    createdAt: number,
    modifiedAt?: number
}

namespace users {
    export async function add(user: User) {
        const entries = Object.entries(user);
        const columnsOrder = entries.flatMap(x => x.at(0)).join(', ');
        const values = entries.flatMap(x => x.at(1));
        const result = await query(`INSERT INTO Accounts (${columnsOrder}) VALUES (?)`, [values])
    }

    export async function getById(value: string): Promise<User | undefined> {
        if (cache.has(value)) {
            cache.ttl(value, 120);
            return cache.get<User>(value);
        }
        const users = await query<User>('SELECT * FROM Accounts WHERE accountId = ?', [value]);
        if (users[0]) {
            try {
                cache.set(users[0].accountId, users[0], 120)
            } catch { }
        }
        return users[0];
    }

    export async function getByEmail(value: string): Promise<User | undefined> {
        const users = await query<User>('SELECT * FROM Accounts WHERE email = ?', [value]);
        return users[0];
    }

    export async function getByGoogleId(value: string): Promise<User | undefined> {
        const users = await query<User>('SELECT * FROM Accounts WHERE google_account_id = ?', [value]);
        return users[0];
    }

    export async function getByDiscordId(value: string): Promise<User | undefined> {
        const users = await query<User>('SELECT * FROM Accounts WHERE discord_account_id = ?', [value]);
        return users[0];
    }

    export async function getByDiplayName(value: string) {
        return (await query<User>(`SELECT * FROM Accounts WHERE displayName = ? `, [value]))[0];
    }

    export function search(searchValue: string) {
        return query<User>(`SELECT * FROM Accounts WHERE displayName LIKE ? LIMIT 0, 100`, [`${searchValue}%`]);
    }

    export async function gets(userIds: string[]): Promise<User[]> {
        const validUsers = userIds.filter(x => x.length == 32 && rAccountId.test(x));

        if (validUsers.length <= 0) {
            return []
        }

        var cached = cache.mget<User>(userIds)

        var missingUsers = validUsers.filter(x => cached[x] == undefined)

        var result = Object.values(cached);

        if (missingUsers.length > 0) {
            result = result.concat(
                await query<User>(`SELECT * FROM Accounts WHERE accountId IN (?)`, [missingUsers])
            );
        }

        return result;
    }
}

export default users;