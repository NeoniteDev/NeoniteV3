
import * as types from '../../utils/types';
import * as nodeCache from 'node-cache';
import * as mysql from 'mysql';
import * as path from 'path';
import { readFileSync } from 'fs';

// TODO: CHANGE TO DATABASE TIMESTAMP

interface token extends types.tokenInfo {
    refresh_token?: string;
}

var localTokens: (token | types.tokenInfoClient)[] = []

const rToken = /^[0-9A-F]{8}[0-9A-F]{4}4[0-9A-F]{3}[89AB][0-9A-F]{3}[0-9A-F]{12}$/

namespace tokens {

    export async function add(params: token | types.tokenInfoClient) {
        localTokens.push(params)
    }

    export async function getUserTokensCount(id: string) {
        var dateTime = Date.now();

        return localTokens.filter(x => x.auth_method != 'client_credentials' && x.account_id == id && x.expireAt.getTime() > Date.now()).length;
    }

    export async function check(token: string): Promise<boolean> {
        return localTokens.findIndex(x => x.token == token && x.expireAt.getTime() > Date.now()) != -1;
    }

    export async function get(token: string): Promise<token | types.tokenInfoClient | undefined> {
        if (!rToken.test(token)) {
            return undefined;
        }

        return localTokens.find(x => x.token == token && x.expireAt.getTime() > Date.now());
    }

    export function remove(token: string) {
        localTokens.splice(localTokens.findIndex(x => x.token == token), 1);
    }

    export async function removeOthers(token: string, accountId: string) {
        localTokens = localTokens.filter(x =>  x.auth_method != 'client_credentials' && (x.account_id != accountId || x.token == token));
    }
}

setInterval(() => {
    localTokens = localTokens.filter(x => x.expireAt.getTime() - 1000 > Date.now());
}, 3.6e+6)

export default tokens;