import Router from "express-promise-router";
import errors, { ApiError } from "../../structs/errors";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from 'http-errors';
import users from "../../database/usersController";
import verifyAuthorization from "../../middlewares/authorization";
import { randomUUID } from "crypto";

const app = Router();

// prm
app.post('/api/v1/fortnite-br/surfaces/motd/target', (req, res) => {
    res.json(
        {
            "contentType": "collection",
            "contentId": "motd-default-collection",
            "tcId": randomUUID(),
            "contentItems": [

            ]
        }
    )
})

export default app;