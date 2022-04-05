
import PromiseRouter from 'express-promise-router';
import verifyAuthorization from '../middlewares/authorization';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import errors, { ApiError } from '../structs/errors';
import { HttpError } from 'http-errors';
import { getContent } from '../online';

const app = PromiseRouter();

app.get("/api/pages/fortnite-game", async (req, res) => {
    res.json(await buildContent());
});


async function buildContent(): Promise<Record<string, any>> {
    const content = await getContent();

    const battleroyalenews = {
        news: {
            _type: "battleroyalenews",
            messages: [
                {
                    body: "Made by BeatYT (@TheBeatYT_evil). If you are experiencing any bugs, you can join our Discord at https://discord.gg/DJ6VUmD",
                    image: `https://cdn.neonitedev.live/NeoniteWallpaper.png`,
                    title: "Neonite V3",
                    _type: "CommonUI Simple Message Base",
                    messagetype: "normal",
                    spotlight: false,
                    hidden: false
                }
            ],
            motds: [
                {
                    body: "Made by BeatYT (@TheBeatYT_evil). If you are experiencing any bugs, you can join our Discord by clicking the button below.",
                    image: `https://cdn.neonitedev.live/NeoniteWallpaper.png`,
                    tileImage: `https://cdn.neonitedev.live/NeoniteMidLogo.png`,
                    title: "Neonite V3",
                    _type: "CommonUI Simple Message MOTD",
                    websiteURL: "https://discord.gg/DJ6VUmD",
                    websiteButtonText: "Join our discord",
                    entryType: "Website",
                    id: "Neonite news",
                    sortingPriority: 0,
                    hidden: false,
                }
            ]
        },
        _title: "battleroyalenews",
        _activeDate: "2020-01-21T14:00:00.000Z",
        lastModified: "2021-02-10T23:57:48.837Z",
        _locale: 'en-US'
    }

    const emergencynotice = {
        _title: "emergencynotice",
        emergencynotices: {
            _type: "Emergency Notices",
            emergencynotices: [
                {
                    hidden: false,
                    _type: "CommonUI Emergency Notice Base",
                    title: "Neonite V3",
                    body: "Made by BeatYT (@TheBeatYT_evil).\nDiscord: https://discord.gg/DJ6VUmD",
                }
            ]
        },
        messages: [
            {
                hidden: false,
                _type: "CommonUI Simple Message Base",
                subgame: "br",
                body: "Made by BeatYT (@TheBeatYT_evil).\nDiscord: https://discord.gg/DJ6VUmD",
                title: "Neonite V3",
                spotlight: false
            }
        ],
        news: {
            platform_messages: [],
            _type: "Battle Royale News",
            messages: [
                {
                    hidden: false,
                    _type: "CommonUI Simple Message Base",
                    subgame: "br",
                    body: "Made by BeatYT (@TheBeatYT_evil).\nDiscord: https://discord.gg/DJ6VUmD",
                    title: "Neonite V3",
                    spotlight: false
                }
            ]
        },
        _activeDate: "2018-08-06T19:00:26.217Z",
        lastModified: "2021-11-10T23:55:32.542Z",
        _locale: 'en-US'
    }


    return {
        _title: "Fortnite Game",
        _activeDate: "2017-07-24T22:24:02.300Z",
        lastModified: "2020-11-01T17:36:19.024Z",
        _locale: 'en-US',
        emergencynotice: emergencynotice,
        emergencynoticev2: emergencynotice,
        battleroyalenewsv2: battleroyalenews,
        battleroyalenews: battleroyalenews,
        savetheworldnews: battleroyalenews,
        creativenewsv2: battleroyalenews,
        creativenews: battleroyalenews,
        subgameinfo: {
            battleroyale: {
                image: 'https://cdn.neonitedev.live/Neo_Text.jpg',
                color: '5b2569',
                _type: 'Subgame Info',
                description: '100 Player PvP',
                subgame: 'battleroyale',
                standardMessageLine2: '',
                title: 'Battle Royale',
                standardMessageLine1: 'Neonite V3'
            },
            savetheworld: {
                //image: 'https://cdn2.unrealengine.com/Fortnite/fortnite-game/subgameinfo/StW/09_SubgameSelect_Default_StW-512x1024-e47f51e25cbe9943678b9221056a808e81da40e3.jpg',
                color: '7615E9FF',
                specialMessage: 'Supported!',
                _type: 'Subgame Info',
                description: 'Cooperative PvE Adventure',
                subgame: 'savetheworld',
                standardMessageLine2: 'Supported!',
                title: 'Save The World',
                standardMessageLine1: 'Supported!'
            },
            creative: {
                //image: 'https://cdn2.unrealengine.com/subgameselect-cr-512x1024-371f42541731.png',
                color: '0658b9',
                _type: 'Subgame Info',
                description: 'Your Islands. Your Friends. Your Rules.',
                subgame: 'creative',
                title: 'Creative',
                standardMessageLine1: ''
            },
            _title: 'SubgameInfo',
            _activeDate: "2017-07-24T22:24:02.300Z",
            lastModified: "2020-11-01T17:36:19.024Z",
            _locale: 'en-US'
        },
        subscription: {
            "subscriptionDisclaimer": "Payment methods will be automatically charged monthly. Cancel at any time. View \"Subscription Terms\" for more info.",
            "jcr:isCheckedOut": true,
            "blockedBenefitsNotice": "Your Fortnite Crew information is unavailable\nPlease log on the platform you joined Fortnite Crew to refresh",
            "purchaseSubscriptionDetails": {
                "battlepassRefund": 950,
                "battlepassDescription": "",
                "additionalBulletPoints": {
                    "_type": "SubscriptionBulletPoints"
                },
                "battlepassTitle": "BATTLE PASS INCLUDED",
                "_type": "SubscriptionPurchaseDetails",
                "mtxDescription": "",
                "skinDescription": "",
                "skinTitle": "EXCLUSIVE MONTHLY CREW PACK",
                "mtxTitle": "1,000 V-BUCKS"
            },
            "progressiveInfo": {
                "sizzleVideo": {
                    "videoString": "PBB_Sizzle",
                    "videoUID": "LwftzrskCAwXgBKFzw",
                    "_type": "SpecialOfferVideoConfig",
                    "bStreamingEnabled": true,
                    "bCheckAutoPlay": true
                },
                "newStagesUnlockFinePrint": "New Stages unlock on the {UnlockDay}{UnlockDay}|ordinal(one=st,two=nd,few=rd,other=th) of each month at {UnlockTime} while active",
                "_type": "SubscriptionProgressiveInfo",
                "infoModalEntries": [
                    "The Crew Legacy Set are cosmetic items that unlock new stages every month that you are subscribed to the Fortnite Crew. There are currently 6 stages, which you unlock by being an active subscriber for a total of 6 months.",
                    "The first cosmetic items will be a back bling that can unlock 2 additional styles and a matching pickaxe that unlocks at stage 3 with 3 additional unlockable styles.",
                    "Unlock the first stage of the Crew Legacy Set upon renewing or subscribing to the Fortnite Crew. The ability to unlock Month 1 will remain available to players until {InitialUnlockCutoffDate}.",
                    "Unlock the next stages of your Crew Legacy Set on the {UnlockDay}{UnlockDay}|ordinal(one=st,two=nd,few=rd,other=th) of every month at {UnlockTime} so long as you are an active subscriber on that date. The ability to unlock Months 2-6 will remain available for 12 months from your Month 1 unlock.",
                    "Need to pause your membership? Not a problem, you will retain all unlocked stages and should you decide to return, you will continue your progression where you left off up until your 12 month window ends.",
                    "Previous Fortnite Crew membership from before the release of Crew Legacy Set will not apply to unlock progress."
                ]
            },
            "_title": "Subscription",
            "subModals": {
                "_type": "SubscriptionModals",
                "modals": []
            },
            "nextRewards": {
                "colorA": "ffffff",
                "colorB": "ffffff",
                "itemShopTileViolatorText": "",
                "battlepassDescription": "",
                "_type": "SubscriptionMonthlyReward",
                "itemShopTileViolatorIntensity": "High",
                "battlepassTileImageURL": "https://cdn.neonitedev.live/NeoniteWallpaper.png",
                "skinTitle": "",
                "mtxTitle": "",
                "crewPackItems": [
                    {
                        "quantity": 1,
                        "_type": "RewardItem",
                        "templateId": "AthenaCharacter:cid_a_357_athena_commando_f_valentinefashion_b3s3r"
                    }
                ],
                "battlepassTitle": "",
                "itemShopTileImageURL": "https://cdn.neonitedev.live/NeoniteWallpaper.png",
                "skinImageURL": "https://cdn2.unrealengine.com/19br-subs-tracy-ingame-crewtile-1024x1024-b234643c2cc4.png",
                "bSkinImageTakeOver": false,
                "colorC": "ffffff"
            },
            "currentRewards": {
                "colorA": "ffffff",
                "colorB": "ffffff",
                "itemShopTileViolatorText": "",
                "battlepassDescription": "",
                "_type": "SubscriptionMonthlyReward",
                "itemShopTileViolatorIntensity": "High",
                "battlepassTileImageURL": "https://cdn2.unrealengine.com/19br-subs-tracy-ingame-crewtile-1024x1024-b234643c2cc4.png",
                "skinTitle": "",
                "mtxTitle": "",
                "crewPackItems": [
                    {
                        "quantity": 1,
                        "_type": "RewardItem",
                        "templateId": "AthenaCharacter:cid_a_357_athena_commando_f_valentinefashion_b3s3r"
                    }
                ],
                "battlepassTitle": "",
                "itemShopTileImageURL": "https://cdn.neonitedev.live/NeoniteWallpaper.png",
                "skinImageURL": "https://cdn2.unrealengine.com/19br-subs-tracy-ingame-crewtile-1024x1024-b234643c2cc4.png",
                "bSkinImageTakeOver": false,
                "colorC": "ffffff"
            },
            "_noIndex": false,
            "jcr:baseVersion": "a7ca237317f1e73c97ab11-d2e4-45bb-aee2-3ba2d329a1bb",
            "_activeDate": "2022-03-01T00:00:00.000Z",
            "lastModified": "2022-02-28T23:45:17.171Z",
            "_locale": "en-US"
        },
        crewscreendata: {
            "benefits": {
                "recurringBenefits": [
                    {
                        "tileType": "BattlePass",
                        "tileLabel": "Battle Pass",
                        "nextDetails": {
                            "_type": "Crew Tile Details Data"
                        },
                        "bHasNextCrewPackDetails": false,
                        "_type": "Crew Tile Data",
                        "details": {
                            "tileImageURL": "https://cdn2.unrealengine.com/bp19-subs-ingame-tile-battle-pass-151x198-fe3963e0aafa.png",
                            "_type": "Crew Tile Details Data",
                            "description": "Always own the current season's Battle Pass. Looking for the Battle Bundle? Add 25 levels to your Battle Pass at any time!",
                            "tag": "SeasonLaunchBenefit",
                            "title": "Battle Pass",
                            "backgroundImageURL": "https://cdn.neonitedev.live/NeoniteWallpaper.png"
                        }
                    },
                    {
                        "tileType": "CrewPack",
                        "tileLabel": "Crew Pack",
                        "crewPackItems": [
                            "AthenaCharacter:cid_a_357_athena_commando_f_valentinefashion_b3s3r",
                            "AthenaBackpack:bid_956_valentinefashion_v4rf2",
                            "AthenaPickaxe:pickaxe_id_753_valentinesfashionfemale_cpgk7",
                            "AthenaItemWrap:wrap_441_valentinefashion_h50id"
                        ],
                        "nextDetails": {
                            "tileImageURL": "https://cdn2.unrealengine.com/20br-subs-sayara-ingame-tile-crewoutfit-151x198-98e16ed20b67.jpg",
                            "_type": "Crew Tile Details Data",
                            "description": "Get the Sayara Outfit, Back Bling, Pickaxe and Wrap.",
                            "tag": "CrewMonthBenefit",
                            "title": "",
                            "backgroundImageURL": "https://cdn.neonitedev.live/NeoniteWallpaper.png"
                        },
                        "nextCrewPackItems": [
                            "AthenaCharacter:cid_a_378_athena_commando_f_bacteria_8jygu",
                            "AthenaBackpack:bid_978_bacteriafemale_ukdh2",
                            "AthenaPickaxe:pickaxe_id_765_bacteriafemale1h",
                            "AthenaItemWrap:wrap_449_bacteria"
                        ],
                        "bHasNextCrewPackDetails": true,
                        "_type": "Crew Tile Data",
                        "details": {
                            "tileImageURL": "https://cdn2.unrealengine.com/19br-subs-tracy-ingame-tile-crewoutfit-151x198-cd50c16e2257.jpg",
                            "_type": "Crew Tile Details Data",
                            "description": "Get the Tracy Trouble Outfit, Back Bling, Pickaxe and Wrap.",
                            "tag": "CrewMonthBenefit",
                            "title": "March Crew Pack",
                            "backgroundImageURL": "https://cdn.neonitedev.live/NeoniteWallpaper.png"
                        }
                    },
                    {
                        "tileType": "Basic",
                        "tileLabel": "1,000          V-BUCKS",
                        "nextDetails": {
                            "_type": "Crew Tile Details Data"
                        },
                        "bHasNextCrewPackDetails": false,
                        "_type": "Crew Tile Data",
                        "details": {
                            "tileImageURL": "https://cdn2.unrealengine.com/vbuckstile-151x198-a010a576060b.png",
                            "_type": "Crew Tile Details Data",
                            "description": "Get 1,000 V-Bucks every month on your Crew billing date!",
                            "tag": "MonthlyBenefit",
                            "title": "1,000 V-Bucks",
                            "backgroundImageURL": "https://cdn.neonitedev.live/NeoniteWallpaper.png"
                        }
                    }
                ],
                "_type": "Crew Benefits"
            }
        },
        playersurvey: {
            "s": {
                "s": [
                    {
                        "rt": false,
                        "pr": {
                            "_type": "Player Survey - Message"
                        },
                        "c": [
                            {
                                "cg": {
                                    "_type": "Player Survey - Condition - Condition Group",
                                    "id": "FNBR_IamBumb"
                                },
                                "_type": "Player Survey - Condition Container"
                            }
                        ],
                        "hidden": false,
                        "e": false,
                        "_type": "Player Survey - Survey",
                        "cm": {
                            "_type": "Player Survey - Message"
                        },
                        "q": [
                            {
                                "mc": {
                                    "s": "rating",
                                    "c": [
                                        {
                                            "t": "Very Negative",
                                            "_type": "Player Survey - Multiple Choice Question Choice"
                                        },
                                        {
                                            "_type": "Player Survey - Multiple Choice Question Choice"
                                        },
                                        {
                                            "_type": "Player Survey - Multiple Choice Question Choice"
                                        },
                                        {
                                            "_type": "Player Survey - Multiple Choice Question Choice"
                                        },
                                        {
                                            "t": "Very Positive",
                                            "_type": "Player Survey - Multiple Choice Question Choice"
                                        }
                                    ],
                                    "t": "Overall, how do you feel about <keyword>Supply Llamas</> in Fortnite Battle Royale?",
                                    "_type": "Player Survey - Multiple Choice Question"
                                },
                                "_type": "Player Survey - Question Container"
                            }
                        ],
                        "r": "rm",
                        "sg": [
                            "a"
                        ],
                        "t": "We want your feedback!",
                        "id": "DoYouLikeItemShop",
                        "po": {
                            "_type": "Player Survey - Message"
                        }
                    },
                    {
                        "rt": false,
                        "pr": {
                            "_type": "Player Survey - Message"
                        },
                        "c": [
                            {
                                "_type": "Player Survey - Condition Container"
                            }
                        ],
                        "hidden": false,
                        "e": false,
                        "_type": "Player Survey - Survey",
                        "cm": {
                            "_type": "Player Survey - Message"
                        },
                        "q": [
                            {
                                "mc": {
                                    "s": "standard",
                                    "c": [
                                        {
                                            "t": "Test1",
                                            "_type": "Player Survey - Multiple Choice Question Choice"
                                        },
                                        {
                                            "t": "Test2",
                                            "_type": "Player Survey - Multiple Choice Question Choice"
                                        },
                                        {
                                            "t": "Test3",
                                            "_type": "Player Survey - Multiple Choice Question Choice"
                                        }
                                    ],
                                    "t": "Test",
                                    "_type": "Player Survey - Multiple Choice Question"
                                },
                                "_type": "Player Survey - Question Container"
                            }
                        ],
                        "r": "rm",
                        "sg": [
                            "a"
                        ],
                        "t": "Test",
                        "id": "200901_testsurvey_1",
                        "po": {
                            "_type": "Player Survey - Message"
                        }
                    }
                ],
                "cg": [
                    {
                        "c": [
                            {
                                "_type": "Player Survey - Condition Container",
                                "pl": {
                                    "p": [
                                        "Windows",
                                        "PS4",
                                        "XboxOne",
                                        "Switch",
                                        "PS5",
                                        "XSX"
                                    ],
                                    "_type": "Player Survey - Condition - Platform"
                                }
                            }
                        ],
                        "_type": "Player Survey - Condition Group",
                        "id": "FNBR_NG_Switch"
                    },
                    {
                        "c": [
                            {
                                "cg": {
                                    "_type": "Player Survey - Condition - Condition Group",
                                    "id": "FNBR_NG_Switch"
                                },
                                "_type": "Player Survey - Condition Container"
                            }
                        ],
                        "_type": "Player Survey - Condition Group",
                        "id": "FNBR_IamBumb"
                    }
                ],
                "e": false,
                "_type": "Player Survey - Survey Root"
            },
            "_title": "playersurvey",
            "_noIndex": false,
            "_activeDate": "2019-10-15T07:50:00.000Z",
            "lastModified": "2022-02-09T23:34:04.354Z",
            "_locale": "en-US"
        },
        subgameselectdata: {
            saveTheWorldUnowned: {
                _type: 'CommonUI Simple Message',
                message: {
                    //image: 'https://cdn2.unrealengine.com/Fortnite/fortnite-game/subgameselect/STW/08StW_BombsquadKyle_SubgameSelect-1920x1080-4e747f76f1ec82f49481d83331586ce401bb4c73.jpg',
                    hidden: false,
                    messagetype: 'normal',
                    _type: 'CommonUI Simple Message Base',
                    title: 'Supported!',
                    body: 'Cooperative PvE storm-fighting adventure!',
                    spotlight: false
                }
            },
            battleRoyale: {
                _type: 'CommonUI Simple Message',
                message: {
                    //image: 'https://cdn2.unrealengine.com/Fortnite/fortnite-game/subgameselect/BR08_Subgameselect_BPLaunch_Luxe.MasterKey-1920x1080-1fffc078916ff8ed4e6155a439c7412031119650.jpg',
                    hidden: false,
                    messagetype: 'normal',
                    _type: 'CommonUI Simple Message Base',
                    title: '100 Player PvP',
                    body: '100 Player PvP Battle Royale.\n' +
                        '\n' +
                        'PvE progress does not affect Battle Royale.',
                    spotlight: false
                }
            },
            creative: {
                _type: 'CommonUI Simple Message',
                message: {
                    //image: 'https://cdn2.unrealengine.com/Fortnite/fortnite-game/subgameselect/08CM_BallerCoaster_SubgameSelect-(1)-1920x1080-a63970907455cb28d286c806cad214d279768cbb.jpg',
                    hidden: false,
                    messagetype: 'normal',
                    _type: 'CommonUI Simple Message Base',
                    title: 'New Featured Islands!',
                    body: 'Your Island. Your Friends. Your Rules.\n' +
                        '\n' +
                        'Discover new ways to play Fortnite, play community made games with friends and build your dream island.',
                    spotlight: false
                }
            },
            saveTheWorld: {
                _type: 'CommonUI Simple Message',
                message: {
                    //image: 'https://cdn2.unrealengine.com/Fortnite/fortnite-game/subgameselect/STW/08StW_BombsquadKyle_SubgameSelect-1920x1080-4e747f76f1ec82f49481d83331586ce401bb4c73.jpg',
                    hidden: false,
                    messagetype: 'normal',
                    _type: 'CommonUI Simple Message Base',
                    title: 'Co-op PvE',
                    body: 'Cooperative PvE storm-fighting adventure!',
                    spotlight: false
                }
            },
            _title: 'subgameselectdata',
            _activeDate: "2017-07-24T22:24:02.300Z",
            lastModified: "2020-11-01T17:36:19.024Z",
            _locale: 'en-US'
        },
        loginmessage: {
            _title: 'LoginMessage',
            loginmessage: {
                _type: 'CommonUI Simple Message',
                message: {
                    _type: 'CommonUI Simple Message Base',
                    title: 'Neonite V3',
                    body: 'Made by BeatYT (@TheBeatYT_evil).\nDiscord: https://discord.gg/DJ6VUmD'
                }
            },
            _activeDate: '2017-07-19T13:14:04.490Z',
            lastModified: '2018-03-15T07:10:22.222Z',
            _locale: 'en-US'
        },
        shopCarousel: {
            itemsList: {
                _type: "ShopCarouselItemList",
                items: [{
                    tileImage: `https://cdn.neonitedev.live/NeoniteWallpaper.png`,
                    fullTitle: "Neonite",
                    hidden: false,
                    _type: "ShopCarouselItem",
                    landingPriority: 100,
                    action: "ShowOfferDetails",
                    offerId: null,
                    title: "Neonite"
                }]
            },
            _title: "shop-carousel",
            _activeDate: "2020-09-25T12:00:00.000Z",
            lastModified: "2020-12-05T23:52:44.269Z",
            _locale: 'en-US'
        },
        dynamicbackgrounds: content?.dynamicbackgrounds,
        shopSections: content?.shopSections,
        playlistinformation: content?.playlistinformation,
        _suggestedPrefetch: [
            `https://cdn.neonitedev.live/NeoniteWallpaper.png`,
            `https://cdn.neonitedev.live/NeoniteMidLogo.png`
        ]
    }

}

app.use('/api/pages/', (req, res) => {
    res.status(404).json(
        {
            "error": 404,
            "message": "com.epicgames.common.404"
        }
    )
})

app.use(
    '/api/pages/',
    (err: any, req: Request, res: Response, next: NextFunction) => {
        res.status(500).json(
            {
                "error": 500,
                "message": "com.epicgames.common.500"
            }
        )
    }
)

app.use((req, res) => {
    res.status(302).redirect('/static/preview.html');
})

module.exports = app;