import { existsSync } from 'fs';
import * as path from 'path';
import { send } from 'process';
import errors from '../../utils/errors';
import * as types from '../../utils/types';
import { getService, updateService } from './LocalDBmanager';


const idRegexp = /^[0-9a-f]{8}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{12}$/;

interface friendObject {
    accountId: string;
    alias: string;
    note: string;
    favorite: boolean;
    created: Date;
    direction: "INCOMING" | "OUTGOING",
    status: "PENDING" | "ACCEPTED"
}


namespace Friends {
    // code varchar(32) not null, accountId varchar(32) not null, createdAt BIGINT not null, expireAt BIGINT not null

    export async function getFriendship(accountId: string, friendId: string): Promise<friendObject | undefined> {
        try {
            const account = await getService<friendObject[]>(accountId, 'friends');
            return account.find(x => x.accountId == friendId);
        } catch { return undefined; }
    }


    export async function acceptRequest(accountId: string, senderId: string) {
        const account = await getService<friendObject[]>(accountId, 'friends');
        const sender = await getService<friendObject[]>(senderId, 'friends');

        const requestIndex = account.findIndex(x => x.accountId == senderId && x.direction == 'INCOMING' && x.status == 'PENDING');
        const senderIndex = sender.findIndex(x => x.accountId == accountId && x.direction == 'OUTGOING' && x.status == 'PENDING');

        if (requestIndex == -1 || senderIndex == -1) {
            throw errors.neoniteDev.friends.friendshipNotFound;
        }

        account[requestIndex].status == 'ACCEPTED';
        sender[senderIndex].status == 'ACCEPTED';

        updateService(accountId, 'friends', account);
        updateService(senderId, 'friends', sender);
    }

    export async function remove(accountId: string, friendId: string) {
        let account = await getService<friendObject[]>(accountId, 'friends');
        let friend = await getService<friendObject[]>(friendId, 'friends');

        const accountIndex = account.findIndex(x => x.accountId == friendId && x.status == 'ACCEPTED');
        const friendIndex = friend.findIndex(x => x.accountId == accountId && x.status == 'ACCEPTED');

        if (accountIndex == -1 || friendIndex == -1) {
            throw errors.neoniteDev.friends.friendshipNotFound;
        }

        account = account.filter(x => x.accountId != friendId);
        friend = friend.filter(x => x.accountId != accountId);

        updateService(accountId, 'friends', account);
        updateService(friendId, 'friends', friend);
    }

    /**
     * 
     * @param accountId 
     * @param targetId 
     * @returns account Ids of mutuals
     */
    export async function getMutual(accountId: string, targetId: string) {
        if (accountId.length != 32 ||
            targetId.length != 32 ||
            accountId.match(idRegexp) == null ||
            targetId.match(idRegexp) == null
        ) {
            throw new Error('invalid ids');
        }

        const account = await getService<friendObject[]>(accountId, 'friends');
        const target = await getService<friendObject[]>(targetId, 'friends');


        const friendIds = account.map(x => x.accountId);
        const targetIds = target.map(x => x.accountId);

        return targetIds.filter(x => friendIds.includes(x));
    }

    export async function getFriends(accountId: string, includePending: boolean = false) {
        try {
            const friends = await getService<friendObject[]>(accountId, 'friends');

            if (!includePending) {
                return friends.filter(x => x.status == 'ACCEPTED');
            }

            return friends;
        } catch {
            return [];
        }
    }

    export async function addRequest(accountId: string, targetId: string) {
        const account = await getService<friendObject[]>(accountId, 'friends');
        const target = await getService<friendObject[]>(targetId, 'friends');

        if (account.find(x => x.accountId == targetId)) {
            throw errors.neoniteDev.friends.requestAlreadySent;
        }

        const friendData: Omit<friendObject, 'direction' | 'accountId'> = {
            alias: '',
            created: new Date(),
            favorite: false,
            note: '',
            status: 'PENDING'
        }

        account.push(
            {
                ...friendData,
                accountId: targetId,
                direction: 'OUTGOING'
            }
        )

        target.push(
            {
                ...friendData,
                accountId: accountId,
                direction: 'INCOMING'
            }
        );

        updateService(accountId, 'friends', account);
        updateService(targetId, 'friends', target);
    }

    export async function getRequest(accountId: string, targetId: string) {
        try {
            const account = await getService<friendObject[]>(accountId, 'friends');
            return account.find(x => x.accountId == targetId && x.status == 'PENDING');
        } catch { return undefined; }
    }

    export async function getRequests(accountId: string) {
        try {
            const friends = await getService<friendObject[]>(accountId, 'friends');

            return friends.filter(x => x.status == 'PENDING');
        } catch { return []; }
    }
}

export default Friends;