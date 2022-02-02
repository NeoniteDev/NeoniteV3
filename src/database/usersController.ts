import { query } from "./mysqlManager";
import * as types from '../structs/types';

export interface User {
    displayName: string;
    accountId: string;
    email: string;
    password: string;
    discord_account_id?: string,
    google_account_id?: string
}

namespace users {
    export async function add(user: User) {
        const entries = Object.entries(user);
        const columnsOrder = entries.flatMap(x => x.at(0)).join(', ');
        const values = entries.flatMap(x => x.at(1));
        const result = await query(`INSERT INTO Accounts (${columnsOrder}) VALUES (?)`, [values])
    }

    export async function getById(value: string): Promise<User | undefined> {
        const users = await query<User>('SELECT * FROM Accounts WHERE accountId = ?', [value]);
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

    export function getByDiplayName(value: string) {
        return query<User>(`SELECT * FROM Accounts WHERE displayName = ? `, [value]);
    }

    export function search(searchValue: string) {
        return query<User>(`SELECT * FROM Accounts WHERE displayName LIKE ? LIMIT 0, 100`, [`${searchValue}%`]);
    }

    export function gets(userIds: string[]): Promise<User[]> {
        const validUsers = userIds.filter(x => x.length == 32 && x.match(/^[0-9a-f]{8}[0-9a-f]{4}[0-5][0-9a-f]{3}[089ab][0-9a-f]{3}[0-9a-f]{12}$/) != null);
        return query<User>(`SELECT * FROM Accounts WHERE accountId IN (?)`, [validUsers]);
    }
}

export default users;