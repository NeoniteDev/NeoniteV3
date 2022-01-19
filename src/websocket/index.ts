import { Server, VerifyClientCallbackAsync, VerifyClientCallbackSync, WebSocket } from 'ws'
import { Application } from 'express-serve-static-core'
import * as fs from 'fs';
import * as path from 'path';
import { } from '../structs/types'
import { IncomingMessage } from 'http';
import * as https from 'http'


interface service {
    service: string;
    verifyClient:  VerifyClientCallbackAsync | VerifyClientCallbackSync | undefined;
    onConnection: (ws: WebSocket, req: IncomingMessage) => void
}

const base_path = __dirname;

// @ts-ignore
const services: service[] = fs.readdirSync(base_path).filter(
    x => fs.statSync(path.join(base_path, x)).isDirectory()
).map((ele) => {
    const service: Omit<service, 'service'> | undefined = require(`./${ele}`);

    if (!service) {
        return undefined;
    }

    const handle: service = {
        service: ele,
        verifyClient: service.verifyClient,
        onConnection: service.onConnection
    }

    return handle;
}).filter(x => x != undefined);

export default function (httpsServer: https.Server) {
    const server = new Server({
        server: httpsServer,
        verifyClient: function (info, result) {
            if (!info.req.url) {
                return result(false, 400, 'bad request');
            }

            const scheme = info.secure ? 'https' : 'http';
            const path_parts = new URL(info.req.url, `${scheme}://${info.req.headers.host}`).pathname.split('/');
            path_parts.shift();
            const serviceName = path_parts.shift();

            const service = services.find(x => x.service == serviceName);

            if (!service) {
                return result(false, 501);
            }

            if (!service.verifyClient) {
                return result(true);
            }

            // @ts-ignore
            return service.verifyClient.apply(this, arguments)
        }
    });

    server.on('connection', function (ws, req) {
        if (!req.url) {
            return ws.close();
        }

        const path_parts = new URL(req.url, `https://${req.headers.host}`).pathname.split('/');
        path_parts.shift();
        const serviceName = path_parts.shift();

        const service = services.find(x => x.service == serviceName);

        if (!service) {
            return ws.close();
        }

        // @ts-ignore
        return service.onConnection.apply(this, arguments);
    })
}