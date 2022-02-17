import Router from "express-promise-router";
import errors, { ApiError } from "../../structs/errors";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from 'http-errors';
import Users, { User } from "../../database/usersController";
import VerifyAuthorization, { reqWithAuth, reqWithAuthMulti } from "../../middlewares/authorization";
import validateMethod from '../../middlewares/Method'

const app = Router();

app.post('/ET2/CollectData.1', (req, res) => res.status(202).send());

app.post('/CollectData.1', (req, res) => res.status(202).send());

export default app;
