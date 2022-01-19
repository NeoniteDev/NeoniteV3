import * as express from 'express';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import * as crypto from 'crypto';
import * as Path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import { ConfigIniParser as iniparser } from 'config-ini-parser';
import validateMethod from '../middlewares/Method';
import * as cookieParser from 'cookie-parser';
import * as multiparty from 'multiparty';
import { CheckAuthorization, CheckClientAuthorization } from '../middlewares/authorization';
import errors, { ApiError, neoniteDev } from '../structs/errors';
import * as online from '../online';
import { timeline, CloudstorageFile } from '../structs/types';
import validateUa from '../middlewares/useragent';
import profiles from '../mcp';
import { HttpError } from 'http-errors'

const app = express.Router();

const hotfixPath = Path.join(__dirname, '../../cloudstorage/system');
const settingsPath = Path.join(__dirname, '../../saved');

app.use(express.json());

app.use(validateUa);
app.use(profiles)


/**
 * @typedef {import('./../structs/types').Saved_Profile} Saved_Profile
 * @typedef {import('./../structs/types').Cosmetic} Cosmetic
 * @typedef {import('./../structs/types').CosmeticVariant} CosmeticVariant
 * @typedef {import('./../structs/types').Calendar} Calendar
 * @typedef {import('./../structs/types').CloudstorageFile} CloudstorageFile
 * @typedef {import('./../structs/types').BRShop} BRShop
 */


/*
* Dynamic Cloudstorage Implementation: @VastBlastt
*/

app.get('/api/cloudstorage/system/config', CheckClientAuthorization, async (req, res) => {
    res.json(
        {
            lastUpdated: '2021-11-12T19:33:50.152Z',
            disableV2: false,
            isAuthenticated: req.auth.in_app_id != undefined,
            enumerateFilesPath: '/api/cloudstorage/system',
            transports: {
                McpProxyTransport: {
                    name: 'McpProxyTransport',
                    type: 'ProxyStreamingFile',
                    appName: 'fortnite',
                    isEnabled: true,
                    isRequired: false,
                    isPrimary: false,
                    timeoutSeconds: 30,
                    priority: 10
                },
                McpSignatoryTransport: {
                    name: 'McpSignatoryTransport',
                    type: 'ProxySignatory',
                    appName: 'fortnite',
                    isEnabled: true,
                    isRequired: false,
                    isPrimary: false,
                    timeoutSeconds: 30,
                    priority: 20
                },
                DssDirectTransport: {
                    name: 'DssDirectTransport',
                    type: 'DirectDss',
                    appName: 'fortnite',
                    isEnabled: false,
                    isRequired: false,
                    isPrimary: false,
                    timeoutSeconds: 30,
                    priority: 30
                }
            }
        }
    );
});

app.get('/api/cloudstorage/system', CheckClientAuthorization, async (req, res) => {
    const output = [
        {
            'uniqueFilename': 'LanguagePatches.ini',
            'filename': 'DefaultGame.ini',
            'hash': 'test',
            'hash256': 'test',
            'length': 1,
            'contentType': 'text/plain',
            'uploaded': '2021-06-25T20:21:22.001Z',
            'storageType': 'S3',
            'doNotCache': true
        }
    ];

    const dir = await fs.promises.opendir(hotfixPath);

    for await (const dirent of dir) {
        const fileName = dirent.name;
        const filePath = Path.join(hotfixPath, fileName);
        const fileData = fs.readFileSync(filePath);
        if (!fileName.endsWith('.ini')) {
            return;
        }

        output.push({
            'uniqueFilename': fileName,
            'filename': fileName,
            'hash': crypto.createHash('sha1').update(fileData).digest('hex'),
            'hash256': crypto.createHash('sha256').update(fileData).digest('hex'),
            'length': fileData.length,
            'contentType': 'text/plain',
            'uploaded': fs.statSync(filePath).mtime.toUTCString(),
            'storageType': 'S3',
            'doNotCache': true
        });
    }

    res.json(output);
});

