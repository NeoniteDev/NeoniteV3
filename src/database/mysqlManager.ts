import * as mysql from 'mysql';
import * as crypto from 'crypto';

import { tokenInfo, profile as profileTypes, partyMember, PartyData } from '../structs/types';
import * as path from 'path';
import { readFileSync } from 'fs';
import { create } from 'domain';
import { party } from '../types/bodies';
import Party from '../structs/Party';
import * as dotenv from 'dotenv'

dotenv.config();

var dbOptions = {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || ''),
}


function setupDB() {
    database = mysql.createConnection(dbOptions);
    database.connect();
}

var database = mysql.createConnection(dbOptions);

database.connect();

setInterval(() => {
    if (database.state != 'authenticated' && database.state != 'connected') {
        return setupDB();
    };

    database.ping()
}, 30000); // to avoid idle disconnection

type supportedProfiles = "common_public" | "athena" | "campaign";

export interface profile {
    "created": string,
    "updated": string,
    "rvn": number,
    "wipeNumber": number,
    "accountId": string,
    "profileId": supportedProfiles,
    "version"?: string,
    "items": Record<string, any>,
    "stats": {
        "attributes": Record<string, any>
    }
}



database.query(`
CREATE TABLE IF NOT EXISTS Accounts (
    displayName varchar(50) not null,
    accountId varchar(32) not null,
    email varchar(255) not null,
    password varchar(255) not null,
    discord_account_id varchar(18),
    google_account_id varchar(20)
);
`)

const queriesDir = path.join(__dirname, '../../resources/sqlQueries/')

database.query(
    readFileSync(path.join(queriesDir, 'ensureExchangeExist.sql'), 'utf-8')
)
database.query('CREATE TABLE IF NOT EXISTS WebTokens (token varchar(32) not null, accountId varchar(32), expireAt BIGINT);')

database.query(
    readFileSync(path.join(queriesDir, 'ensureRefreshExists.sql'), 'utf-8')
)

database.query(
    readFileSync(path.join(queriesDir, 'ensureTokenExists.sql'), 'utf-8')
)

database.query(`CREATE TABLE IF NOT EXISTS purchases (
    purchaseToken VARCHAR(32) NOT NULL,
    accountId VARCHAR(32) NOT NULL,
    offers LONGTEXT NOT NULL,
	ip_hash VARCHAR(32) NOT NULL,
    receiptId VARCHAR(32)
    );
`)

database.query(
    readFileSync(path.join(queriesDir, 'ensureProfilesExist.sql'), 'utf-8')
)

database.query(
    readFileSync(path.join(queriesDir, 'ensurePartiesExist.sql'), 'utf-8')
)

database.query(
    readFileSync(path.join(queriesDir, 'ensurePingsExist.sql'), 'utf-8')
)

database.query(
    readFileSync(path.join(queriesDir, 'ensurePingsExist.sql'), 'utf-8')
)

database.query(
    readFileSync(path.join(queriesDir, 'ensureFriendsExist.sql'), 'utf-8')
)

database.query(
    readFileSync(path.join(queriesDir, 'ensureGameSessionsExist.sql'), 'utf-8')
)


export function query<T>(sql: string, values?: any): Promise<T[]> {
    if (database.state != 'authenticated' && database.state != 'connected') {
        setupDB();
    };

    return new Promise((resolve, reject) => {
        database.query(sql, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    })
}

type OneOnly<Obj, Key extends keyof Obj> = { [key in Exclude<keyof Obj, Key>]: null } & Pick<Obj, Key>;
type OneOfByKey<T> = { [key in keyof T]: OneOnly<T, key> };




/*
purchaseToken VARCHAR(32) NOT NULL,
    accountId VARCHAR(32) NOT NULL,
    offers LONGTEXT NOT NULL);
 */
