import * as types from '../../structs/types';

export interface ExchangeCode {
    code: string;
    accountId: string;
    sessionId: string;
    createdAt: Date;
    expireAt: Date;
}

var exchange_codes: ExchangeCode[] = [];

export namespace exchanges {
    export async function add(code: string, accountId: string, sessionId: string, created: Date, expire: Date) {

        if (exchange_codes.find(x => x.accountId == accountId)) {
            exchange_codes = exchange_codes.filter(x => x.accountId != accountId);
        }

        exchange_codes.push(
            {
                code,
                accountId,
                sessionId,
                createdAt: created,
                expireAt: expire,
            }
        );
    }

    export async function remove(code: string) {
        exchange_codes = exchange_codes.filter(x => x.code != code);
    }

    export async function get(code: string) {
        return exchange_codes.find(x => x.code == code);
    }
}