const sectionName = '/Script/FortniteGame.FortTextHotfixConfig';
app.get('/api/cloudstorage/system/LanguagePatches.ini', CheckClientAuthorization, async (req, res) => {

    const client_token = await online.getClientToken();

    if (!client_token) {
        return res.status(503)
    }

    const config = {
        headers: { Authorization: `Bearer ${client_token.access_token}` },
        validateStatus: () => true
    }

    // TODO: move to online.js
    const req_hotfixes = await axios.get('https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/cloudstorage/system/', config);

    if (req_hotfixes.status !== 200) {
        return res.status(502).end();
    }

    const Hotfixes: CloudstorageFile[] = req_hotfixes.data;

    const gamesInis = Hotfixes.filter(x => x.filename.toLowerCase().endsWith('defaultgame.ini'));

    var result = [
        `[${sectionName}]`
    ]

    var proceeded = 0;

    gamesInis.forEach(async (file, index, array) => {
        const ini_request = await axios.get(`https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/cloudstorage/system/${file.uniqueFilename}`, config);
        if (ini_request.status != 200) { return; }

        const parser = new iniparser();
        parser.parse(ini_request.data);

        const bHaveSection = parser.isHaveSection(sectionName);


        if (bHaveSection) {
            const items = parser.items(sectionName);
            result = result.concat(items.map(([name, content]) => `${name}=${content}`))
        }

        proceeded++;

        if (proceeded === array.length - 1) {
            res.set('content-type', 'text/plain')
            res.send(result);
        }
    })
});

app.get('/api/cloudstorage/system/:filename', CheckClientAuthorization, (req, res) => {
    const fileName = req.params.filename;
    const filePath = Path.join(hotfixPath, fileName);

    if (Path.parse(filePath).dir != hotfixPath || !fileName.endsWith('.ini')) {
        throw neoniteDev.cloudstorage.fileNotFound.withMessage(`Couldn't find a system file for ${fileName}`).with(fileName);
    }

    if (fs.existsSync(filePath)) {
        const s_content = fs.readFileSync(filePath, 'utf-8')
        res.set('content-type', 'text/plain')
        return res.send(s_content);
    } else {
        throw neoniteDev.cloudstorage.fileNotFound.withMessage(`Couldn't find a system file for ${fileName}`).with(fileName);
    }
});

/**
 * Thanks to @link https://github.com/GMatrixGames for ClientSettings.Sav saving
 */
app.get('/api/cloudstorage/user/:accountId', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw neoniteDev.authentication.notYourAccount;
    }

    const dirPath = Path.join(settingsPath, req.auth.account_id)

    if (!fs.existsSync(dirPath)) {
        return res.json([])
    }

    const files = fs.readdirSync(dirPath);

    res.json(files
        .filter(x => x.split('-').pop()?.replace('.Sav', '') == req.clientInfos.CL)
        .map((file) => {
            const fileName = file.split('-').shift() + '.Sav';
            const filePath = Path.join(dirPath, file)
            const fileData = fs.readFileSync(filePath);

            return {
                uniqueFilename: fileName,
                filename: fileName,
                hash: crypto.createHash('sha1').update(fileData).digest('hex'),
                hash256: crypto.createHash('sha256').update(fileData).digest('hex'),
                length: fileData.length,
                contentType: 'application/octet-stream',
                uploaded: fs.statSync(filePath).mtime,
                storageType: 'S3',
                accountId: req.auth.account_id,
                doNotCache: true
            }
        })
    )
});

app.get('/api/game/v2/friendcodes/:accountId/epic', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.in_app_id) {
        throw neoniteDev.authentication.notYourAccount;
    }

    res.json([])
})

