/*
import * as types from '../../structs/types';

interface refresh extends types.tokenInfo {
    bearer_token: string
}

var localRefreshs: refresh[] = []

namespace refresh_tokens {
    

    export async function add(params: refresh) {
        localRefreshs.push(params);
    }

    export async function check(token: string): Promise<boolean> {
        return localRefreshs.findIndex(x => x.token == token && x.expireAt > Date.now()) != -1;
    }

    export async function get(token: string): Promise<refresh | undefined> {
        return localRefreshs.find(x => x.token == token && x.expireAt > Date.now());
    }

    export async function remove(token: string) {
        localRefreshs.splice(localRefreshs.findIndex(x => x.token == token), 1);
    }

    export async function removeByToken(token: string) {
        localRefreshs.splice(localRefreshs.findIndex(x => x.bearer_token == token), 1);

    }

    export function removeOthers(sessionId: string, accountId: string) {
        localRefreshs = localRefreshs.filter(x => x.account_id != accountId || x.bearer_token == sessionId);
    }
}

export default refresh_tokens;*/