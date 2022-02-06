import { BRShop, timeline, pastSeasons } from './structs/types';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';



interface clientToken {
    access_token: string,
    expires_in: number,
    expires_at: Date,
    token_type: string,
    client_id: string,
    internal_client: boolean,
    client_service: string,
}

var catalog: BRShop | undefined = undefined;
var client_token: clientToken | undefined = undefined;
var client_events: timeline.Calendar['channels']['client-events'] | undefined = undefined;
var keychain: { expire: Date, data: string[] } = { data: [''], expire: new Date(0) };

export async function getClientToken() {
    var isInvalid =
        !client_token ||
        !client_token.access_token ||
        new Date(client_token.expires_at).getTime() <= Date.now() ||
        (await
            axios.head(
                'https://account-public-service-prod.ak.epicgames.com/account/api/oauth/verify',
                {
                    headers: {
                        'authorization': `bearer ${client_token.access_token}`
                    },
                    validateStatus: undefined,
                    timeout: 50000
                }
            )
        ).status != 200


    if (isInvalid) {
        const request = await axios.post<clientToken>('https://account-public-service-prod.ak.epicgames.com/account/api/oauth/token', 'grant_type=client_credentials', {
            auth: {
                username: 'ec684b8c687f479fadea3cb2ad83f5c6',
                password: 'e1f31c211f28413186262d37a13fc84d'
            },
            validateStatus: undefined
        })

        if (request.status === 200) {
            client_token = request.data;
        }
    }

    return client_token;
}

async function updateKeychain() {
    const request = await axios.get<string[]>('https://api.nitestats.com/v1/epic/keychain', { validateStatus: undefined });
    if (request.status != 200) {
        return console.warn('Failed to update keychain');
    }

    keychain.data = request.
}

export async function getKeychain() {
    if (!keychain || keychain.expire.getTime() <= Date.now()) {
        
    }

    return catalog;
}

export async function getCatalog() {
    if (!catalog || new Date(catalog.expiration).getTime() <= Date.now()) {
        const request = await axios.get('https://api.nitestats.com/v1/epic/store', { validateStatus: undefined });
        if (request.status == 200) {
            catalog = request.data;
        }
    }

    return catalog;
}

async function checkClientEvents() {
    if (!client_events || new Date(client_events.cacheExpire).getTime() <= Date.now()) {
        const request = await axios.get<timeline.Calendar>('https://api.nitestats.com/v1/epic/modes-smart', { validateStatus: undefined });
        if (request.status == 200) {
            client_events = request.data.channels['client-events'];
        }
    }
}

export async function getLastestSeason() {
    await checkClientEvents();
    return client_events?.states.find(x => x.state.seasonNumber != undefined)?.state.seasonNumber || 1;
}

interface season {
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
            var lastest = await getLastestSeason();

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