app.get('/api/cloudstorage/user/:accountId/:filename', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.in_app_id) {
        throw neoniteDev.authentication.notYourAccount;
    }

    var dirPath = Path.join(settingsPath, req.auth.in_app_id)

    if (Path.parse(dirPath).dir != settingsPath || !fs.existsSync(dirPath)) {
        throw neoniteDev.cloudstorage.fileNotFound
            .withMessage(`Sorry, we couldn't find a user file for ${req.params.filename}`)
            .with(req.params.filename)
    }

    var filePath = Path.join(dirPath, `${req.params.filename.replace(/.Sav$/i, '')}-${req.clientInfos.CL}.Sav`)

    if (Path.parse(filePath).dir !== dirPath || !fs.existsSync(filePath)) {
        throw neoniteDev.cloudstorage.fileNotFound
            .withMessage(`Sorry, we couldn't find a user file for ${req.params.filename}`)
            .with(req.params.filename)
    }

    res.set('content-type', 'application/octet-stream')
    res.sendFile(filePath);
});

app.put('/api/cloudstorage/user/:accountId/:filename', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw neoniteDev.authentication.notYourAccount;
    }

    var dirPath = Path.join(settingsPath, req.auth.account_id);
    var filePath = Path.join(dirPath, `${req.params.filename.split('.').shift()}-${req.clientInfos.CL}.Sav`);
    const arrayBuffer: Array<any> = [];

    req.on('data', function (chunk) {
        arrayBuffer.push(Buffer.from(chunk, 'binary'))
    })

    req.on('end', function () {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath)
        }

        fs.writeFileSync(filePath, Buffer.concat(arrayBuffer), 'binary');

        res.status(204).end();
    });
});

app.post('/api/game/v2/creative/discovery/surface/:accountId', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw neoniteDev.authentication.notYourAccount;
    }

    res.json({});
})

app.get('/api/receipts/v1/account/:accountId/receipts', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw neoniteDev.authentication.notYourAccount;
    }

    res.json([]);
});

app.get('/api/storefront/v2/catalog', CheckAuthorization, async (req, res) => {
    const catalog = await online.getCatalog();

    if (!catalog || req.clientInfos.season < 4) {
        return res.json({
            'refreshIntervalHrs': 24,
            'dailyPurchaseHrs': 24,
            'expiration': new Date().addHours(24),
            'storefronts': [
                {
                    'name': 'BRDailyStorefront',
                    'catalogEntries': []
                },
                {
                    'name': 'BRWeeklyStorefront',
                    'catalogEntries': []
                }
            ]
        });
    }

    res.json(catalog);
})

app.get('/api/storefront/v2/gift/check_eligibility/recipient/:recipient/offer/:offerId', CheckAuthorization, async (req, res, next) => {
    const catalog = await online.getCatalog();

    if (!catalog) {
        return next(
            neoniteDev.shop.itemNotFound.with(req.params.offerId)
        )
    }

    const offer = catalog.storefronts.find(x =>
        x.catalogEntries.some(x => x.offerId == req.params.offerId)
    )?.catalogEntries.find(x => x.offerId == req.params.offerId)

    if (offer == undefined) {
        return next(
            neoniteDev.shop.itemNotFound.with(req.params.offerId)
        )
    }

    if (req.params.recipient == req.auth.in_app_id) {
        return next(
            neoniteDev.friends.selfFriend.with(req.auth.in_app_id)
        )
    }

    switch (offer.offerType) {
        case 'DynamicBundle': {
            var regularPrice = 0;

            offer.dynamicBundleInfo?.bundleItems.forEach(item => regularPrice += item.regularPrice);

            // TODO: handle alreadyOwnedPriceReduction

            var finalPrice = regularPrice + (offer.dynamicBundleInfo?.floorPrice || 0);

            res.json({
                price: {
                    currencyType: 'MtxCurrency',
                    currencySubType: '',
                    regularPrice: regularPrice,
                    dynamicRegularPrice: regularPrice,
                    finalPrice: finalPrice,
                    saleExpiration: '9999-12-31T23:59:59.999Z',
                    basePrice: finalPrice
                },
                items: offer.itemGrants
            })

            break;
        }

        case 'StaticPrice':
        default:
            {
                return res.json(
                    {
                        price:
                            offer.prices.find(x => x.currencyType == 'MtxCurrency') ||
                                offer.prices.at(0) ?
                                Object.assign(offer.prices.at(0), { finalPrice: 0 }) :
                                {
                                    currencyType: 'MtxCurrency',
                                    currencySubType: '',
                                    regularPrice: 0,
                                    dynamicRegularPrice: 0,
                                    finalPrice: 0,
                                    saleExpiration: '9999-12-31T23:59:59.999Z',
                                    basePrice: 0
                                },
                        items: offer.itemGrants
                    }
                );
            }
    }
})



