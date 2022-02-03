import * as express from 'express';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import * as fs from 'fs';
import errors, { ApiError } from './src/structs/errors';
import * as statuses from 'statuses'
import {} from './src/structs/types'
import * as https from 'http'
import * as dotenv from 'dotenv'
import * as path from 'path'
import websocketHandler from './src/websocket'
import { } from 'colors'
require('colors');
import { HttpError } from 'http-errors';

const packageFile = require('./package.json');
require('./src/structs/polyfill');
dotenv.config();

const app = express();

app.set('etag', false);
app.disable('x-powered-by');

app.use(express.static('resources/public'));

app.use((req, res, next) => {
    // URL Rewriting
    if (req.path == '/logout' && typeof req.query.path == 'string') {
        req.url = req.query.path;
    }

    if (req.headers.accept && !req.headers.accept.includes('*/*')) {
        let oldSend = res.send;

        res.send = function (data) {
            res.send = oldSend;

            const content_type = this.get('content-type');

            if (!req.accepts(content_type)) {
                errors.neoniteDev.basic.notAcceptable.apply(res);
                return this;
            } else {
                return res.send(data);
            }
        }
    }

    res.setTimeout(10000, function () {
        errors.neoniteDev.internal.requestTimedOut.apply(res);
    })

    next();
});

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
    res.status(404).send(`<h1>HTTP ERROR ${res.statusCode}</h1>&emsp;<pre>Not Found</pre>`);
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
            <h1>HTTP ERROR ${res.statusCode}</h1>
            &emsp;<pre>${statuses.message[res.statusCode]}</pre>
        `)
    }
)

var server = https.createServer({
   /* key,
    cert*/
}, app);

server.listen(packageFile.config.port, function () {
    console.log(`[${`API`.cyan}]`, 'Listening on port', packageFile.config.port);
})

process.on('uncaughtException', (error) => console.error(error))

websocketHandler(server);
require('./src/udp/ping');
