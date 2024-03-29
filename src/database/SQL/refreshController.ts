import { query } from "./mysqlManager";
import * as types from '../structs/types';

namespace refresh_tokens {
    interface refresh extends types.tokenInfo {
        bearer_token: string
    }

    export async function add(params: refresh) {
        try {
            const entries = Object.entries(params);
            const columnsOrder = entries.flatMap(([key, value]) => key);
            const values = entries.flatMap(([key, value]) => value);

            await query(`INSERT INTO refresh_tokens (${columnsOrder}) VALUES (?)`, [values])
        } catch (e) { console.log(e); return false; }

        return true;
    }

    export async function check(token: string): Promise<boolean> {
        const result = await query<number>(`SELECT EXISTS(SELECT * from refresh_tokens WHERE expireAt > ? AND token = ?)`, [Date.now(), token]);
        return Object.values(result[0])[0] == 1;
    }

    export async function get(token: string): Promise<refresh | undefined> {
        const tokens = await query<refresh>(`SELECT * FROM refresh_tokens WHERE expireAt > ? AND token = ?`, [Date.now(), token]);
        return tokens[0];
    }

    export async function remove(token: string) {
        try {
            await query(`DELETE FROM refresh_tokens WHERE token = ?`, [token])
        } catch (e) { console.log(e); return false; }

        return true;
    }

    export async function removeByToken(token: string) {
        try {
            await query(`DELETE FROM refresh_tokens WHERE bearer_token = ?`, [token])
        } catch (e) { console.log(e); return false; }

        return true;
    }

    export function removeOthers(sessionId: string, account_id: string) {
        return query(`DELETE FROM refresh_tokens WHERE bearer_token != ? AND account_id = ?`, [sessionId, account_id])
    }
}

export default refresh_tokens;