import * as express from 'express';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import * as crypto from 'crypto';
import * as fs from 'fs';
import validateMethod from '../middlewares/Method';
import * as cookieParser from 'cookie-parser';
import * as multiparty from 'multiparty';
import verifyAuthorization, { reqWithAuth, reqWithAuthMulti, validateToken } from '../middlewares/authorization';
import errors, { ApiError, neoniteDev } from '../utils/errors';
import * as online from '../online';
import { MMSpayload, TimelineSaved } from '../utils/types';
import validateUa from '../middlewares/useragent';
import profiles from '../mcp';
import { HttpError } from 'http-errors'
import Router from 'express-promise-router';
import gameSessions from '../database/local/gameSessionsController';
import users from '../database/local/usersController';
import * as path from 'path';
//import SavedSettings from '../database/local/saveGameController';
import * as UserCloudStorage from '../utils/UserCloudStorage';
import { generateStorefronts } from '../utils/storefront';
import rateLimit from 'express-rate-limit'
import * as resources from '../utils/resources';
import * as multer from 'multer'
import * as JSZip from 'jszip';
import { error } from 'console';

const app = Router();

const hotfixPath = path.join(__dirname, '../../cloudstorage/system');
const feedbackPath = path.join(__dirname, '../../feedbacks');

const validPlatforms = [
  'Windows',
  'Linux',
  'Switch',
  'Android',
  'IOS'
];

app.use(express.json());

app.use(
  (req, res, next) => {
    let oldSend = res.send;

    // @ts-ignore remove charset for alpha support
    res.send = function (data) {
      this.send = oldSend;
      const content_type = this.get('content-type');

      if (
        req.headers.accept &&
        !req.headers.accept.includes('*/*') &&
        !req.accepts(content_type)) {
        errors.neoniteDev.basic.notAcceptable.apply(res);
        return this;
      }

      if (content_type && content_type.startsWith('application/json')) {
        this.removeHeader('content-type');
        this.setHeader('Content-Type', 'application/json')
        this.end(data);
        return this
      }

      return this.send(data);
    }

    res.set('X-EpicGames-McpVersion', 'unknown main-3.0.0 build UNKNOWN cl UNKNOWN');
    res.set('X-Epic-Correlation-ID', req.get('X-Epic-Correlation-ID') || crypto.randomUUID());
    next();
  }
)

app.use(validateUa(true));
app.use(profiles)

app.get('/api/cloudstorage/system/config', verifyAuthorization(true), async (req, res) => {
  return res.status(404).end();

  res.json(
    {
      lastUpdated: '2022-01-19T01:20:39.963Z',
      disableV2: false,
      isAuthenticated: req.auth.in_app_id != undefined,
      enumerateFilesPath: '/api/cloudstorage/system',
      transports: {
        McpProxyTransport: {
          name: 'McpProxyTransport',
          type: 'ProxyStreamingFile',
          appName: 'fortnite',
          isEnabled: false,
          isRequired: false,
          isPrimary: false,
          timeoutSeconds: 10,
          priority: 20
        },
        McpSignatoryTransport: {
          name: 'McpSignatoryTransport',
          type: 'ProxySignatory',
          appName: 'fortnite',
          isEnabled: false,
          isRequired: false,
          isPrimary: false,
          timeoutSeconds: 10,
          priority: 10
        },
        DssDirectTransport: {
          name: 'DssDirectTransport',
          type: 'DirectDss',
          appName: 'fortnite',
          isEnabled: true,
          isRequired: false,
          isPrimary: true,
          timeoutSeconds: 10,
          priority: 1
        }
      }
    }
  );
});

app.get('/api/cloudstorage/system', verifyAuthorization(true), async (req: reqWithAuthMulti, res) => {
  // I hate this
  if (req.clientInfos.friendlyVersion.startsWith('9.4')) {
    throw errors.neoniteDev.internal.invalidUserAgent.withMessage('cloudstorage is disabled for this version')
  }

  const output = [
    /* {
         'uniqueFilename': 'LanguagePatches.ini',
         'filename': 'DefaultGame.ini',
         'hash': 'test',
         'hash256': 'test',
         'length': 1,
         'contentType': 'text/plain',
         'uploaded': '2021-06-25T20:21:22.001Z',
         'storageType': 'S3',
         'doNotCache': true
     }*/
  ];

  const dir = await fs.promises.opendir(hotfixPath);

  for await (const dirent of dir) {
    const fileName = dirent.name;
    const filePath = path.join(hotfixPath, fileName);
    const fileData = fs.readFileSync(filePath);
    if (!fileName.endsWith('.ini')) {
      return;
    }

    output.push(
      {
        'uniqueFilename': fileName,
        'filename': fileName,
        'hash': crypto.createHash('sha1').update(fileData).digest('hex'),
        'hash256': crypto.createHash('sha256').update(fileData).digest('hex'),
        'length': fileData.length,
        'contentType': 'text/plain',
        'uploaded': fs.statSync(filePath).mtime.toISOString(),
        'storageType': 'S3',
        'doNotCache': true
      }
    );
  }

  res.json(output);
});

/*

app.get('/api/cloudstorage/system/LanguagePatches.ini', verifyAuthorization(true), async (req, res) => {
    const languageIni = await online.getLanguageIni();

    res.set('content-type', 'text/plain')
    res.send(languageIni);
});

*/

