import * as types from '../../utils/types';
import { escape } from "mysql";

const idRegexp = /^[0-9a-f]{8}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{12}$/;

export enum availability {
    admins,
    trusted,
    everyone
}

export interface session {
    "id": string,
    "ownerId": string,
    "ownerName": string,
    "serverName": string,
    "serverAddress": string,
    "serverPort": number,
    "totalPlayers": number,
    "maxPublicPlayers": number,
    "openPublicPlayers": number,
    "maxPrivatePlayers": number,
    "openPrivatePlayers": number,
    "attributes": Record<string, string | number>,
    "publicPlayers": string[],
    "privatePlayers": string[],
    "allowJoinInProgress": boolean,
    "shouldAdvertise": boolean,
    "isDedicated": boolean,
    "usesStats": boolean,
    "allowInvites": boolean,
    "usesPresence": boolean,
    "allowJoinViaPresence": boolean,
    "allowJoinViaPresenceFriendsOnly": boolean,
    "buildUniqueId": string,
    "lastUpdated": Date,
    "started": boolean
}

const sessions: session[] = []

namespace gameSessions {

    export async function create(config: session) {
        sessions.push(config);
    }

    export async function remove(id: string) {
        const sessionIndex = sessions.findIndex(x => x.id == id);
        sessions.splice(sessionIndex, 1);
    }

    export async function get(id: string): Promise<session | undefined> {
        return sessions.find(x => x.id == id);
    }

    export async function addPrivatePlayer(id: string, playerId: string, ticketId: string) {
        sessions[sessions.findIndex(x => x.id == id)].privatePlayers.push(playerId);
        sessions[sessions.findIndex(x => x.id == id)].totalPlayers++;
    }

    export async function removePrivatePlayer(id: string, playerId: string) {
        if (sessions.findIndex(x => x.id == id) == -1) {
            throw "Session Not Found";
        }

        sessions[sessions.findIndex(x => x.id == id)].privatePlayers.remove(playerId);
        sessions[sessions.findIndex(x => x.id == id)].totalPlayers--;
    }

    export async function getAll() {
        return sessions;
    }
}

export default gameSessions;


/*
{
  "id": "e1763bb5d3ab4dac92308214b8ad2011",
  "ownerId": "03C203A8340802080020029583FD37FA",
  "ownerName": "[DS]fortnite-livenaaws01-3572752-1-i-0433eada14662d828-67903",
  "serverName": "[DS]fortnite-livenaaws01-3572752-1-i-0433eada14662d828-67903",
  "serverAddress": "54.90.251.159",
  "serverPort": 9015,
  "maxPublicPlayers": 4,
  "openPublicPlayers": 3,
  "maxPrivatePlayers": 0,
  "openPrivatePlayers": 0,
  "attributes": {
    "THEATERID_s": "33A2311D4AE64B361CCE27BC9F313C8B",
    "ZONEINSTANCEID_s": "{\"worldId\":\"53040949-03c7-499b-aac5-a2f030060c3f\",\"theaterId\":\"33A2311D4AE64B361CCE27BC9F313C8B\",\"theaterMissionId\":\"aca31b3b-3dd4-4e37-90f8-8b5372761a62\",\"theaterMissionAlertId\":\"\",\"zoneThemeClass\":\"/Game/World/ZoneThemes/Outposts/BP_ZT_TheOutpost_PvE_01.BP_ZT_TheOutpost_PvE_01_C\"}",
    "MINDIFFICULTY_i": 1000,
    "MATCHMAKINGPOOL_s": "Desktop",
    "QOS_i": 1,
    "NEEDSSORT_i": 2,
    "PARTITION_i": 4,
    "REGION_s": "NA",
    "WUID_s": "53040949-03c7-499b-aac5-a2f030060c3f",
    "BEACONPORT_i": 15015,
    "PLAYLISTID_i": 0,
    "GAMEMODE_s": "FORTOUTPOST",
    "CRITICALMISSION_b": false,
    "MAXDIFFICULTY_i": 1100,
    "MMLVL_i": 58,
    "DCID_s": "FORTNITE-LIVENAAWS01-3572752-1",
    "GATHERABLE_b": true,
    "NEEDS_i": 2
  },
  "publicPlayers": [
    "1fae877ea5e148728fd504c5c262d3ca"
  ],
  "privatePlayers": [],
  "totalPlayers": 1,
  "allowJoinInProgress": true,
  "shouldAdvertise": false,
  "isDedicated": true,
  "usesStats": false,
  "allowInvites": true,
  "usesPresence": false,
  "allowJoinViaPresence": true,
  "allowJoinViaPresenceFriendsOnly": false,
  "buildUniqueId": "1668994382",
  "lastUpdated": "2017-08-08T04:10:24.374Z",
  "started": true
}
*/