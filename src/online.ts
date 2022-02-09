import { BRShop, timeline, pastSeasons, CloudstorageFile } from './structs/types';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { newClientSession, session } from './structs/EpicSession';
import CachedItem from './structs/cachedItem';
import * as nodeCache from 'node-cache'
import { ConfigIniParser as iniparser } from 'config-ini-parser';

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

        cache.set('keychain', response.data, 120);
        return response.data;
    }

    return result;
}

export async function getCatalog() {
    var result = cache.get<BRShop>('catalog');

    if (!result) {
        const response = await axios.get<BRShop>(
            'https://api.nitestats.com/v1/epic/store',
            {
                timeout: 2500,
                validateStatus: undefined
            }
        );

        cache.set('catalog', response.data, Math.round(response.data.expiration.getTime() - Date.now()) / 1000);
        return response.data;
    }

    return result;
}

export async function getTimeline() {
    var result = cache.get<timeline.Calendar>('timeline');

    if (!result) {
        const response = await axios.get<timeline.Calendar>(
            'https://api.nitestats.com/v1/epic/modes-smart',
            {
                timeout: 2500,
                validateStatus: undefined
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
        cache.set('langIni', languageIni, 3600);
        return languageIni;
    }

    return cached;
}

export async function getCurrentSeasonNum() {
    const timeline = await getTimeline();
    return timeline.channels['client-events'].states.find(x => x.state.seasonNumber)?.state.seasonNumber || 19;
}

export interface season {
    "season": number,
    "chapter": number,
    "seasonInChapter": number,
    "displayName": string,
    "startDate": string,
    "endDate": string
}

var past_seasons: season[] = JSON.parse(
    fs.readFileSync(
        path.join(
            __dirname,
            '../resources/seasons.json'
        ),
        'utf-8'
    )
);

export async function getPastSeasons(season?: number) {
    if (season && process.env.fortniteApiIoKey) {
        const exist = past_seasons.find(x => x.season == season);

        if (!exist) {
            var lastest = await getCurrentSeasonNum();

            if (season > lastest) {
                return past_seasons;
            }
        }

        const response = await axios.get<pastSeasons>('https://fortniteapi.io/v1/seasons/list?lang=en', {
            headers: {
                'authorization': process.env.fortniteApiIoKey
            },
            validateStatus: undefined
        });

        if (response.data.result) {

        }
    }

    return past_seasons;
}