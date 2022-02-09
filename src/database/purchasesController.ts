import { query } from "./mysqlManager";
import * as types from '../structs/types';
import { escape } from 'mysql';

namespace pendingPurchases {
    interface purchase {
        purchaseToken: string,
        offers: string[],
        accountId: string,
        ip_hash: string,
        receiptId: string
    }

    const allowed = ['purchaseToken', 'offers', 'accountId', 'ip_hash', 'receiptId']

    type dbpruchase = Omit<purchase, 'offers'> & { offers: string };

    export async function getAll(value: Partial<Omit<purchase, 'offers'>>): Promise<purchase[]> {
        const entries = Object.entries(value);

        // @ts-ignore
        if (value.offers) {
            return [];
        }

        if (entries.length <= 0) {
            return [];
        }

        if (entries.map(x => x[0]).find(x => !allowed.includes(x))) {
            return [];
        }

        if ('accountId' in value && typeof value.accountId != 'string' ||
            'ip_hash' in value && typeof value.ip_hash != 'string' ||
            'purchaseToken' in value && typeof value.purchaseToken != 'string' ||
            'receiptId' in value && typeof value.receiptId != 'string'
        ) {
            return [];
        }


        const contions = entries.map(([key, value]) => `\`${key}\` = ${escape(value)}`).join(' AND ');

        const purchases = await query<dbpruchase>(`SELECT * FROM purchases WHERE ${contions}`);


        return purchases.map((x) => {
            return {
                ...x,
                offers: JSON.parse(x.offers)
            }
        });
    }
    export async function get(value: Partial<Omit<purchase, 'offers'>>): Promise<purchase | undefined> {
        // @ts-ignore
        if (value.offers) {
            return undefined;
        }

        const purchases = await getAll(value);
        return purchases[0];
    }

    export async function add(param: Omit<purchase, 'receiptId'>) {
        try {
            var purchase: Omit<dbpruchase, 'receiptId'> = {
                ...param,
                offers: JSON.stringify(param.offers)
            }

            const entries = Object.entries(purchase);

            if (entries.length != 4) {
                return false;
            }

            if (!purchase.accountId || !purchase.ip_hash || !purchase.offers || !purchase.purchaseToken) {
                return false;
            }

            if (typeof purchase.accountId != 'string' ||
                typeof purchase.ip_hash != 'string' ||
                typeof purchase.offers != 'object' ||
                typeof purchase.purchaseToken != 'string') {
                return false;
            }

            const columnsOrder = entries.flatMap(x => x.at(0)).join(', ');
            const values = entries.flatMap(x => x.at(1));
            const result = await query(`INSERT INTO purchases (${columnsOrder}) VALUES (?)`, [values])
        } catch (e) { console.error(e); return false; }
    }

    export function setReceiptId(purchaseToken: string, receiptId: string) {
        return query(`UPDATE Profiles SET receiptId = \`${receiptId}\` WHERE purchaseToken = ?`, [purchaseToken])
    }

    export async function remove(param: purchase) {
        try {
            const entries = Object.entries(param);

            if (entries.length <= 0) {
                return false;
            }

            if (entries.map(x => x[0]).find(x => !allowed.includes(x))) {
                return false;
            }

            if ('accountId' in param && typeof param.accountId != 'string' ||
                'ip_hash' in param && typeof param.ip_hash != 'string' ||
                'offers' in param && typeof param.offers != 'object' ||
                'purchaseToken' in param && typeof param.purchaseToken != 'string' ||
                'receiptId' in param && typeof param.receiptId != 'string'
            ) {
                return false;
            }


            const contions = entries.map(([key, value]) => `\`${key}\` = ${escape(value)}`).join(' AND ');

            if (contions.length <= 0) {
                return false;
            }

            await query(`DELETE FROM tokens WHERE ${contions}`);
        } catch (e) { console.error(e); return false; }
    }
}

export default pendingPurchases;