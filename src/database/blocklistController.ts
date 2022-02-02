import { query } from "./mysqlManager";
import * as types from '../structs/types';
import Friends from "./friendsController";

export interface BlockedUser {
    accountId: string;
    created: Date;
}

export interface DBvalue {
    accountId: string;
    blockedId: string;
    createdAt: number;
}

export namespace Blocklist {
    export async function block(accountId: string, accToBlock: string, date: Date) {
        await Friends.remove(accountId, accToBlock);
        await query<DBvalue>(
            `INSERT INTO blocklist (accountId, blockedId, createdAt) VALUES (?)`,
            [
                [
                    accountId,
                    accToBlock,
                    date.getTime()
                ]
            ]
        );

        return;
    }

    export async function remove(accountId: string, blockedId: string) {
        await query(
            `DELETE FROM blocklist WHERE accountId = ? AND blockedId = ?`,
            [accountId, blockedId]
        );
    }

    export async function getBlocked(accountId: string) {
        const result = await query<DBvalue>(`DELETE FROM blocklist WHERE accountId = ?`, [accountId]);
        return mapResult(result);
    }

    function mapResult(result: DBvalue[]): BlockedUser[] {
        return result.map(x => {
            return {
                accountId: x.blockedId,
                created: new Date(x.createdAt)
            }
        })
    }
}