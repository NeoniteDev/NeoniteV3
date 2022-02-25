import * as express from 'express';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import * as fs from 'fs';
import errors, { ApiError } from './src/structs/errors';
import * as statuses from 'statuses'
import { } from './src/structs/types'
import * as https from 'http'
import * as dotenv from 'dotenv'
import * as path from 'path'
import websocketHandler from './src/websocket'
import rateLimit from 'express-rate-limit'
import { } from 'colors'
import { HttpError } from 'http-errors';

const packageFile = require('./package.json');
require('./src/structs/polyfill');
require('colors');

dotenv.config();

const app = express();

app.set('etag', false);
app.disable('x-powered-by');

const limiter = rateLimit(
    {
        windowMs: 30000,
        max: 75,
        standardHeaders: true,
        legacyHeaders: false,

        handler(req, res, next, optionsUsed) {
            errors.neoniteDev.basic.throttled
                .withMessage(`Operation access is limited by throttling policy, please try again in ${Math.round(optionsUsed.windowMs) / 1000} second(s)`)
                .with(optionsUsed.windowMs.toString()).apply(res);
        }
    }
)

app.use(express.static('resources/public'));

app.use((req, res, next) => {
    // restore cloudflare client ip
    var cf_ip = req.get('cf-connecting-ip');
    if (cf_ip) {
        Object.defineProperty(req, 'ip', {
            configurable: true,
            enumerable: true,
            get: function () { return this.get('cf-connecting-ip') }
        })
    }

    // URL Rewriting
    if (req.path == '/logout' && typeof req.query.path == 'string') {
        req.url = req.query.path;
    }

    res.setTimeout(20000, function () {
        errors.neoniteDev.internal.requestTimedOut.apply(res);
    })

    next();
});

app.use(limiter)


fs.readdirSync('./src/services').forEach(filename => {
    if (!filename.endsWith('.js') && !filename.endsWith('.ts'))
        return;

    const servicename = filename.replace(/(?:.ts|.js)$/, "");

    try {
        app.use('/' + servicename, require(`./src/services/${filename}`))
    }
    catch (e) {
        console.error(`Error while adding ${filename} as a router`);
        throw e;
    }
})

app.use('/', require('./src/services/Uncategorized/index'));

app.use((req, res) => {
    res.status(404).send(`<style>body { font-family: Arial, Helvetica, sans-serif; }</style><h1>HTTP ERROR ${res.statusCode}</h1>&emsp;<pre>Not Found</pre>`);
})

app.use(
    function (err: any, req: Request, res: Response, next: NextFunction) {
        console.error(err);

        if (res.headersSent) {
            return;
        }

        if (err instanceof ApiError) {
            return err.apply(res);
        }

        if (err instanceof HttpError) {
            return next(err);
        }

        res.status(500).send(`
            <style>body { font-family: Arial, Helvetica, sans-serif; }</style>
            <h1>HTTP ERROR ${res.statusCode}</h1>
            &emsp;<pre>${statuses.message[res.statusCode]}</pre>
        `)
    }
)

var server = https.createServer({
    /* key,
     cert*/
}, app);

server.listen(process.env.PORT || packageFile.config.port, function () {
    console.log(`[${`API`.cyan}]`, 'Listening on port', packageFile.config.port);
})

process.on('uncaughtException', (error) => console.error(error))

websocketHandler(server);
require('./src/udp/ping');
