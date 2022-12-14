import * as types from '../../utils/types';
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
    export async function block(accountId: string, accToBlock: string, date: Date) { }

    export async function remove(accountId: string, blockedId: string) { }

    export async function getBlocked(accountId: string) { return [] }
}