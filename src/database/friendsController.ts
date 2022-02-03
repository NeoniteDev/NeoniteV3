import { query } from "./mysqlManager";
import * as types from '../structs/types';


const idRegexp = /^[0-9a-f]{8}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{12}$/;


interface friend {
    sentBy: string;
    sentTo: string;
    createdAt: number;
    status: "PENDING" | "ACCEPTED"

    favorite: 0 | 1;
    note: string;
    alias: string;

    /** favorite status of sentBy the sentTo  */
    friendFavorite: 0 | 1;
    /** note for sentBy from sentTo */
    friendNote: string;
    /** alias for the sentBy from the sentTo */
    friendAlias: string;
}


interface friendObject {
    accountId: string;
    alias: string;
    note: string;
    favorite: boolean;
    created: Date;
    direction: "INCOMING" | "OUTGOING",
    status: friend['status']
}

namespace Friends {
    // code varchar(32) not null, accountId varchar(32) not null, createdAt BIGINT not null, expireAt BIGINT not null

    export async function getFriendship(accountId: string, friendId: string): Promise<friendObject | undefined> {
        const result = await query<friend>(`SELECT * FROM friends WHERE (sentBy = ? AND sentTo = ?) OR (sentBy = ? AND sentTo = ?)`, [accountId, friendId, friendId, accountId]);

        return mapResult(result, accountId)[0];
    }


    export async function acceptRequest(sentTo: string, sentBy: string) {
        await query(
            `UPDATE friends
                SET \`status\` = 'ACCEPTED'
            WHERE sentTo = ? AND sentBy = ?`,
            [
                sentTo,
                sentBy
            ]
        )
    }

    export async function remove(accountId: string, friendId: string) {
        await query(
            `DELETE FROM friends WHERE (sentBy = ? AND sentTo = ?) OR (sentTo = ? AND sentBy = ?)`,
            [
                accountId,
                friendId,
                accountId,
                friendId,
            ]
        )
    }

    /**
     * 
     * @param accountId 
     * @param friendId 
     * @returns account Ids of mutuals
     */
    export async function getMutual(accountId: string, friendId: string) {
        if (accountId.length != 32 ||
            friendId.length != 32 ||
            accountId.match(idRegexp) == null ||
            friendId.match(idRegexp) == null
        ) {
            throw new Error('invalid ids');
        }


        const result = (await query<{ UserId: string }>(
            // https://stackoverflow.com/a/36102022/14545859
            `SELECT UserAFriends.UserId FROM
            (
              SELECT sentTo UserId FROM friends WHERE sentBy = ?
                UNION 
              SELECT sentBy UserId FROM friends WHERE sentTo = ?
            ) AS UserAFriends
            JOIN  
            (
              SELECT sentTo UserId FROM friends WHERE sentBy = ?
                UNION 
              SELECT sentBy UserId FROM friends WHERE sentTo = ?
            ) AS UserBFriends 
            ON  UserAFriends.UserId = UserBFriends.UserId`,
            [accountId, accountId, friendId, friendId]
        )).map(x => x.UserId)


        return result;
    }

    export async function getFriends(accountId: string, includePending: boolean = false) {
        if (includePending) {
            var result = await query<friend>(`SELECT * FROM friends WHERE (sentBy = ? OR sentTo = ?)`, [accountId, accountId]);
        } else {
            var result = await query<friend>("SELECT * FROM friends WHERE (sentBy = ? OR sentTo = ?) AND `status` = 'PENDING'", [accountId, accountId]);
        }
        
        return mapResult(result, accountId);
    }

    export async function addRequest(sentBy: string, sentTo: string) {
        await query(
            `INSERT INTO friends (sentBy, sentTo, createdAt, \`status\`) VALUES (?)`,
            [
                [
                    sentBy,
                    sentTo,
                    Date.now(),
                    'PENDING'
                ]
            ]
        )
    }

    export async function getRequest(accountId: string, from: string) {
        return mapResult(
            await query<friend>(
                `SELECT * FROM friends WHERE sentBy = ? AND sentTo = ? AND \`status\` = 'PENDING'`,
                [
                    from,
                    accountId
                ]
            ),  accountId
        )
    }

    export async function getRequests(accountId: string) {
        return mapResult(
            await query<friend>(
                `SELECT * FROM friends WHERE sentBy = ? OR sentTo = ? AND \`status\` = 'PENDING'`,
                [
                    accountId,
                    accountId
                ]
            ),
            accountId
        )
    }

    function mapResult(friends: friend[], accountId: string): friendObject[] {
        return friends.map((x) => {
            var isIncomming = x.sentTo == accountId;
            return {
                accountId: isIncomming ? x.sentBy : x.sentTo,
                alias: isIncomming ? x.friendAlias : x.alias,
                note: isIncomming ? x.friendNote : x.note,
                favorite: isIncomming ? x.friendFavorite == 1 : x.favorite == 1,
                created: new Date(x.createdAt),
                direction: isIncomming ? 'INCOMING' : 'OUTGOING',
                status: x.status
            }
        })
    }
}

export default Friends;