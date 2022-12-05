import { Request, Response, NextFunction } from 'express-serve-static-core';
import errors from '../structs/errors';
import { Middlewares } from '../structs/types';


const rUserAgent = new RegExp('(.*)/(.*)-CL-(\\d+) (\\w+)/.*');
const rBuild = /(.*)-CL-(\d+)/;

/* possible values 
    User-Agent: game=FortniteGame, engine=UE4, version=2870186
    User-Agent: game=Fortnite, engine=UE4, version=4.12.0-2870186+++Fortnite+Release-Live
    User-Agent: game=Fortnite, engine=UE4, build=++Fortnite+Release-Live-CL-3724489
*/
const rOldUserAgent = /game=(.*), engine=.*, (?:version|build)=(.*)/;
const rNetCL = /(\d{7,8})/;

/**
 * 
 * @param buildVersion build version  
 * @example buildVersion: "+Fortnite+Release-19.30-CL-18948597-Windows"
 */
export function parseBuild(buildVersion: string): Middlewares.fortniteReq | undefined {
    var buildData = rBuild.exec(buildVersion);

    if (!buildData) {
        return undefined;
    }

    let friendlyVersion = <string>(buildData[1].split('-').pop());
    let seasonStr = friendlyVersion.split('.').shift();

    let season = seasonStr ? parseInt(seasonStr) : 1
    let cl = parseInt(buildData[2]);

    if (isNaN(season) || isNaN(cl)) {
        return undefined;
    }

    return {
        game: "Fortnite",
        build: buildData[1],
        CL: cl,
        season: season,
        friendlyVersion: friendlyVersion,
    }
}

export function parseUA(userAgent: string): Middlewares.fortniteReq | undefined {

    const isNewUA = rUserAgent.test(userAgent);
    const oldMath = rOldUserAgent.test(userAgent);

    try {
        if (isNewUA) {
            var userAgentData = rUserAgent.exec(userAgent);
            if (!userAgentData || !userAgentData.at(3)) {
                throw errors.neoniteDev.internal.invalidUserAgent.with(userAgent, rUserAgent.source);
            }

            let friendlyVersion = <string>(userAgentData[2].split('-').pop());
            let seasonStr = friendlyVersion.split('.').shift();

            let season = seasonStr ? parseInt(seasonStr) : 1
            let cl = parseInt(userAgentData[3]);

            if (isNaN(season) || isNaN(cl)) {
                throw errors.neoniteDev.internal.invalidUserAgent.with(userAgent, rUserAgent.source);
            }

            return {
                game: userAgentData[1],
                build: userAgentData[2],
                CL: cl,
                season: season,
                friendlyVersion: friendlyVersion,
                platform: userAgentData[4],
            }
        } else if (oldMath) {
            var userAgentData = rOldUserAgent.exec(userAgent);

            if (!userAgentData) {
                throw errors.neoniteDev.internal.invalidUserAgent.with(userAgent, rOldUserAgent.source);
            }

            var build = userAgentData[2];
            var aCL = rNetCL.exec(build);

            if (!aCL) {
                throw errors.neoniteDev.internal.invalidUserAgent.with(userAgent, rOldUserAgent.source);
            }

            let CL = parseInt(aCL[1]);

            if (isNaN(CL)) {
                throw errors.neoniteDev.internal.invalidUserAgent.with(userAgent, rOldUserAgent.source);
            }

            var result: Middlewares.fortniteReq = knownBuilds.find(x => x.CL == CL) || {
                game: userAgentData.at(1),
                build: build,
                CL: CL,
                platform: userAgent.includes('android') ? 'Android' : "Windows",
                friendlyVersion: (CL < 3724489 ? 0 : CL > 3790078 ? 2 : 1).toString(),
                season: CL < 3724489 ? 0 : CL > 3790078 ? 2 : 1
            }

            return result;
        }
    } catch {  }
    
    return undefined;
}

export default function userAgentParse(bRequired: boolean) {
    return function (req: Request, res: Response, next: NextFunction) {
        const userAgent = req.headers['user-agent'];

        if (!userAgent) {
            throw errors.neoniteDev.internal.invalidUserAgent.with('null', rUserAgent.source);
        }

        var uaData = parseUA(userAgent);

        if (!uaData) {
            if (bRequired) {
                throw errors.neoniteDev.internal.invalidUserAgent.with('null', rUserAgent.source);
            } else {
                uaData = {
                    build: '++Fortnite+Release-Live-CL-3724489',
                    friendlyVersion: '1.8',
                    season: 1,
                    CL: 3724489
                }
            }
        }

        req.clientInfos = uaData;

        next();
    }
}



var knownBuilds: Middlewares.fortniteReq[] = [
    {
        build: '++Fortnite+Release-Live-CL-2870186',
        friendlyVersion: 'OT6.5',
        season: 0,
        CL: 2870186,
        game: 'Fortnite',
        platform: 'Windows'
    },
    {
        build: '++Fortnite+Cert-CL-3541083',
        friendlyVersion: '1.2',
        season: 0,
        CL: 3541083,
        game: 'Fortnite',
        platform: 'Windows'
    },
    {
        build: '++Fortnite+Release-Cert-CL-3681159',
        friendlyVersion: '1.6',
        season: 0,
        CL: 3681159,
        game: 'Fortnite',
        platform: 'Windows'
    },
    {
        build: '++Fortnite+Release-Cert-CL-3700114',
        friendlyVersion: '1.7.2',
        season: 0,
        CL: 3700114,
        game: 'Fortnite',
        platform: 'Windows'
    },
    {
        build: '++Fortnite+Release-Live-CL-3724489',
        friendlyVersion: '1.8',
        season: 1,
        CL: 3724489,
        game: 'Fortnite',
        platform: 'Windows'
    },
    {
        build: '++Fortnite+Release-Live-CL-3757339',
        friendlyVersion: '1.9',
        season: 1,
        CL: 3757339,
        game: 'Fortnite',
        platform: 'Windows'
    },
    {
        build: '++Fortnite+Release-Cert-CL-3775276',
        friendlyVersion: '1.9.1',
        season: 1,
        CL: 3775276,
        game: 'Fortnite',
        platform: 'Windows'
    },
    {
        build: '++Fortnite+Release-Cert-CL-3785438',
        friendlyVersion: '1.9',
        season: 1,
        CL: 3785438,
        game: 'Fortnite',
        platform: 'Windows'
    },
    {
        build: '++Fortnite+Release-Cert-CL-3807424',
        friendlyVersion: '1.11',
        season: 2,
        CL: 3807424,
        game: 'Fortnite',
        platform: 'Windows'
    },
    {
        build: '++Fortnite+Release-Cert-CL-3825894',
        friendlyVersion: '2.1',
        season: 2,
        CL: 3825894,
        game: 'Fortnite',
        platform: 'Windows'
    }
]