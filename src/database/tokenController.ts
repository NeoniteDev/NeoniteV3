import { query } from "./mysqlManager";
import * as types from '../structs/types';

namespace tokens {
    interface token extends types.tokenInfo {
        refresh_token?: string;
    }

    export async function add(params: token | types.tokenInfoClient) {
        query(`DELETE FROM tokens WHERE expireAt < ?`, [Date.now()]);

        try {
            const entries = Object.entries(params);
            const columnsOrder = entries.flatMap(([key, value]) => key);
            const values = entries.flatMap(([key, value]) => value);

            await query(`INSERT INTO tokens (${columnsOrder}) VALUES (?)`, [values])
        } catch (e) { console.log(e); return false; }

        return true;
    }

    export async function check(token: string): Promise<boolean> {
        query(`DELETE FROM tokens WHERE expireAt < ?`, [Date.now()]);

        const result = await query<number>(`SELECT EXISTS(SELECT * from tokens WHERE expireAt > ? AND token = ?)`, [Date.now(), token]);
        return Object.values(result[0])[0] == 1;
    }

    export async function get(token: string): Promise<token | undefined> {
        query(`DELETE FROM tokens WHERE expireAt < ?`, [Date.now()]);


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

export default tokens;