import * as express from 'express';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import * as fs from 'fs';
import errors from './src/structs/errors';
import * as statuses from 'statuses'
import {} from './src/structs/types'

const packageFile = require('./package.json');
const crypto = require('crypto')

require('./src/structs/polyfill');

require('dotenv').config()

const app = express();

app.set('etag', false)
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
    if (!filename.endsWith('.js'))
        return;

    const servicename = filename.replace(".js", "");

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
    res.status(404).send(`<h1>HTTP ERROR ${res.statusCode}</h1> <pre>Not Fund</pre>`);
})

app.use(
    function (err: any, req: Request, res: Response, next: NextFunction) {
        console.error(err);

        if (res.headersSent) {
            return;
        }

        const statusCode: number = typeof err.status == 'number' ? err.status : 500;

        res.status(statusCode).send(`
            <h1>HTTP ERROR ${res.statusCode}</h1>
            <pre>${statuses.message[res.statusCode]}</pre>
        `)
    }
)

require('colors');



app.httpServer = app.listen(packageFile.config.port, function () {
    // @ts-ignore
    console.log(`[${`API`.cyan}]`, 'Listening on port', app.httpServer.address().port);
})

process.on('uncaughtException', (error) => console.error(error))

require('./src/tcp/xmpp');
require('./src/websocket')(app)
require('./src/udp/ping');
