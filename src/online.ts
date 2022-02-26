import { BRShop, timeline, pastSeasons, CloudstorageFile, Middlewares } from './structs/types';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { newClientSession, session } from './structs/EpicSession';
import CachedItem from './structs/cachedItem';
import * as nodeCache from 'node-cache'
import { ConfigIniParser as iniparser } from 'config-ini-parser';
import { content, launcherService } from './types/responses';
import { parseBuild } from './middlewares/useragent';

const cache = new nodeCache(
    {
        deleteOnExpire: true
    }
);

export async function getClientSession() {
    var result = cache.get<session>('client_session');

    if (!result || !result.isExpired()) {
        var session = await newClientSession('ec684b8c687f479fadea3cb2ad83f5c6', 'e1f31c211f28413186262d37a13fc84d');

        cache.set('client_session', session, Math.round(session.expires.getTime() - Date.now()) / 1000);
        return session;
    }

    return result;
};

export async function getKeychain() {
    var result = cache.get<string[]>('keychain');

    if (!result) {
        const response = await axios.get<string[]>('https://api.nitestats.com/v1/epic/keychain',
            {
                timeout: 2500,
                validateStatus: undefined
            }
        );

        if (response.status == 200) {
            cache.set('keychain', response.data, 120);
            return response.data;
        }
    }

    return result;
}

export async function getCatalog() {
    var result = cache.get<BRShop>('catalog');

    if (!result) {
        const response = await axios.get<BRShop>(
            'https://api.nitestats.com/v1/epic/store',
            {
                timeout: 4500,
                validateStatus: undefined
            }
        );


        if (response.status == 200) {
            var expiration = new Date(response.data.expiration)
            cache.set('catalog', response.data, Math.round(expiration.getTime() - Date.now()) / 1000);
            return response.data;
        }
    }

    return result;
}

export async function getContent(): Promise<content.Root> {
    var result = cache.get<content.Root>('content');

    if (!result) {
        const response = await axios.get<content.Root>(
            'https://fortnitecontent-website-prod.ak.epicgames.com/content/api/pages/fortnite-game',
            {
                timeout: 4500
            }
        );

        if (response.status == 200) {
            cache.set('content', response.data, 86400);
            return response.data;
        } else {
            return {

            }
        }
    }

    return result;
}

export async function getTimeline() {
    var result = cache.get<timeline.Calendar>('timeline');

    if (!result) {
        const response = await axios.get<timeline.Calendar>(
            'https://api.nitestats.com/v1/epic/modes-smart',
            {
                timeout: 2500
            }
        );

        cache.set('timeline', response.data, response.data.cacheIntervalMins / 60);
        return response.data;
    }

    return result;
}


export async function getLanguageIni() {
    var cached = cache.get<string>('langIni');

    if (!cached) {
        const client_token = await getClientSession();

        if (!client_token) {
            return '';
        }

        const config = {
            headers: { Authorization: `Bearer ${client_token.access_token}` },
            validateStatus: () => true
        }

        // TODO: move to online.js
        const req_hotfixes = await axios.get('https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/cloudstorage/system/', config);

        if (req_hotfixes.status !== 200) {
            return '';
        }

        const Hotfixes: CloudstorageFile[] = req_hotfixes.data;

        const gamesInis = Hotfixes.filter(x => x.filename.toLowerCase().endsWith('defaultgame.ini') && x.length > 0);
        var result = [
            `[/Script/FortniteGame.FortTextHotfixConfig]`
        ]

        Promise.all(
            gamesInis.map(async (file, index, array) => {
                const ini_request = await axios.get(`https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/cloudstorage/system/${file.uniqueFilename}`, config);
                if (ini_request.status != 200) { return; }

                const parser = new iniparser();
                parser.parse(ini_request.data);

                const bHaveSection = parser.isHaveSection('/Script/FortniteGame.FortTextHotfixConfig');

                if (bHaveSection) {
                    const items = parser.items('/Script/FortniteGame.FortTextHotfixConfig');
                    result = result.concat(items.map(([name, content]) => `${name}=${content}`))
                }
            })
        );


        var languageIni = result.join('\n');
        cache.set('langIni', languageIni, 3600); // 1h
        return languageIni;
    }

    return cached;
}

export async function getStwWorld() {
    var cached = cache.get<any>('stwWorld');

    if (!cached) {
        const client_token = await getClientSession();

        if (!client_token) {
            return {};
        }

        const config = {
            headers: {
                Authorization: `Bearer ${client_token.access_token}`
            }
        }

        // TODO: move to online.js
        const response = await axios.get('https://fortnite-public-service-prod.ak.epicgames.com/fortnite/api/game/v2/world/info', config);

        cache.set('stwWorld', response.data, 86400);

        return response.data;
    }

    return cache.get('stwWorld')
}

export async function getBuildToken() {
    var clientSession = await getClientSession();

    const response = await axios.get<launcherService.downloadInfosV2.RootObject>(
        'https://launcher-public-service-prod06.ol.epicgames.com/launcher/api/public/assets/v2/platform/Windows/namespace/fn/catalogItem/4fe75bbc5a674f4f9b356b5c90567da5/app/Fortnite/label/Live',
        {
            headers: {
                Authorization: `${clientSession.data.token_type} ${clientSession.access_token}`
            }
        }
    );

    return response.data;
}

export async function getLastest(): Promise<Middlewares.fortniteReq> {
    var cached = cache.get<Middlewares.fortniteReq>('lastest');

    if (!cached) {
        var downloadInfos = await getBuildToken();

        var buildVersion = downloadInfos.elements[0].buildVersion;

        var parsedBuild = parseBuild(buildVersion);

        if (!parsedBuild) {
            throw new Error('Failed to parse build ' + buildVersion);
        }

        cache.set('lastest', parsedBuild, 86400);
        return parsedBuild;
    }

    return cached;
}

export interface season {
    "season": number,
    "chapter": number,
    "seasonInChapter": number,
    "displayName": string,
    "startDate": string,
    "endDate": string
}

const pastSeasonsPath = path.join(
    __dirname,
    '../resources/seasons.json'
)

var past_seasons: season[] = JSON.parse(
    fs.readFileSync(
        pastSeasonsPath, 'utf-8'
    )
);

export async function getPastSeasons(season?: number) {
    if (season && process.env.fortniteApiIoKey) {
        const exist = past_seasons.find(x => x.season == season);

        if (!exist) {
            var lastest = await getLastest();

            if (season <= lastest.season) {
                const response = await axios.get<pastSeasons>('https://fortniteapi.io/v1/seasons/list?lang=en', {
                    headers: {
                        'authorization': process.env.fortniteApiIoKey
                    },
                    validateStatus: undefined
                });

                if (response.status == 200 && response.data.result) {
                    past_seasons = response.data.seasons.map(x => {
                        return {
                            "season": x.season,
                            "chapter": x.chapter,
                            "seasonInChapter": x.seasonInChapter,
                            "displayName": x.displayName,
                            "startDate": new Date(x.startDate).toISOString(),
                            "endDate": new Date(x.endDate).toISOString()
                        }
                    })

                    fs.writeFile(pastSeasonsPath, JSON.stringify(past_seasons),
                        (err) => {
                            if (err) console.error(err)
                        }
                    );
                }
            }
        }
    }

    return past_seasons;
}