app.get('/api/cloudstorage/system/:filename', verifyAuthorization(true), (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(hotfixPath, fileName);

  if (path.parse(filePath).dir != hotfixPath || !fileName.endsWith('.ini')) {
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

app.get('/api/cloudstorage/user/config', verifyAuthorization(true), async (req, res) => {
  return res.status(404).end();
  res.json(
    {
      lastUpdated: '2022-01-19T01:20:39.963Z',
      disableV2: false,
      isAuthenticated: req.auth.in_app_id != undefined,
      enumerateFilesPath: '/api/cloudstorage/system',
      transports: {
        McpProxyTransport: {
          name: 'McpProxyTransport',
          type: 'ProxyStreamingFile',
          appName: 'fortnite',
          isEnabled: false,
          isRequired: false,
          isPrimary: false,
          timeoutSeconds: 10,
          priority: 20
        },
        McpSignatoryTransport: {
          name: 'McpSignatoryTransport',
          type: 'ProxySignatory',
          appName: 'fortnite',
          isEnabled: false,
          isRequired: false,
          isPrimary: false,
          timeoutSeconds: 10,
          priority: 10
        },
        DssDirectTransport: {
          name: 'DssDirectTransport',
          type: 'DirectDss',
          appName: 'fortnite',
          isEnabled: true,
          isRequired: false,
          isPrimary: true,
          timeoutSeconds: 10,
          priority: 1
        }
      }
    }
  );
});

/**
 * Thanks to @link https://github.com/GMatrixGames for ClientSettings.Sav saving
 */
app.get('/api/cloudstorage/user/:accountId', verifyAuthorization(), async (req, res) => {
  if (req.params.accountId != req.auth.account_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  const fileName = `ClientSettings-${req.clientInfos.CL}.Sav`;


  if (UserCloudStorage.exist(req.params.accountId, fileName)) {
    return res.json(
      [
        {
          uniqueFilename: fileName,
          filename: 'ClientSettings.Sav',
          hash: 'test',
          hash256: 'test',
          length: 1,
          contentType: 'application/octet-stream',
          uploaded: new Date(),
          storageType: 'S3',
          accountId: req.auth.account_id,
          doNotCache: true
        }
      ]
    );
  }

  return res.json([]);
});

const allowedSaveFileNames = [
  'ClientSettingsXboxOne.Sav',
  'ClientSettingsMac.Sav',
  'ClientSettingsIOS.Sav',
  'ClientSettingsPS4.Sav',
  'ClientSettingsLinux.Sav',
  'ClientSettingsAndroid.Sav',
  'ClientSettings.Sav'
];

app.get('/api/cloudstorage/user/:accountId/:filename', verifyAuthorization(), async (req: reqWithAuth, res) => {
  if (req.params.accountId != req.auth.in_app_id) {
    throw errors.neoniteDev.authentication.notYourAccount;
  }

  if (!req.params.filename.startsWith('ClientSettings-') && !allowedSaveFileNames.includes(req.params.filename)) {
    throw errors.neoniteDev.cloudstorage.fileNotFound
      .withMessage(`Sorry, we couldn't find the file ${req.params.filename} for account ${req.params.accountId}`)
      .with(req.params.filename, req.params.accountId)
  }

  const content = await UserCloudStorage.getFile(req.params.accountId, `ClientSettings-${req.clientInfos.CL}.Sav`);

  if (!content) {
    throw errors.neoniteDev.cloudstorage.fileNotFound
      .withMessage(`Sorry, we couldn't find the file ClientSettings-${req.clientInfos.CL}.Sav for account ${req.params.accountId}`)
      .with(req.params.filename, req.params.accountId)
  };

  res.set('content-type', 'application/octet-stream');
  res.send(Buffer.from(content, 'base64'));
});

app.put('/api/cloudstorage/user/:accountId/:filename', verifyAuthorization(), async (req: reqWithAuth, res) => {
  if (req.params.accountId != req.auth.account_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  const fileName = `ClientSettings-${req.clientInfos.CL}.Sav`;


  if (!req.params.filename.startsWith('ClientSettings-') && !allowedSaveFileNames.includes(req.params.filename)) {
    throw errors.neoniteDev.mcp.missingPermission
      .with(`fortnite:cloudstorage:user:${req.params.accountId}:${req.params.filename}`, 'UPDATE')
  };

  if (parseInt(req.get('Content-Length') || '256002') > 256000) {
    throw errors.neoniteDev.cloudstorage.fileTooLarge;
  }

  const arrayBuffer: Array<any> = [];

  req.on('data', function (chunk) {
    arrayBuffer.push(Buffer.from(chunk, 'binary'))
  })

  req.on('end', async function () {
    const data = Buffer.concat(arrayBuffer);

    const fileExist = UserCloudStorage.exist(req.params.accountId, fileName)
    if (data.length > 256000) {
      throw errors.neoniteDev.cloudstorage.fileTooLarge;
    }

    UserCloudStorage.saveFile(req.params.accountId, fileName, data);

    if (!fileExist) {
      res.send(req.params.filename);
    } else {
      res.status(204).send();
    }
  });
});

app.delete('/api/cloudstorage/user/:accountId/:filename', verifyAuthorization(), async (req: reqWithAuth, res) => {
  const fileName = `ClientSettings-${req.clientInfos.CL}.Sav`;

  if (req.params.accountId != req.auth.account_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  if (!req.params.filename.startsWith('ClientSettings-') && !allowedSaveFileNames.includes(req.params.filename)) {
    throw errors.neoniteDev.mcp.missingPermission
      .with(`fortnite:cloudstorage:user:${req.params.accountId}:${req.params.filename}`, 'DELETE')
  };

  await UserCloudStorage.deleteFile(req.params.accountId, fileName);
  res.status(204).end();
});

app.get('/api/game/v2/friendcodes/:accountId/epic', verifyAuthorization(), (req, res) => {
  if (req.params.accountId != req.auth.in_app_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  res.json([]);
})

// todo
app.post('/api/game/v2/creative/discovery/surface/:accountId', verifyAuthorization(), (req, res) => {
  if (req.params.accountId != req.auth.account_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  res.json(
    {
      "Panels": [
        {
          "PanelName": "ByEpicSTW",
          "Pages": [
            {
              "results": [
                {
                  "linkData": {
                    "mnemonic": "campaign",
                    "linkType": "SubGame",
                    "active": true,
                    "version": 5,
                    "moderationStatus": "Unmoderated",
                    "accountId": "epic",
                    "creatorName": "Epic",
                    "descriptionTags": [
                      "pve"
                    ],
                    "metadata": {
                      "ownership_token": "Token:campaignaccess",
                      "alt_title": {
                        "de": "Rette die Welt",
                        "ru": "Сражение с Бурей",
                        "ko": "세이브 더 월드",
                        "pt-BR": "Salve o Mundo",
                        "it": "Salva il mondo",
                        "fr": "Sauver le monde",
                        "zh-CN": "",
                        "es": "Salvar el mundo",
                        "es-MX": "Salva el mundo",
                        "zh": "",
                        "ar": "أنقِذ العالم",
                        "zh-Hant": "",
                        "ja": "世界を救え",
                        "pl": "Ratowanie Świata",
                        "es-419": "Salva el mundo",
                        "tr": "Dünyayı Kurtar"
                      },
                      "alt_tagline": {
                        "de": "Dränge die anstürmenden Monsterhorden zurück und erforsche eine weitläufige, zerstörbare Welt.  Baue riesige Festungen, stelle Waffen her, finde Beute und steige im Level auf!",
                        "ru": "Сдерживайте боем полчища монстров и исследуйте обширный разрушаемый мир.  Отстраивайте огромные форты, создавайте оружие, находите добычу и повышайте уровень.",
                        "ko": "몬스터 호드에 맞서 싸우고, 광활하고 파괴적인 세상을 탐험해 보세요. 거대한 요새를 짓고, 무기를 제작하고, 전리품을 찾으면서 레벨을 올리세요! ",
                        "pt-BR": "Lute para conter hordas de monstros e explorar um vasto mundo destrutível. Construa fortes enormes, crie armas, encontre saques e suba de nível.",
                        "it": "Lotta per respingere orde di mostri ed esplorare un vasto mondo distruttibile. Costruisci fortezze, crea armi, raccogli bottino e sali di livello.",
                        "fr": "Repoussez des hordes de monstres et explorez un immense terrain destructible. Bâtissez des forts énormes, fabriquez des armes, dénichez du butin et montez en niveau.",
                        "zh-CN": "",
                        "es": "Lucha para contener las hordas de monstruos y recorre un mundo inmenso y destructible.  Construye fuertes enormes, fabrica armas exóticas, busca botín y sube de nivel.",
                        "es-MX": "Lucha para contener las hordas de monstruos y explora un mundo vasto y destructible.  Construye fuertes enormes, fabrica armas, encuentra botín y sube de nivel.",
                        "zh": "",
                        "ar": "قاتل لكبح جماح الوحوش واستكشاف عالم شاسع قابل للتدمير. ابنِ حصونًا ضخمة واصنع الأسلحة واعثر على الغنائم وارتقِ بالمستوى.",
                        "zh-Hant": "",
                        "ja": "モンスターの群れを食い止め、壊すこともできる広大な世界を探索しよう。巨大な要塞を築き、武器をクラフトし、戦利品を見つけてレベルアップしよう。",
                        "pl": "Walcz, by powstrzymać hordy potworów i odkrywaj wielki świat podlegający destrukcji. Buduj olbrzymie forty, twórz broń, zbieraj łupy, awansuj.",
                        "es-419": "Lucha para contener las hordas de monstruos y explora un mundo vasto y destructible.  Construye fuertes enormes, fabrica armas, encuentra botín y sube de nivel.",
                        "tr": "Canavar sürüsünü geri püskürtmek için savaş ve yıkılabilir geniş bir dünyayı keşfet. Devasa kaleler inşa et, silahlar üret, ganimetleri topla ve seviye atla."
                      },
                      "image_url": "https://static-assets-prod.s3.amazonaws.com/fn/static/creative/Fortnite_STW.jpg",
                      "alt_introduction": {
                        "de": "Dränge die anstürmenden Monsterhorden zurück und erforsche eine weitläufige, zerstörbare Welt.  Baue riesige Festungen, stelle Waffen her, finde Beute und steige im Level auf!",
                        "ru": "Сдерживайте боем полчища монстров и исследуйте обширный разрушаемый мир.  Отстраивайте огромные форты, создавайте оружие, находите добычу и повышайте уровень.",
                        "ko": "몬스터 호드에 맞서 싸우고, 광활하고 파괴적인 세상을 탐험해 보세요. 거대한 요새를 짓고, 무기를 제작하고, 전리품을 찾으면서 레벨을 올리세요! ",
                        "pt-BR": "Lute para conter hordas de monstros e explorar um vasto mundo destrutível. Construa fortes enormes, crie armas, encontre saques e suba de nível.",
                        "it": "Lotta per respingere orde di mostri ed esplorare un vasto mondo distruttibile. Costruisci fortezze, crea armi, raccogli bottino e sali di livello.",
                        "fr": "Repoussez des hordes de monstres et explorez un immense terrain destructible. Bâtissez des forts énormes, fabriquez des armes, dénichez du butin et montez en niveau.",
                        "zh-CN": "",
                        "es": "Lucha para contener las hordas de monstruos y recorre un mundo inmenso y destructible.  Construye fuertes enormes, fabrica armas exóticas, busca botín y sube de nivel.",
                        "es-MX": "Lucha para contener las hordas de monstruos y explora un mundo vasto y destructible.  Construye fuertes enormes, fabrica armas, encuentra botín y sube de nivel.",
                        "zh": "",
                        "ar": "قاتل لكبح جماح الوحوش واستكشاف عالم شاسع قابل للتدمير. ابنِ حصونًا ضخمة واصنع الأسلحة واعثر على الغنائم وارتقِ بالمستوى.",
                        "zh-Hant": "",
                        "ja": "モンスターの群れを食い止め、壊すこともできる広大な世界を探索しよう。巨大な要塞を築き、武器をクラフトし、戦利品を見つてレベルアップしよう。",
                        "pl": "Walcz, by powstrzymać hordy potworów i odkrywaj wielki świat podlegający destrukcji. Buduj olbrzymie forty, twórz broń, zbieraj łupy, awansuj.",
                        "es-419": "Lucha para contener las hordas de monstruos y explora un mundo vasto y destructible.  Construye fuertes enormes, fabrica armas, encuentra botín y sube de nivel.",
                        "tr": "Canavar sürüsünü geri püskürtmek için savaş ve yıkılabilir geniş bir dünyayı keşfet. Devasa kaleler inşa et, silahlar üret, ganimetleri topla ve seviye atla."
                      },
                      "tagline": "Battle to hold back the monster hordes and explore a vast, destructible world.  Build huge forts, craft weapons, find loot and level up.",
                      "dynamicXp": {
                        "uniqueGameVersion": "5",
                        "calibrationPhase": "LiveXp"
                      },
                      "locale": "en",
                      "title": "Save The World",
                      "matchmaking": {
                        "joinInProgressType": "JoinImmediately",
                        "playersPerTeam": 4,
                        "maximumNumberOfPlayers": 4,
                        "override_Playlist": "",
                        "playerCount": 4,
                        "mmsType": "keep_full",
                        "mmsPrivacy": "Public",
                        "numberOfTeams": 1,
                        "bAllowJoinInProgress": true,
                        "minimumNumberOfPlayers": 1,
                        "joinInProgressTeam": 1
                      },
                      "introduction": "Battle to hold back the monster hordes and explore a vast, destructible world.  Build huge forts, craft weapons, find loot and level up.",
                      "disallowedPlatforms": [
                        "IOS",
                        "Android",
                        "Switch"
                      ]
                    }
                  },
                  "isFavorite": false
                },
                {
                  "lastVisited": "2021-11-20T22:53:04.178Z",
                  "linkData": {
                    "mnemonic": "playlist_playgroundv2",
                    "linkType": "BR:Playlist",
                    "active": true,
                    "version": 95,
                    "moderationStatus": "Unmoderated",
                    "accountId": "epic",
                    "creatorName": "Epic",
                    "descriptionTags": [],
                    "metadata": {
                      "matchmaking": {
                        "override_playlist": "playlist_playgroundv2"
                      }
                    }
                  },
                  "isFavorite": false
                },
                {
                  "linkData": {
                    "mnemonic": "playlist_solidgold_squads",
                    "linkType": "BR:Playlist",
                    "active": true,
                    "version": 95,
                    "moderationStatus": "Unmoderated",
                    "accountId": "epic",
                    "creatorName": "Epic",
                    "descriptionTags": [],
                    "metadata": {
                      "matchmaking": {
                        "override_playlist": "playlist_solidgold_squads"
                      }
                    }
                  },
                  "isFavorite": false
                },
                {
                  "linkData": {
                    "mnemonic": "playlist_defaultsolo",
                    "linkType": "BR:Playlist",
                    "active": true,
                    "version": 95,
                    "moderationStatus": "Unmoderated",
                    "accountId": "epic",
                    "creatorName": "Epic",
                    "descriptionTags": [],
                    "metadata": {
                      "matchmaking": {
                        "override_playlist": "playlist_defaultsolo"
                      }
                    }
                  },
                  "isFavorite": false
                },
                {
                  "linkData": {
                    "mnemonic": "playlist_defaultduo",
                    "linkType": "BR:Playlist",
                    "active": true,
                    "version": 95,
                    "moderationStatus": "Unmoderated",
                    "accountId": "epic",
                    "creatorName": "Epic",
                    "descriptionTags": [],
                    "metadata": {
                      "matchmaking": {
                        "override_playlist": "playlist_defaultduo"
                      }
                    }
                  },
                  "isFavorite": false
                },
                {
                  "linkData": {
                    "mnemonic": "playlist_trios",
                    "linkType": "BR:Playlist",
                    "active": true,
                    "version": 95,
                    "moderationStatus": "Unmoderated",
                    "accountId": "epic",
                    "creatorName": "Epic",
                    "descriptionTags": [],
                    "metadata": {
                      "matchmaking": {
                        "override_playlist": "playlist_trios"
                      }
                    }
                  },
                  "isFavorite": false
                },
                {
                  "linkData": {
                    "mnemonic": "playlist_defaultsquad",
                    "linkType": "BR:Playlist",
                    "active": true,
                    "version": 95,
                    "moderationStatus": "Unmoderated",
                    "accountId": "epic",
                    "creatorName": "Epic",
                    "descriptionTags": [],
                    "metadata": {
                      "matchmaking": {
                        "override_playlist": "playlist_defaultsquad"
                      }
                    }
                  },
                  "isFavorite": false
                },
                {
                  "linkData": {
                    "mnemonic": "playlist_mash_squads_legacy",
                    "linkType": "BR:Playlist",
                    "active": true,
                    "version": 95,
                    "moderationStatus": "Unmoderated",
                    "accountId": "epic",
                    "creatorName": "Epic",
                    "descriptionTags": [],
                    "metadata": {
                      "matchmaking": {
                        "override_playlist": "playlist_mash_squads_legacy"
                      }
                    }
                  },
                  "isFavorite": false
                },
                {
                  "linkData": {
                    "mnemonic": "playlist_close_squads",
                    "linkType": "BR:Playlist",
                    "active": true,
                    "version": 95,
                    "moderationStatus": "Unmoderated",
                    "accountId": "epic",
                    "creatorName": "Epic",
                    "descriptionTags": [],
                    "metadata": {
                      "matchmaking": {
                        "override_playlist": "playlist_close_squads"
                      }
                    }
                  },
                  "isFavorite": false
                },
                {
                  "linkData": {
                    "mnemonic": "playlist_respawn_24_alt",
                    "linkType": "BR:Playlist",
                    "active": true,
                    "version": 95,
                    "moderationStatus": "Unmoderated",
                    "accountId": "epic",
                    "creatorName": "Epic",
                    "descriptionTags": [],
                    "metadata": {
                      "matchmaking": {
                        "override_playlist": "playlist_respawn_24_alt"
                      }
                    }
                  },
                  "isFavorite": false
                }
              ],
              "hasMore": false
            }
          ]
        }
      ],
      "TestCohorts": [
        `V2-${req.clientInfos.friendlyVersion}_2/10/2022_PC_Epics_Picks`
      ]
    }
  );
})

app.get('/api/receipts/v1/account/:accountId/receipts', verifyAuthorization(), (req, res) => {
  if (req.params.accountId != req.auth.account_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  res.json([]);
});

app.get('/api/storefront/v2/catalog', verifyAuthorization(), async (req, res) => {
  /*const catalog = await online.getCatalog();


  if (!catalog || req.clientInfos.season < 4) {
      return res.sendFile(defaultCatalogPath);
  }
  */

  res.json(
    {
      "refreshIntervalHrs": 24,
      "dailyPurchaseHrs": 24,
      "expiration": new Date().addDays(1),
      "storefronts": await generateStorefronts(req.clientInfos.season, req.clientInfos.friendlyVersion)
    }
  )
});

// leaderboard "cohort" accounts
app.get('/api/game/v2/leaderboards/cohort/:accountId', verifyAuthorization(), async (req, res) => {
  if (req.params.accountId != req.auth.account_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  if (req.query.playlist && typeof req.query.playlist != 'string') {
    throw errors.neoniteDev.basic.badRequest;
  }


  res.json(
    {
      accountId: req.params.accountId,
      playlist: req.query.playlist || 'pc_m0_p2',
      cohortAccounts: ['f1bac684f6284b74883e5ef843f17c96'],
      expiresAt: new Date().addDays(2)
    }
  )
})

// get bulk stats
app.post('/api/leaderboards/type/group/stat/:cohort/window/weekly', verifyAuthorization(), async (req, res) => {
  /*if (req.params.accountId != req.auth.account_id) {
      throw neoniteDev.authentication.notYourAccount;
  }*/

  if (
    !(req.body instanceof Array)
  ) {
    throw errors.neoniteDev.basic.badRequest;
  }

  var accounts = await users.gets(req.body);

  res.json(
    accounts.map(
      (user, index) => {
        return {
          accountId: user.accountId,
          value: index * 20,
          rank: index,
          displayName: user.displayName
        }
      }
    )
  )
})

app.get('/api/storefront/v2/gift/check_eligibility/recipient/:recipient/offer/:offerId', verifyAuthorization(), async (req, res, next) => {
  const catalog = await online.getCatalog();

  if (!catalog) {
    return next(
      neoniteDev.gamecatalog.itemNotFound(req.params.offerId)
    )
  }

  const offer = catalog.storefronts.find(x =>
    x.catalogEntries.some(x => x.offerId == req.params.offerId)
  )?.catalogEntries.find(x => x.offerId == req.params.offerId)

  if (offer == undefined) {
    return next(
      neoniteDev.gamecatalog.itemNotFound(req.params.offerId)
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
                Object.assign(offer.prices[0], { finalPrice: 0 }) :
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

app.get('/api/calendar/v1/timeline', verifyAuthorization(true), async (req, res) => {
  const seasonEvents = resources.getTimelineEvents().filter(
    x => {
      if (x.affectedVersion) {
        return x.affectedSeason == req.clientInfos.season
          && !x.excludedVersion?.includes(req.clientInfos.friendlyVersion)
          && x.affectedVersion.includes(req.clientInfos.friendlyVersion)
      }

      return x.affectedSeason == req.clientInfos.season
        && !x.excludedVersion?.includes(req.clientInfos.friendlyVersion)
    }
  ).flatMap(
    x => x.EventFlags
  ).map(
    x => {
      return {
        eventType: x,
        activeSince: new Date('2017'),
        activeUntil: new Date().addYears(10),
      }
    }
  );

  var pastSeasons = await online.getPastSeasons(req.clientInfos.season);
  const seasonInfo = pastSeasons.find(x => x.season == req.clientInfos.season);
  const seasonStart = new Date(seasonInfo?.startDate || '2017');

  const response = {
    channels: {
      'standalone-store': {
        states: [
          {
            validFrom: new Date(),
            activeEvents: [],
            state: {
              activePurchaseLimitingEventIds: [],
              storefront: {},
              rmtPromotionConfig: [],
              storeEnd: "0001-01-01T00:00:00.000Z"
            }
          }
        ],
        cacheExpire: new Date().addHours(2)
      },
      'client-matchmaking': {
        states: [
          {
            validFrom: new Date(),
            activeEvents: [],
            state: {
              region: {
                BR: {
                  eventFlagsForcedOff: [
                    "Playlist_DefaultDuo"
                  ]
                },
                OCE: {
                  eventFlagsForcedOff: [
                    "Playlist_DefaultDuo"
                  ]
                }
              }
            }
          }
        ],
        cacheExpire: new Date().addHours(2)
      },
      'tk': {
        states: [
          {
            validFrom: new Date(),
            activeEvents: [],
            state: {
              k: []
            }
          }
        ],
        cacheExpire: new Date().addHours(2)
      },
      'featured-islands': {
        states: [
          {
            validFrom: new Date(),
            activeEvents: [],
            state: {
              islandCodes: [],
              playlistCuratedContent: {},
              playlistCuratedHub: {},
              islandTemplates: []
            }
          }
        ],
        cacheExpire: new Date().addHours(2)
      },
      'community-votes': {
        states: [
          {
            validFrom: new Date(),
            activeEvents: [],
            state: {
              electionId: "",
              candidates: [],
              electionEnds: new Date('999'),
              numWinners: 1
            }
          }
        ],
        cacheExpire: new Date().addHours(2)
      },
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
              },
              ...seasonEvents
            ],
            state: {
              activeStorefronts: [],
              eventNamedWeights: {},
              activeEvents: [],
              seasonNumber: req.clientInfos.season,
              seasonTemplateId: `AthenaSeason:athenaseason${req.clientInfos.season}`,
              matchXpBonusPoints: 0,
              eventPunchCardTemplateId: "",
              seasonBegin: seasonStart,
              seasonEnd: new Date('9999'),
              seasonDisplayedEnd: new Date('9999'),
              weeklyStoreEnd: new Date().addDays(7),
              stwEventStoreEnd: new Date('9999'),
              stwWeeklyStoreEnd: new Date('9999'),
              dailyStoreEnd: new Date().addDays(1)
            }
          }
        ],
        cacheExpire: new Date().addHours(2)
      }
    },
    cacheIntervalMins: 15,
    currentTime: new Date()
  };

  try {
    const timeline = await online.getTimeline();

    var state = timeline.channels['client-events'].states[0];

    if (state.state.seasonNumber == req.clientInfos.season) {
      // @ts-ignore
      response.channels['client-events'] = timeline.channels['client-events'];

      return res.json(
        response
      );
    }
  } catch { }

  res.json(response);
})

app.get('/api/v2/versioncheck*', verifyAuthorization(true), (req, res) => {
  res.json({ type: 'NO_UPDATE' })
});

app.get('/api/versioncheck*', verifyAuthorization(true), (req, res) => {
  res.json({ type: 'NO_UPDATE' })
});


app.get('/api/game/v2/world/info', verifyAuthorization(true), async (req, res) => {
  const lastest = await online.getLastest().catch(x => undefined);

  if (lastest && req.clientInfos.CL == lastest.CL) {
    res.json(
      await online.getStwWorld()
    );
  } else {
    res.json(
      resources.getWorldInfo()
    )
  }
});

app.get('/api/game/v2/br-inventory/account/:accountId', verifyAuthorization(), (req, res) => {
  if (req.params.accountId != req.auth.account_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  res.json(
    {
      stash: {
        globalcash: 99999999
      }
    }
  )
})


app.post('/api/game/v2/profileToken/verify/:accountId', verifyAuthorization(), (req, res) => {
  if (req.params.accountId != req.auth.account_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  res.status(204).send();
});

app.get('/api/game/v2/matchmakingservice/ticket/player/:accountId', cookieParser(), verifyAuthorization(),
  async (req, res) => {
    if (req.params.accountId != req.auth.in_app_id) {
      throw neoniteDev.authentication.notYourAccount;
    }

    if (!req.headers['user-agent']) {
      throw neoniteDev.internal.invalidUserAgent;
    }

    if (typeof req.query.bucketId !== 'string') {
      throw neoniteDev.matchmaking.invalidBucketId;
    }

    if (typeof req.query.partyPlayerIds != 'string') {
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

    var data: MMSpayload = {
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

    if (typeof req.query['player.option.partyId'] == 'string') {
      data.attributes['player.option.partyId'] = req.query['player.option.partyId'];
    }

    if (typeof req.query['player.option.customKey'] == 'string') {
      const bIsValid = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})/.test(req.query['player.option.customKey']);

      if (!bIsValid) {
        throw neoniteDev.customError(
          `Invalid custom key: '${req.query['player.option.customKey']}'.\nMust be in format: 'ip:port'`,
          '', 1001, 400
        );
      }

      data.attributes['player.option.customKey'] = req.query['player.option.customKey'];
    }

    const payload = Buffer.from(JSON.stringify(data, null, 0)).toString('base64');

    if (!process.env.mms_key) {
      throw errors.neoniteDev.internal.serverError;
    }

    const signature = crypto.createHmac('sha256', process.env.mms_key).update(payload).digest().toString('base64')

    res.json(
      {
        'serviceUrl': `ws://${req.get('host') || 'backend.neonitedev.live'}/matchmaking`,
        'ticketType': 'mms-player',
        'payload': payload,
        'signature': signature
      }
    );
  })

app.get('/api/game/v2/matchmaking/account/:accountId/session/:sessionId', verifyAuthorization(), (req, res) => {
  if (req.params.accountId != req.auth.account_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  res.json({
    'accountId': req.params.accountId,
    'sessionId': req.params.sessionId,
    'key': crypto.createHmac('sha1', "neoniteOnTop").update(req.params.sessionId).digest().toString('base64')
  })
})

app.post('/api/matchmaking/session/matchMakingRequest', verifyAuthorization(), async (req, res) => {
  const bIsArray = req.body.criteria instanceof Array;
  if (!bIsArray) {
    throw errors.neoniteDev.basic.jsonMappingFailed.with('criteria');
  }

  var sessions = await gameSessions.getAll();

  req.body.criteria.forEach((x: any) => {
    if (x.type == "EQUAL") {
      sessions = sessions.filter(y => y.attributes[x.key] && y.attributes[x.key] == x.key.value);
    } else if (x.type == "IN" && x.value instanceof Array) {
      sessions = sessions.filter(y => y.attributes[x.key] && x.key.value.includes(y.attributes[x.key]));

    }
  });

  res.json(sessions)
})

app.post('/api/matchmaking/session/:SessionId/join', verifyAuthorization(), (req, res) => res.status(204).end())

app.get('/api/matchmaking/session/:sessionId', cookieParser(), verifyAuthorization(), async (req, res) => {
  var NetCL = req.cookies['NetCL'];

  if (!NetCL) {
    throw neoniteDev.matchmaking.missingCookie;
  }

  const session = await gameSessions.get(req.params.sessionId);

  if (!session) {
    throw errors.neoniteDev.basic.notFound.withMessage('Session not found');
  }

  var buildUniqueId = parseInt(NetCL);

  res.json(session);
});

app.get('/api/storefront/v2/keychain', verifyAuthorization(), async (req, res) => {
  const keychain = await online.getKeychain();

  res.json(keychain);
})

app.get('/api/matchmaking/session/findPlayer/:id', verifyAuthorization(), (req, res) => res.json([]));

app.get('/api/statsv2/account/:accountId', verifyAuthorization(), (req, res) => { res.json([]) });

app.post('/api/storeaccess/v1/request_access/:accountId', verifyAuthorization(), (req, res) => {
  if (req.params.accountId != req.auth.account_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  throw neoniteDev.internal.notImplemented;
})

app.post('/api/game/v2/tryPlayOnPlatform/account/:accountId', verifyAuthorization(), (req, res) => {
  if (req.params.accountId != req.auth.account_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  res.set('Content-Type', 'text/plain');
  res.send(true);
});

app.post('/api/game/v2/chat/:accountId/reserveGeneralChatRooms/:type/:platform', verifyAuthorization(), async (req, res) => {
  if (req.params.accountId != req.auth.account_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  /*
  var avalibleRooms = await xmppApi.getChatRooms();

  var globalChatRooms = await Promise.all(
      avalibleRooms.filter(x => x.publicRoom).map(
          async x => {
              var participants = await xmppApi.getRoomParticipants(x.roomName);
              return {
                  roomName: x.roomName,
                  currentMembersCount: x.owner.length + x.admin.length + x.member.length + participants.length,
                  maxMembersCount: x.maxUsers,
                  publicFacingShardName: x.naturalName,
              }
          }
      )
  )

  var notFullRooms = globalChatRooms.filter(x => x.maxMembersCount > x.currentMembersCount);

  if (notFullRooms.length <= 0) {
      var roomId = 'global-' + crypto.randomUUID().replaceAll('-', '');
      var roomData = await xmppApi.createChatRoom(roomId, 'neonite global chat', 'global chat room.', 25, true);

      globalChatRooms.push(
          {
              currentMembersCount: 0,
              maxMembersCount: roomData.maxUsers,
              publicFacingShardName: roomData.naturalName,
              roomName: roomData.roomName
          }
      );
  }*/

  var globalChatRooms = [
    {
      roomName: 'fortnite',
      currentMembersCount: 0,
      maxMembersCount: 9999,
      publicFacingShardName: "Neonite Global",
    }
  ]

  res.json(
    {
      globalChatRooms: globalChatRooms,
      founderChatRooms: [],
      bNeedsPaidAccessForGlobalChat: false,
      bNeedsPaidAccessForFounderChat: false,
      bIsGlobalChatDisabled: false,
      bIsFounderChatDisabled: true,
      bIsSubGameGlobalChatDisabled: false
    }
  );
})

app.post('/api/game/v2/chat/:accountId/recommendGeneralChatRooms/:type/:platform', verifyAuthorization(), async (req, res) => {
  if (req.params.accountId != req.auth.account_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  var globalChatRooms = [
    {
      roomName: 'fortnite',
      currentMembersCount: 0,
      maxMembersCount: 9999,
      publicFacingShardName: "Neonite Global",
    }
  ]

  res.json(
    {
      globalChatRooms: globalChatRooms,
      founderChatRooms: [],
      bNeedsPaidAccessForGlobalChat: false,
      bNeedsPaidAccessForFounderChat: false,
      bIsGlobalChatDisabled: false,
      bIsFounderChatDisabled: true,
      bIsSubGameGlobalChatDisabled: false
    }
  );
  //throw errors.neoniteDev.mcp.invalidChatRequest.withMessage('Recommendations no longer supported!');
})

app.get('/api/game/v2/homebase/allowed-name-chars', verifyAuthorization(true), (req, res) => {
  res.json(
    {
      "ranges": [
        48,
        57,
        65,
        90,
        97,
        122,
        192,
        255,
        260,
        265,
        280,
        281,
        286,
        287,
        304,
        305,
        321,
        324,
        346,
        347,
        350,
        351,
        377,
        380,
        1024,
        1279,
        1536,
        1791,
        4352,
        4607,
        11904,
        12031,
        12288,
        12351,
        12352,
        12543,
        12592,
        12687,
        12800,
        13055,
        13056,
        13311,
        13312,
        19903,
        19968,
        40959,
        43360,
        43391,
        44032,
        55215,
        55216,
        55295,
        63744,
        64255,
        65072,
        65103,
        65281,
        65470,
        131072,
        173791,
        194560,
        195103
      ],
      "singlePoints": [
        32,
        39,
        45,
        46,
        95,
        126
      ],
      "excludedPoints": [
        208,
        215,
        222,
        247
      ]
    }
  );
})

app.get('/api/stats/accountId/:accountId/bulk/window/alltime', verifyAuthorization(), (req, res) => {
  if (req.params.accountId != req.auth.account_id) {
    throw neoniteDev.authentication.notYourAccount;
  }

  res.json([])
});

app.get('/api/game/v2/enabled_features', verifyAuthorization(), (req, res) => {
  res.json([])
});

const serverStart = new Date();
app.get('/api/version', (req, res) => {
  res.json(
    {
      app: 'neonite',
      serverDate: new Date(),
      overridePropertiesVersion: 'UNKNOWN',
      cln: 'UNKNOWN',
      build: 'UNKNOWN',
      moduleName: 'Neonite-V3',
      buildDate: serverStart,
      version: '3.0.0',
      branch: 'main',
      modules: {}
    }
  )
})

const limiter = rateLimit(
  {
    windowMs: 30000,
    max: 1,
    standardHeaders: false,
    legacyHeaders: false,
    handler(req, res, next, optionsUsed) {
      errors.neoniteDev.basic.throttled
        .withMessage(`Operation access is limited by throttling policy, please try again in ${Math.round(optionsUsed.windowMs) / 1000} second(s)`)
        .with(optionsUsed.windowMs.toString()).apply(res);
    }
  }
)

const upload = multer();
app.post('/api/feedback/:type', upload.any(), verifyAuthorization(true), async (req: reqWithAuthMulti, res) => {
  const content_length = req.get('content-length')
  if (!content_length) throw new Error('missing content-length');

  const size = parseInt(content_length);

  if (size > 5e+6) {
    res.status(204).send();
  }

  const body: Partial<{
    feedbacktype: string,
    displayname: string,
    email: string,
    accountid: string,
    engineversion: string,
    platform: string,
    gamebackend: string,
    gamename: string,
    subgamename: string,
    subject: string,
    feedbackbody: string
  }> = req.body;

  const filename = `${body.feedbacktype || 'feedback'}-${body.engineversion || ''}-${req.auth.auth_method == 'client_credentials' ? 'client' : req.auth.account_id}-${crypto.randomUUID()}`.replace(/(?:(?![0-9A-Za-z\-]).)*/g, '') + '.zip'
  const filepath = path.join(feedbackPath, filename);

  const zip = new JSZip();

  if (req.files && req.files instanceof Array) {
    req.files.forEach(x => zip.file(x.filename || x.fieldname || x.originalname || crypto.randomUUID(), x.buffer))
  }

  zip.file('report.json', JSON.stringify(body, undefined, 2))

  zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(fs.createWriteStream(filepath))
    .on('finish', function () {
      res.status(204).send();
    });
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
    else if (err.type == 'entity.parse.failed') {
      neoniteDev.internal.jsonParsingFailed.with(err.message).apply(res);
    } else if (err instanceof HttpError) {
      var error = neoniteDev.internal.unknownError;
      error.statusCode = err.statusCode;
      error.withMessage(err.message).apply(res);
      error.response.intent = "neo-fortnite"
    }
    else {
      console.error(err);
      neoniteDev.internal.serverError.apply(res);
    }
  }
)

module.exports = app;