import Router from "express-promise-router";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { readFileSync } from "fs";
import * as path from "path";
import verifyAuthorization from "../middlewares/authorization";
import * as cookieParser from 'cookie-parser';

const app = Router();

const purchaseSitePath = path.join(__dirname, '../../resources/html/purchase.html');

app.get('/', cookieParser(), (req, res) => {
    const token = req.cookies['EPIC_BEARER_TOKEN'];

    if (!token) {
        return res.status(401).send('Not Autorized (Missing cookie)')
    }
    
    res.sendFile(purchaseSitePath)
})

module.exports = app;