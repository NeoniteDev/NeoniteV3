
import PromiseRouter from 'express-promise-router';
import verifyAuthorization from '../middlewares/authorization';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import errors, { ApiError } from '../structs/errors';
import { HttpError } from 'http-errors';
import { getContent } from '../online';

const app = PromiseRouter();

app.get("/api/pages/fortnite-game", async (req, res) => {
    res.json(buildContent());
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
        "playersurvey": {
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
                //image: 'https://cdn2.unrealengine.com/18bpl-subgameselect-512x1024-0c668123c043.jpg',
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
                specialMessage: '',
                _type: 'Subgame Info',
                description: 'Cooperative PvE Adventure',
                subgame: 'savetheworld',
                standardMessageLine2: '',
                title: 'Save The World',
                standardMessageLine1: ''
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
        subgameselectdata: {
            saveTheWorldUnowned: {
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