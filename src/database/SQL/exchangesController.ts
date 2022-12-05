import { query } from "./mysqlManager";
import * as types from '../structs/types';

export interface ExchangeCode {
    code: string;
    accountId: string;
    sessionId: string;
    createdAt: number;
    expireAt: number;
}

export namespace exchanges {
    // code varchar(32) not null, accountId varchar(32) not null, createdAt BIGINT not null, expireAt BIGINT not null
    export async function add(code: string, accountId: string, sessionId: string, created: Date, expire: Date) {
        query(`DELETE FROM ExchangeCodes WHERE expireAt < ?`, [Date.now()]);

        await query<ExchangeCode>(
            `INSERT INTO ExchangeCodes (code, accountId, sessionId, createdAt, expireAt) VALUES (?)`,
            [
                [
                    code,
                    accountId,
                    sessionId,
                    created.getTime(),
                    expire.getTime()
                ]
            ]
        );

        return;
    }

    export async function remove(code: string) {
        await query(`DELETE FROM ExchangeCodes WHERE expireAt < ? OR code = ?`, [Date.now(), code]);
    }

    export async function get(code: string) {
        query(`DELETE FROM ExchangeCodes WHERE expireAt < ?`, [Date.now()]);
        const codes = await query<ExchangeCode>(`SELECT * FROM ExchangeCodes WHERE expireAt > ? AND code = ?`, [Date.now(), code]);
        return codes.at(0);
    }
}