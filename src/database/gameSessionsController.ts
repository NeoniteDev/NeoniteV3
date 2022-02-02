import { query } from "./mysqlManager";
import * as types from '../structs/types';
import { escape } from "mysql";

const idRegexp = /^[0-9a-f]{8}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{12}$/;

export enum availability {
    admins,
    trusted,
    everyone
}

interface DBvalues {
    id: string,
    ownerName: string,
    serverName: string,
    severIp: string,
    maxPlayers: number,
    minPlayers: number,
    availableTo: availability,
    numPlayers: number,
    createdAt: number,
    expireAt: number
}



export interface Session extends Omit<DBvalues, 'players' | 'createdAt' | 'expireAt'> {
    createdAt: Date,
    expireAt: Date
}

namespace gameSessions {

    export async function create(config: Omit<DBvalues, 'players' | 'numPlayers' | 'createdAt'>) {
        await query(
            `INSERT INTO gameSessions 
                (
                    id, ownerName,
                    serverName, severIp,
                    maxPlayers, minPlayers, 
                    availableTo, expireAt
                ) 
            VALUES (?)`,
            [
                [
                    config.id,
                    config.ownerName,
                    config.serverName,
                    config.severIp,
                    config.maxPlayers,
                    config.minPlayers,
                    config.availableTo,
                    config.expireAt
                ]
            ]
        );
    }

    export async function remove(id: string) {
        await query(
            `DELETE FROM gameSessions WHERE id = ?`,
            [
                id
            ]
        );
    }

    export async function get(id: string): Promise<Session | undefined> {
        const result = await query<DBvalues>(
            `SELECT * FROM gameSessions WHERE id = ?`,
            [
                id
            ]
        );

        return mapResult(result)[0];
    }

    export async function addPlayer(id: string, tickedIt: string) {
        const session = await get(id);
        if (!session) { throw new Error('session not found'); }

        session.numPlayers++;

        return await query<DBvalues>(
            `UPDATE gameSessions 
                SET numPlayers = ? 
            WHERE id = ?`,
            [session.numPlayers, id]
        );
    }

    export async function removePlayer(id: string, tickedIt: string) {
        const session = await get(id);
        if (!session) { throw new Error('session not found'); }

        session.numPlayers--;

        await query(
            `UPDATE gameSessions 
                SET numPlayers = ?  
            WHERE id = ?`, 
            [session.numPlayers, id]
        );
    }

    export async function getSome() {
        return mapResult(
            await query<DBvalues>(
                `SELECT * FROM gameSessions LIMIT 0, 5`
            )
        );
    }

    export async function getAll() {
        return mapResult(
            await query<DBvalues>(
                `SELECT * gameSessions LIMIT 0, 100`
            )
        )
    }

    function mapResult(result: DBvalues[]): Session[] {
        return result.map(x => {
            return {
                id: x.id,
                availableTo: x.availableTo,
                maxPlayers: x.maxPlayers,
                minPlayers: x.minPlayers,
                numPlayers: x.numPlayers,
                ownerName: x.ownerName,
                serverName: x.serverName,
                severIp: x.severIp,
                //players: x.players.split(','),
                createdAt: new Date(x.createdAt),
                expireAt: new Date(x.expireAt)
            }
        })
    }
}

export default gameSessions;