app.get('/api/calendar/v1/timeline', CheckAuthorization, async (req, res) => {
    const offlineResponse = {
        channels: {
            'standalone-store': {},
            'client-matchmaking': {},
            'tk': {},
            'featured-islands': {},
            'community-votes': {},
            'client-events': {
                states: [
                    {
                        validFrom: new Date(),
                        activeEvents: [
                            {
                                eventType: `EventFlag.LobbySeason${req.clientInfos.season}`,
                                activeUntil: new Date().addYears(10),
                                activeSince: new Date('2017')
                            },
                            {
                                eventType: `EventFlag.Season${req.clientInfos.season}`,
                                activeUntil: new Date().addYears(10),
                                activeSince: new Date('2017')
                            }
                        ],
                        state: {
                            activeStorefronts: [],
                            eventNamedWeights: {},
                            activeEvents: [],
                            seasonNumber: req.clientInfos.season,
                            seasonTemplateId: `AthenaSeason:athenaseason${req.clientInfos.season}`,
                            matchXpBonusPoints: 0,
                            eventPunchCardTemplateId: "",
                            seasonBegin: "9999-12-31T23:59:59.999Z",
                            seasonEnd: "9999-12-31T23:59:59.999Z",
                            seasonDisplayedEnd: "9999-12-31T23:59:59.999Z",
                            weeklyStoreEnd: "9999-12-31T23:59:59.999Z",
                            stwEventStoreEnd: "9999-12-31T23:59:59.999Z",
                            stwWeeklyStoreEnd: "9999-12-31T23:59:59.999Z",
                            dailyStoreEnd: "9999-12-31T23:59:59.999Z"
                        }
                    }
                ],
                cacheExpire: new Date().addMinutes(10)
            }
        },
        cacheIntervalMins: 10,
        currentTime: new Date()
    };

    const response = await axios.get<timeline.Calendar>('https://api.nitestats.com/v1/epic/modes', { validateStatus: () => true, timeout: 5000 });

    if (response.status == 200) {
        var calandar = response.data;

        const states = calandar.channels['client-events'].states
        const state = states.find(x => x.state.seasonTemplateId != undefined) || states[0];

        if (state.state.seasonTemplateId.toLowerCase() != `AthenaSeason:athenaseason${req.clientInfos.season}`.toLowerCase()) {
            try {
                state.activeEvents.filter(x => {
                    return !x.eventType.startsWith('EventFlag.Season') || x.eventType.startsWith('EventFlag.LobbySeason')
                }).forEach(x => state.activeEvents.remove(x));

                state.activeEvents.push({
                    activeSince: new Date('2017'),
                    activeUntil: new Date().addYears(10),
                    eventType: `EventFlag.Season${req.clientInfos.season}`
                });

                states[0].activeEvents.push({
                    activeSince: new Date('2017'),
                    activeUntil: new Date().addYears(10),
                    eventType: `EventFlag.LobbySeason${req.clientInfos.season}`
                });

                states[0].state.seasonTemplateId = `AthenaSeason:athenaseason${req.clientInfos.season}`
                states[0].state.seasonNumber = req.clientInfos.season;
            } catch {
                return res.json(offlineResponse);
            }
        }

        return res.json(calandar);
    }

    res.json(offlineResponse);
})

app.get('/api/v2/versioncheck*', CheckClientAuthorization, (req, res) => {
    res.json({ 'type': 'NO_UPDATE' })
});

app.get('/api/versioncheck*', CheckClientAuthorization, (req, res) => {
    res.json({ 'type': 'NO_UPDATE' })
});

app.get('/api/game/v2/world/info', CheckClientAuthorization, (req, res) => res.json({}))

