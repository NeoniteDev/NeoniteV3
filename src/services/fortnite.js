const express = require('express');
const crypto = require('crypto');
const Path = require('path');
const fs = require('fs');
const { default: axios } = require('axios');
const iniparser = require('config-ini-parser').ConfigIniParser;
const checkMethod = require('../middlewares/Method');
const MemoryStream = require('memory-stream');
const cookieParser = require('cookie-parser');

const Errors = require('../structs/errors');
const { neoniteDev, ApiError } = Errors;

const online = require('../online');

const { CheckAuthorization, CheckClientAuthorization } = require('../middlewares/authorization');
const { userAgentParse } = require('../middlewares/utilities')

const app = express.Router();

const hotfixPath = Path.join(__dirname, '../../cloudstorage/system');
const settingsPath = Path.join(__dirname, '../../saved');

app.use(express.json());

app.use(userAgentParse);
app.use(require('../MCP').default)


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
            'doNotCache': false
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
            'uploaded': fs.statSync(filePath).mtime,
            'storageType': 'S3',
            'doNotCache': true
        });
    }

    res.json(output);
});

const sectionName = '/Script/FortniteGame.FortTextHotfixConfig';

app.get('/api/cloudstorage/system/LanguagePatches.ini', CheckClientAuthorization, async (req, res) => {

    const client_token = await online.getClientToken();

    const config = {
        headers: { Authorization: `Bearer ${client_token.access_token}` },
        validateStatus: () => true
    }

    // TODO: move to online.js
    const req_hotfixes = await axios.get('https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/cloudstorage/system/', config);

    if (req_hotfixes.status !== 200) {
        return res.status(502).end();
    }

    /** @type {CloudstorageFile[]} */
    const Hotfixes = req_hotfixes.data;

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
        const s_content = fs.readFileSync(filePath, 'utf-8').replaceAll('{CURRENT_HOST}', req.get('host'))
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
    if (req.params.accountId != req.auth.in_app_id) {
        throw Errors.neoniteDev.authentication.notYourAccount;
    }

    const dirPath = Path.join(settingsPath, req.auth.account_id)

    if (!fs.existsSync(dirPath)) {
        return res.json([])
    }

    const files = fs.readdirSync(dirPath);


    res.json(files
        .filter(x => x.split('-').pop().replace('.Sav', '') == req.clientInfos.CL)
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
                accountId: req.auth.in_app_id,
                doNotCache: true
            }
        })
    )
});

app.get('/api/cloudstorage/user/:accountId/:filename', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.in_app_id) {
        throw Errors.neoniteDev.authentication.notYourAccount;
    }

    var dirPath = Path.join(settingsPath, req.auth.in_app_id)

    if (Path.parse(dirPath).dir != settingsPath || !fs.existsSync(dirPath)) {
        throw Errors.neoniteDev.cloudstorage.fileNotFound
            .withMessage(`Sorry, we couldn't find a user file for ${req.params.filename}`)
            .with(req.params.filename)
    }

    var filePath = Path.join(dirPath, `${req.params.filename}-${req.clientInfos.CL}.Sav`)

    if (Path.parse(filePath).dir !== dirPath || !fs.existsSync(filePath)) {
        throw Errors.neoniteDev.cloudstorage.fileNotFound
            .withMessage(`Sorry, we couldn't find a user file for ${req.params.filename}`)
            .with(req.params.filename)
    }

    res.set('content-type', 'application/octet-stream')
    res.sendFile(filePath);
});

app.put('/api/cloudstorage/user/:accountId/:filename', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.in_app_id) {
        throw Errors.neoniteDev.authentication.notYourAccount;
    }

    var dirPath = Path.join(settingsPath, req.auth.in_app_id)

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath)
    }

    var memoryStream = new MemoryStream();
    var filePath = Path.join(dirPath, `${req.params.filename.split('.').shift()}-${req.clientInfos.CL}.Sav`)

    req.on('data', function (chunk) { memoryStream._write(chunk, 'buffer', () => { }) })
    req.on('end', function () {
        fs.writeFileSync(filePath, memoryStream.get(), 'binary');

        res.status(204).end();
    })
});

app.post('/api/game/v2/creative/discovery/surface/:accountId', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw Errors.neoniteDev.authentication.notYourAccount;
    }

    res.json({})
})

app.get('/api/receipts/v1/account/:accountId/receipts', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw Errors.neoniteDev.authentication.notYourAccount;
    }

    res.json([])
});

