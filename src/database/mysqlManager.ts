import * as mysql from 'mysql';
import * as crypto from 'crypto';

import { tokenInfo, profile as profileTypes, partyMember, PartyData } from '../structs/types';
import * as path from 'path';
import { readFileSync } from 'fs';
import { create } from 'domain';
import { party } from '../types/bodies';
import Party from '../structs/Party';
import * as dotenv from 'dotenv'
import * as nodeCache from 'node-cache';

dotenv.config();

var dbOptions = {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '')
}

const sqlCache = new nodeCache(
    {
        checkperiod: 5,
        maxKeys: 5000
    }
);


async function setupDB() {
    database = mysql.createConnection(dbOptions);
    return await new Promise((resolve, reject) => {
        database.connect((err?) => err ? reject(err) : resolve(true));
    })
}

var database = mysql.createConnection(dbOptions);

database.connect();

setInterval(async () => {
    if (database.state != 'authenticated' && database.state != 'connected') {
        await setupDB();
    };

    database.ping()
}, 30000); // to avoid idle disconnection


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

database.query(
    readFileSync(path.join(queriesDir, 'ensureSaveGamesExist.sql'), 'utf-8')
)


export async function query<T>(sql: string, values?: any[], ...cacheIgnore: any[]): Promise<T[]> {
    if (database.state != 'authenticated' && database.state != 'connected') {
        await setupDB();
    };


    var bIsSelectQuery = sql.toLowerCase().startsWith('select');
    var sqlForCache = values ? mysql.format(sql, cacheIgnore ? values.filter(x => !cacheIgnore.includes(x)) : values) : sql;

    if (bIsSelectQuery) {
        if (sqlCache.has(sqlForCache)) {
            var result = sqlCache.get<T[]>(sqlForCache);

            if (result) {
                return result;
            }
        }
    }

    return await new Promise((resolve, reject) => {
        database.query(
            {
                sql,
                values,
                timeout: 10000
            },
            (err, result) => {
                if (err) return reject(err);
                if (bIsSelectQuery) {
                    try {
                        sqlCache.set(sqlForCache, result, 5);
                    } catch { }
                }
                resolve(result);
            }
        );
    })
}

export async function isOperational(bPing: boolean = false): Promise<boolean> {
    if (database.state != 'authenticated') {
        return false;
    } 
    else if (!bPing)  {
        return true;
    }

    return await new Promise((resolve) => {
        database.ping((err?) => {
            if (err) {
                return resolve(false)
            }

            return resolve(true);
        })
    })
}

type OneOnly<Obj, Key extends keyof Obj> = { [key in Exclude<keyof Obj, Key>]: null } & Pick<Obj, Key>;
type OneOfByKey<T> = { [key in keyof T]: OneOnly<T, key> };




/*
purchaseToken VARCHAR(32) NOT NULL,
    accountId VARCHAR(32) NOT NULL,
    offers LONGTEXT NOT NULL);
 */