app.get('/api/game/v2/br-inventory/account/:accountId', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw neoniteDev.authentication.notYourAccount;
    }

    res.json({
        'stash': {
            'globalcash': 99999999
        }
    })
})

var validPlatforms = [
    'Windows',
    'Linux',
    'Switch',
    'Android',
    'IOS'
]

app.get('/api/game/v2/matchmakingservice/ticket/player/:accountId', cookieParser(), CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.in_app_id) {
        throw neoniteDev.authentication.notYourAccount;
    }

    if (!req.headers['user-agent']) {
        throw neoniteDev.internal.invalidUserAgent;
    }

    if (!req.query.bucketId || typeof req.query.bucketId != 'string') {
        throw neoniteDev.matchmaking.invalidBucketId;
    }

    if (!req.query.partyPlayerIds || typeof req.query.partyPlayerIds != 'string') {
        throw neoniteDev.matchmaking.invalidPartyPlayers;
    }

    if (!req.query.partyPlayerIds || typeof req.query.partyPlayerIds != 'string') {
        throw neoniteDev.matchmaking.invalidPartyPlayers;
    }

    if (!req.query['player.platform'] ||
        typeof req.query['player.platform'] != 'string' ||
        !validPlatforms.includes(req.query['player.platform'])
    ) {
        var platformValue = typeof req.query['player.platform'] == 'string' ? req.query['player.platform'] : 'null';
        throw neoniteDev.matchmaking.invalidPlatform.with(platformValue).withMessage(`Invalid platform: '${platformValue}'`);
    }

    try {
        var splitted = req.query.bucketId.split(':');
        var NetCL = splitted[0];
        var HotfixVerion = splitted[1];
        var Region = splitted[2];
        var Playlist = splitted[3];
    }
    catch {
        throw neoniteDev.matchmaking.invalidBucketId;
    }

    if (!NetCL || !Region || !Playlist || !Region) {
        throw neoniteDev.matchmaking.invalidBucketId.with(req.query.bucketId)
    }

    if ('NetCL' in req.cookies == false) {
        res.cookie('NetCL', NetCL);
    }

    interface payload {
        playerId: string,
        partyPlayerIds: string[],
        bucketId: string,
        attributes: Record<string, string>,
        expireAt: Date,
        nonce: string
    }

    var data: payload = {
        'playerId': req.params.accountId,
        'partyPlayerIds': req.query.partyPlayerIds.split(',').filter(x => x != ''),
        'bucketId': `Neonite:Live:${NetCL}:${HotfixVerion}:${Region}:${Playlist}:PC:public:1`,
        'attributes': {
            'player.userAgent': req.headers['user-agent'],
            'player.preferredSubregion': 'None',
            'player.option.spectator': 'false',
            'player.inputTypes': 'KBM',
            'playlist.revision': '1',
            'player.teamFormat': 'fun'
        },
        'expireAt': new Date().addHours(1),
        'nonce': crypto.randomUUID()
    }

    if (req.query['player.option.partyId'] && typeof req.query['player.option.partyId'] == 'string') {
        data.attributes['player.option.partyId'] = req.query['player.option.partyId'];
    }

    const payload = Buffer.from(JSON.stringify(data, null, 0)).toString('base64');

    const header = Buffer.from(JSON.stringify({
        'alg': 'HS256',
        'typ': 'JWT'
    }, null, 0)).toString('base64');

    const signature = crypto.createHmac('sha1', 'neonite-v3').update(`${header}.${payload}`).digest().toString('base64')

    res.json({
        'serviceUrl': `ws://${req.hostname}/matchmaking`,
        'ticketType': 'mms-player',
        'payload': payload,
        'signature': signature
    });
})

app.get('/api/game/v2/matchmaking/account/:accountId/session/:sessionId', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw neoniteDev.authentication.notYourAccount;
    }

    res.json({
        'accountId': req.params.accountId,
        'sessionId': req.params.sessionId,
        'key': crypto.createHmac('sha1', 'neonite').update(req.params.sessionId).digest().toString('base64')
    })
})

app.post('/api/matchmaking/session/:SessionId/join', CheckAuthorization, (req, res) => res.status(204).end())

