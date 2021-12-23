const { Server } = require('ws');
const { Application } = require('express');
const fs = require('fs')

const path = require('path')

const services = [];

const base_path = __dirname;

fs.readdirSync(base_path).forEach(ele => {
    var stats = fs.statSync(path.join(base_path, ele))
    if (stats.isDirectory()) {
        services.push(ele)
    }
})

/**
 * @typedef {import('./../structs/types')}
 * 
 * @param {Application} app
 */
module.exports = (app) => {
    const server = new Server({
        server: app.httpServer,
        verifyClient: function (info, result) {
            const service = info.req.url.split('?').shift().replace('/', '').split('/').shift()

            if (!service || !services.includes(service)) {
                return result(false, 501);
            }

            return require('./' + service).VerifyClient(info, result);
        }
    });

    server.on('connection', function (ws, req) {
        const service = req.url.split('?').shift().replace('/', '').split('/').shift()

        if (!service || !services.includes(service)) {
            return ws.close();
        }

        return require('./' + service).onConnection(ws, req);
    })
}