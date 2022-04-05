import { query } from "./mysqlManager";
import * as types from '../structs/types';
import { escape } from 'mysql';
import { xml } from "@xmpp/client";

namespace pendingPurchases {
    interface purchase {
        purchaseToken: string,
        offers: string,
        accountId: string,
        ip_hash: string,
        receiptId: string
    }

    const allowed = ['purchaseToken', 'offers', 'accountId', 'ip_hash', 'receiptId']

    type dbpruchase = purchase;

    export async function getAll(accountId: string): Promise<purchase[]> {
        const purchases = await query<dbpruchase>(`SELECT * FROM purchases WHERE accountId = ?`, [ accountId ]);


        return purchases;
    }
    /*
    export async function get(value: Partial<Omit<purchase, 'offers'>>): Promise<purchase | undefined> {
        // @ts-ignore
        if (value.offers) {
            return undefined;
        }

        const purchases = await getAll(value);
        return purchases[0];
    }*/

    /*{
        purchaseToken: string,
        offers: string[],
        accountId: string,
        ip_hash: string,
        receiptId: string
    }*/
    export async function add(accountId: string, ip_hash: string, offers: string[], purchaseToken: string) {
        const offersStrings = offers.join(',');
        await query(
            `INSERT INTO purchases (purchaseToken, offers, accountId, ip_hash) VALUES (?)`,
            [[purchaseToken, offersStrings, accountId, ip_hash]]
        )
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