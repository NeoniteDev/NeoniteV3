import Router from "express-promise-router";
import errors, { ApiError } from "../../structs/errors";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from 'http-errors';
import users from "../../database/local/usersController";
import verifyAuthorization from "../../middlewares/authorization";

const app = Router();

app.post('/profile/privacy_settings', verifyAuthorization(), (req, res) => {
    res.json(
        {
            privacySettings: {
                playRegion: "UNDEFINED_LEVEL",
                badges: "UNDEFINED_LEVEL",
                languages: "UNDEFINED_LEVEL"
            }
        }
    )
})

export default app;