app.get('/api/matchmaking/session/:sessionId', cookieParser(), CheckAuthorization, (req, res) => {
    var NetCL = req.cookies['NetCL'];

    if (!NetCL) {
        throw neoniteDev.matchmaking.missingCookie;
    }

    res.json({
        'id': req.params.sessionId,
        'ownerId': 'Neo',
        'ownerName': 'Neo',
        'serverName': 'Neonite-V3',
        'serverAddress': '127.0.0.1',
        'serverPort': 60500,
        'totalPlayers': 0,
        'maxPublicPlayers': 0,
        'openPublicPlayers': 0,
        'maxPrivatePlayers': 0,
        'openPrivatePlayers': 0,
        'attributes': {},
        'publicPlayers': [],
        'privatePlayers': [],
        'allowJoinInProgress': false,
        'shouldAdvertise': false,
        'isDedicated': false,
        'usesStats': false,
        'allowInvites': false,
        'usesPresence': false,
        'allowJoinViaPresence': true,
        'allowJoinViaPresenceFriendsOnly': false,
        'buildUniqueId': NetCL,
        'lastUpdated': new Date(),
        'started': false
    });
});

app.get('/api/storefront/v2/keychain', CheckAuthorization, async (req, res) => {
    const keychain = await axios.get('https://api.nitestats.com/v1/epic/keychain', { timeout: 3000 }).catch(e => { return { data: [''] } });

    res.json(keychain.data);
})

app.get('/api/matchmaking/session/findPlayer/:id', CheckAuthorization, (req, res) => res.json([]));

app.get('/api/statsv2/account/:accountId', CheckAuthorization, (req, res) => { res.json([]) });

app.post('/api/storeaccess/v1/request_access/:accountId', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw neoniteDev.authentication.notYourAccount;
    }

    throw neoniteDev.internal.notImplemented;
})

app.post('/api/game/v2/tryPlayOnPlatform/account/:accountId', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw neoniteDev.authentication.notYourAccount;
    }

    res.set('Content-Type', 'text/plain');
    res.send(true);
});

app.get('/api/game/v2/enabled_features', CheckAuthorization, (req, res) => {
    res.json([])
});

const serverStart = new Date();

app.get('/api/version', (req, res) => {
    res.json({
        app: 'neonite',
        serverDate: new Date(),
        overridePropertiesVersion: 'unknown',
        cln: '00000000',
        build: '000',
        moduleName: 'Neonite',
        buildDate: serverStart,
        version: 'V3',
        branch: 'master',
        modules: {
            'Epic-LightSwitch-AccessControlCore': {
                cln: '00000000',
                build: 'b01',
                buildDate: '2021-01-01T00:00:00.000Z',
                version: '1.0.0',
                branch: 'master'
            },
            'epic-xmpp-api-v1-base': {
                cln: '00000000',
                build: 'b01',
                buildDate: '2021-01-01T00:00:00.000Z',
                version: '0.0.1',
                branch: 'master'
            },
            'epic-common-core': {
                cln: '00000000',
                build: 'b01',
                buildDate: '2021-01-01T00:00:00.000Z',
                version: '3.0.0',
                branch: 'master'
            }
        }
    })
})

app.post('/api/feedback/Bug', async (req, res) => {
    var form = new multiparty.Form();

    const fields = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields) => {
            if (err) {
                return reject(err)
            }
            resolve(fields)
        })
    })

    console.log(fields)
})

app.use(validateMethod(app));

app.use(() => {
    throw neoniteDev.basic.notFound;
})

app.use(
    (err: any, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof ApiError) {
            err.apply(res);
        }
        else if (err instanceof HttpError && err.type == 'entity.parse.failed') {
            neoniteDev.internal.jsonParsingFailed.with(err.message).apply(res);
        } else if (err instanceof HttpError) {
            var error = neoniteDev.internal.unknownError;
            error.statusCode = err.statusCode;
            error.withMessage(err.message).apply(res);
        }
        else {
            console.error(err)
            neoniteDev.internal.serverError.apply(res);
        }
    }
)

module.exports = app