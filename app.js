const express = require('express');
const fs = require('fs');
const { neoniteDev, default: errors } = require('./src/structs/errors');
const package = require('./package.json');
const statuses = require('statuses')
const crypto = require('crypto')

require('colors')

require('./src/structs/polyfill');

require('dotenv').config()

const app = express();

app.set('etag', false)
app.disable('x-powered-by');

app.use(express.static('resources/public'));

app.use((req, res, next) => {
    // URL Rewriting
    if (req.path == '/logout' && 'path' in req.query) {
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

    next()
});


/**
 * @typedef {import("./src/structs/types").Layer} Layer
 */

fs.readdirSync('./src/services').forEach(filename => {
    const servicename = filename.replace(".js", "");
    if (!filename.endsWith('.js'))
        return;

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
    res.status(404).send(`<h1>HTTP ERROR ${res.statusCode}</h1> <pre>${statuses[res.statusCode]}</pre>`);
})

app.use(/**
    * @param {any} err
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {express.NextFunction} next
    */
    function (err, req, res, next) {
        if (res.headersSent) {
            return;
        }
        console.log(err)
        res.status(err.status || 500).send(`<h1>HTTP ERROR ${res.statusCode}</h1> <pre>${statuses[res.statusCode]}</pre>`)
    }
)

app.httpServer = app.listen(package.config.port, function () {
    console.log(`[${`API`.cyan}] `, 'Listening on port', app.httpServer.address().port);
})

process.on('uncaughtException', (error) => console.error(error))

require('./src/websocket')(app)
require('./src/udp/ping');
// require('./src/tcp/xmpp');