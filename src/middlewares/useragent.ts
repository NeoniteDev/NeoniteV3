import { Request, Response, NextFunction } from 'express-serve-static-core';
import errors from '../structs/errors';


const regexp = '(.*)/(.*)-CL-(\\d+) (\\w+)/.*';
const regexp2 = 'game=(.*), engine=UE4, build=(.*)-CL-(\\d+)';

export default function userAgentParse(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers["user-agent"];

    if (!userAgent) {
        throw errors.neoniteDev.internal.invalidUserAgent.with('null', regexp);
    }

    const newmatch = userAgent.match(regexp);
    const oldmatch = userAgent.match(regexp2);

    if (newmatch == undefined && oldmatch == null) {
        throw errors.neoniteDev.internal.invalidUserAgent.with(userAgent, regexp);
    }

    if (newmatch) {
        let friendlyVersion = <string>(newmatch[2].split('-').pop());
        // @ts-ignore
        let season = parseInt(friendlyVersion.split('.').pop());

        req.clientInfos = {
            game: newmatch.at(1),
            version: newmatch.at(2),
            CL: newmatch.at(3),
            platform: newmatch.at(4),
            friendlyVersion: friendlyVersion,
            season: season
        }
    } else if (oldmatch) {
        let friendlyVersion = <string>(oldmatch[2].split('-').pop());
        // @ts-ignore
        let season = parseInt(friendlyVersion.split('.').pop());

        req.clientInfos = {
            game: oldmatch.at(1),
            version: oldmatch.at(2),
            CL: oldmatch.at(3),
            platform: "Windows",
            friendlyVersion: friendlyVersion,
            season: !isNaN(season) ? season : 1
        }
    }

    next();
}

