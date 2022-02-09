import Router from "express-promise-router";
import errors, { ApiError } from "../structs/errors";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from 'http-errors';
import Users, { User } from "../database/usersController";
import verifyAuthorization from "../middlewares/authorization";

const app = Router();

app.get('/api/public/account/lookup', verifyAuthorization(false), async (req, res, next) => {
    const searchQuery = req.query.q;
    if (searchQuery == undefined || typeof searchQuery != 'string') {
        throw errors.neoniteDev.basic.badRequest;
    }

    if (rEmail.test(searchQuery)) {
        var user: User | undefined = await Users.getByEmail(searchQuery);
    } else {
        var user: User | undefined = await Users.getByDiplayName(searchQuery)
    }

    if (!user) {
        throw errors.neoniteDev.account.accountNotFound.withMessage(`Sorry, we couldn't find an account for ${searchQuery}`);
    }

    res.json({
        id: user.accountId,
        displayName: user.displayName
    })
})


const rEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/


module.exports = app;