import * as types from '../../utils/types';
import { getService, updateService } from './LocalDBmanager';

interface purchase {
    accountId: string,
    purchaseToken: string,
    offers: string[],
    ip_hash: string,
    receiptId?: string
}

const localPurchases: purchase[] = [];

namespace pendingPurchases {
    export async function getAll(accountId: string): Promise<purchase[]> {
        return localPurchases.filter(x => x.accountId == accountId);
    }


    export async function get(purchaseToken: string) {
        return localPurchases.filter(x => x.purchaseToken == purchaseToken);
    }
    
    export async function add(accountId: string, ip_hash: string, offers: string[], purchaseToken: string) {
        localPurchases.push(
            {
                accountId,
                ip_hash,
                offers,
                purchaseToken
            }
        )
    }

    export function setReceiptId(purchaseToken: string, receiptId: string) {
        localPurchases[localPurchases.findIndex(x => x.purchaseToken == purchaseToken)].receiptId = receiptId;
    }

    export async function remove(purchaseToken: string) {
        localPurchases.splice(localPurchases.findIndex(x => x.purchaseToken == purchaseToken), 1);
    }
}

export default pendingPurchases;