app.get('/api/storefront/v2/catalog', CheckAuthorization, async (req, res) => {
    const catalog = await online.getCatalog()

    if (!catalog) {
        return res.json({
            'refreshIntervalHrs': 24,
            'dailyPurchaseHrs': 24,
            'expiration': new Date().addHours(24),
            'source': 'EmptyShop',
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
    /*
        catalog.storefronts.forEach(store => {
            store.catalogEntries.forEach((x, indezx) => {
                var bAssingMetaInfo = true;
    
                x.prices.forEach(price => {
                    if (price.currencyType == 'RealMoney') {
                        price.currencyType = 'MtxCurrency'
                        price.basePrice = 0;
                        price.finalPrice = 0;
                        price.regularPrice = 0;
                        price.dynamicRegularPrice = 0;
                    } else if (price.currencyType == 'GameItem') {
                        bAssingMetaInfo = false
                    }
                })
    
                x.appStoreId = []
    
                if (store.name != 'CurrencyStorefront' && store.name != 'ReloadVBucks' && x.metaInfo && !x.metaInfo.some(x => x.key == 'SectionID') && bAssingMetaInfo) {
                    x.metaInfo.push({
                        key: 'SectionID',
                        value: 'SpecialB'
                    })
                    x.metaInfo.push({
                        'key': 'HideRarityBorder',
                        'value': 'true'
                    })
                }
    
                if (x.dynamicBundleInfo != undefined && x.dynamicBundleInfo?.currencyType == 'RealMoney') {
                    x.dynamicBundleInfo.currencyType = 'MtxCurrency'
                    x.catalogGroupPriority = 0
                    x.sortPriority = 0
                }
            })
        })*/

    res.json(catalog);
})

app.get('/api/storefront/v2/gift/check_eligibility/recipient/:recipient/offer/:offerId', CheckAuthorization, async (req, res, next) => {
    await CheckCatalog();

    const offer = catalog.storefronts.find(x =>
        x.catalogEntries.some(x => x.offerId == req.params.offerId)
    ).catalogEntries.find(x => x.offerId == req.params.offerId)

    if (offer == undefined) {
        return next(
            Errors.neoniteDev.shop.itemNotFound.with(req.params.offerId)
        )
    }

    if (req.params.recipient == req.auth.in_app_id) {
        return next(
            Errors.neoniteDev.friends.selfFriend.with(req.auth.in_app_id)
        )
    }

    // const profile = readProfile(req.params.recipient);

    console.log(offer)

    switch (offer.offerType) {
        case 'StaticPrice':
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

        case 'DynamicBundle': {
            var regularPrice = 0;

            offer.dynamicBundleInfo.bundleItems.forEach(item => regularPrice += item.regularPrice);

            // TODO: handle alreadyOwnedPriceReduction

            var finalPrice = regularPrice + offer.dynamicBundleInfo.floorPrice;

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
        }
    }
})



app.get('/api/calendar/v1/timeline', CheckAuthorization, async (req, res) => {
    const req_calendar = await axios.get('https://api.nitestats.com/v1/epic/modes-smart', { validateStatus: () => true, timeout: 5000 });
    /** @type {Calendar} */
    const calendar = req_calendar.data;
    try {
        const states = calendar.channels['client-events'].states
        states[0].state.activeEvents.push(`EventFlag.Season${req.clientInfos.Season}`);
        states[1].state.activeEvents.push(`EventFlag.LobbySeason${req.clientInfos.Season}`);
        states[1].state.seasonTemplateId = `AthenaSeason:athenaseason${req.clientInfos.Season}`
        states[1].state.seasonNumber = req.clientInfos.Season;
    } catch { }
    res.json(calendar);
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
        throw Errors.neoniteDev.authentication.notYourAccount;
    }

    res.json({
        'stash': {
            'globalcash': 99999999
        }
    })
})

app.get('/api/game/v2/matchmakingservice/ticket/player/:accountId', cookieParser(), CheckAuthorization, userAgentParse, (req, res) => {
    if (req.params.accountId != req.auth.in_app_id) {
        throw Errors.neoniteDev.authentication.notYourAccount;
    }

    if (!req.query.bucketId) {
        throw Errors.neoniteDev.matchmaking.invalidBucketId;
    }

    var ParsedBckt = {}

    try {
        var splitted = req.query.bucketId.split(':');
        ParsedBckt.NetCL = splitted[0];
        ParsedBckt.HotfixVerion = splitted[1];
        ParsedBckt.Region = splitted[2];
        ParsedBckt.Playlist = splitted[3];
    }
    catch {
        throw Errors.neoniteDev.matchmaking.invalidBucketId;
    }
    finally {
        if (!ParsedBckt.NetCL || !ParsedBckt.Region || !ParsedBckt.Playlist || !ParsedBckt.Region) {
            throw Errors.neoniteDev.matchmaking.invalidBucketId.with(req.query.bucketId)
        }
    }

    if ('NetCL' in req.cookies == false) {
        res.cookie('NetCL', ParsedBckt.NetCL);
    }

    var data = {
        'playerId': req.params.accountId,
        'partyPlayerIds': req.query.partyPlayerIds.split(','),
        'bucketId': `Neonite:Live:${ParsedBckt.NetCL}:${ParsedBckt.HotfixVerion}:${ParsedBckt.Region}:${ParsedBckt.Playlist}:PC:public:1`,
        'attributes': {
            'player.userAgent': req.headers['user-agent'],
            'player.preferredSubregion': 'None',
            'player.option.spectator': 'false',
            'player.inputTypes': '',
            'playlist.revision': '1',
            'player.teamFormat': 'fun'
        },
        'expireAt': new Date().addHours(1),
        'nonce': crypto.randomUUID()
    }

    Object.entries(req.query).forEach(([key, value]) => data.attributes[key] = value);

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
        throw Errors.neoniteDev.authentication.notYourAccount;
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
        throw Errors.neoniteDev.matchmaking.missingCookie;
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
        throw Errors.neoniteDev.authentication.notYourAccount;
    }

    throw Errors.neoniteDev.internal.notImplemented;
})

app.post('/api/game/v2/tryPlayOnPlatform/account/:accountId', CheckAuthorization, (req, res) => {
    if (req.params.accountId != req.auth.account_id) {
        throw Errors.neoniteDev.authentication.notYourAccount;
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

app.use(checkMethod(app));


app.use(() => {
    throw Errors.neoniteDev.basic.notFound;
})

app.use(
    /**
    * @param {any} err
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {express.NextFunction} next
    */
    (err, req, res, next) => {
        if (err instanceof ApiError) {
            err.apply(res);
        }
        else if (err instanceof SyntaxError && err.type == 'entity.parse.failed') {
            neoniteDev.internal.jsonParsingFailed.with(err.message).apply(res);
        }
        else {
            console.error(err)
            neoniteDev.internal.serverError.apply(res);
        }
    }
)

module.exports = app