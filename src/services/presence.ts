import Router from "express-promise-router";
import errors, { ApiError } from "../structs/errors";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from 'http-errors';
import verifyAuthorization from "../middlewares/authorization";
import * as mysql from 'mysql';
import Friends from "../database/local/friendsController";

/*
const connection = mysql.createConnection({
    database: '',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '')
})

setInterval(() => connection.ping(), 60000); // to avoid idle disconnection

interface DBvalue {
    username: string,
    offlinePresence: string,
    offlineDate: string
}*/

const app = Router();

app.get('/api/v1/_/:accountId/last-online', verifyAuthorization(), async (req, res, next) => {
    if (req.params.accountId != req.auth.account_id) {
        throw errors.neoniteDev.authentication.notYourAccount;
    }
    /*
    const friends = (await Friends.getFriends(req.params.accountId)).map(x => (
        {
            accountId: x.accountId,
            createdAt: x.created,
            favorite: x.favorite
        }
    ))

    connection.query(
        'SELECT * FROM ofPresence WHERE username IN (?)', [friends.map(x => x.accountId)],
        (err, values: DBvalue[]) => {
            if (err) {
                return next(err);
            } 
            
            res.json(
                Object.fromEntries(
                    values.map(x =>
                        [
                            x.username,
                            [
                                {
                                    "last_online": new Date(parseInt(x.offlineDate)).toISOString()
                                }
                            ]
                        ]
                    )
                )
            );
        }
    )*/

    res.json({});
})

module.exports = app;