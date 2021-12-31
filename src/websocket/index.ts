import { Server, VerifyClientCallbackAsync, WebSocket } from 'ws'
import { Application } from 'express-serve-static-core'
import * as fs from 'fs';
import * as path from 'path';
import { } from '../structs/types'
import { IncomingMessage } from 'http';


interface service {
    service: string;
    verifyClient: VerifyClientCallbackAsync;
    onConnection: (ws: WebSocket, req: IncomingMessage) => void
}

const base_path = __dirname;

const services: service[] = fs.readdirSync(base_path).filter(
    x => fs.statSync(path.join(base_path, x)).isDirectory()
).map(ele => {
    const service: Omit<service, 'service'> | undefined = require(`./${ele}`);

    if (!service) {
        return undefined;
    }
    return {
        service: ele,
        verifyClient: service.verifyClient,
        onConnection: service.onConnection
    }
})

export default function (app: Application) {
    const server = new Server({
        server: app.httpServer,
        verifyClient: function (info, result) {
            const scheme = info.secure ? 'https' : 'http';
            const path_parts = new URL(info.req.url, `${scheme}://${info.req.headers.host}`).pathname.split('/');
            path_parts.shift();
            const serviceName = path_parts.shift();

            const service = services.find(x => x.service == serviceName);

            if (!service) {
                return result(false, 501);
            }

            return service.verifyClient.apply(this, arguments)
        }
    });

    server.on('connection', function (ws, req) {
        const path_parts = new URL(req.url, `https://${req.headers.host}`).pathname.split('/');
        path_parts.shift();
        const serviceName = path_parts.shift();

        const service = services.find(x => x.service == serviceName);

        if (!service) {
            return ws.close();
        }

        return service.onConnection.apply(this, arguments);
    })
}