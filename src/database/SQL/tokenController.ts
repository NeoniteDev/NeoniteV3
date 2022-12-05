import { query } from "./mysqlManager";
import * as types from '../structs/types';
import * as nodeCache from 'node-cache';
import * as mysql from 'mysql';
import * as path from 'path';
import { readFileSync } from 'fs';

// TODO: CHANGE TO DATABASE TIMESTAMP

const cache = new nodeCache();

const rToken = /\b[0-9a-f]{8}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{12}\b/

namespace tokens {
    interface token extends types.tokenInfo {
        refresh_token?: string;
    }

    export async function add(params: token | types.tokenInfoClient) {
        try {
            const entries = Object.entries(params);
            const columnsOrder = entries.flatMap(([key, value]) => key);
            const values = entries.flatMap(([key, value]) => value);

            await query(`INSERT INTO tokens (${columnsOrder}) VALUES (?)`, [values])
        } catch (e) { console.log(e); return false; }

        return true;
    }

    export async function getUserTokensCount(id: string) {
        var dateTime = Date.now();

        const result = await query<number>(`SELECT COUNT(token) AS count FROM tokens WHERE expireAt > ? AND account_id = ?`, [dateTime, id], dateTime);
        return result[0];
    }

    export async function check(token: string, bUseCache = true): Promise<boolean> {
        if (cache.has(token) && bUseCache) {
            return true;
        }
        var dateTime = Date.now();

        const result = await query<number>(`SELECT EXISTS(SELECT * from tokens WHERE expireAt > ? AND token = ?)`, [dateTime, token], dateTime);
        return Object.values(result[0])[0] == 1;
    }

    export async function get(token: string, bUseCache = true): Promise<token | undefined> {
        if (!rToken.test(token)) {
            return undefined;
        }
        
        if (cache.has(token) && bUseCache) {
            return cache.get<token>(token);
        }

        var dateTime = Date.now();

        const tokens = await query<token>(`SELECT * FROM tokens WHERE expireAt > ? AND token = ?`, [dateTime, token], dateTime);

        if (tokens[0] && bUseCache) {
            cache.set<token>(token, tokens[0], 120);
        }

        return tokens[0];
    }

    export async function remove(token: string) {
        if (cache.has(token)) {
            cache.del(token);
        }

        return await query(`DELETE FROM tokens WHERE token = ?`, [token]);
    }

    export async function removeOthers(token: string, accountId: string) {
        return await query(`DELETE FROM tokens WHERE token != ? AND account_id = ?`, [token, accountId]);
    }
}

setInterval(() => {
    query(`DELETE FROM tokens WHERE expireAt < ?`, [Date.now()])
}, 3.6e+6)

export default tokens;