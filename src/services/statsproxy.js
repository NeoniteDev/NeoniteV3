

const express = require('express');
const online = require('../online');
const axios = require('axios').default
const app = express.Router();
const errors = require('../structs/errors');

const { CheckAuthorization } = require('../middlewares/authorization');

const { ApiException } = errors;

app.get('/api/statsv2/account/:accountId', CheckAuthorization, (req, res) => {
    res.json({
        "startTime": 0,
        "endTime": 9223372036854775807,
        "stats": {
            "br_minutesplayed_keyboardmouse_m0_playlist_respawn_24": 6,
            "br_kills_gamepad_m0_playlist_defaultduo": 15,
            "br_matchesplayed_gamepad_m0_playlist_dadbro_squads": 1,
            "br_placetop1_keyboardmouse_m0_playlist_50v50": 1,
            "br_playersoutlived_keyboardmouse_m0_playlist_showdowntournament_solo": 360,
            "br_lastmodified_gamepad_m0_playlist_bling_squads": 1598278981,
            "br_score_gamepad_m0_playlist_dadbro_squads": 17,
            "br_placetop3_gamepad_m0_playlist_defaultsquad": 1,
            "br_matchesplayed_touch_m0_playlist_defaultduo": 8,
            "br_kills_touch_m0_playlist_respawn_24": 48,
            "br_lastmodified_touch_m0_playlist_defaultduo": 1621803690,
            "br_placetop10_gamepad_m0_playlist_intro_apollo_newplayer": 1,
            "br_score_gamepad_m0_playlist_defaultduo": 1627,
            "br_kills_touch_m0_playlist_playgroundv2": 11,
            "br_matchesplayed_gamepad_m0_playlist_battlelab": 7,
            "br_minutesplayed_keyboardmouse_m0_playlist_defaultsquad": 17,
            "br_placetop25_gamepad_m0_playlist_defaultsolo": 5,
            "br_playersoutlived_touch_m0_playlist_bots_defaultduo": 91,
            "br_score_touch_m0_playlist_playgroundv2": 879,
            "br_lastmodified_gamepad_m0_playlist_defaultsolo": 1598839669,
            "br_placetop25_gamepad_m0_playlist_intro_apollo_newplayer": 1,
            "br_placetop5_gamepad_m0_playlist_cobalt_ht_duos": 1,
            "br_lastmodified_gamepad_m0_playlist_creative_playonly": 1599046674,
            "br_score_keyboardmouse_m0_playlist_showdowntournament_solo": 711,
            "br_score_keyboardmouse_m0_playlist_defaultsquad": 312,
            "br_minutesplayed_touch_m0_playlist_defaultsquad": 52,
            "br_minutesplayed_gamepad_m0_playlist_creative_playonly": 1480,
            "br_minutesplayed_touch_m0_playlist_battlelab": 80,
            "br_kills_gamepad_m0_playlist_respawn_24": 28,
            "br_score_gamepad_m0_playlist_creative_playonly": 3477,
            "br_lastmodified_keyboardmouse_m0_playlist_defaultsquad": 1611201758,
            "br_matchesplayed_keyboardmouse_m0_playlist_solidgold_squads": 1,
            "br_matchesplayed_touch_m0_playlist_creative_playonly": 2,
            "br_minutesplayed_gamepad_m0_playlist_intro_apollo_newplayer": 21,
            "br_minutesplayed_gamepad_m0_playlist_showdownalt_solo": 5,
            "br_score_gamepad_m0_playlist_respawn_24": 3306,
            "br_lastmodified_keyboardmouse_m0_playlist_mash_squads": 1612393515,
            "br_kills_gamepad_m0_playlist_defaultsquad": 33,
            "br_placetop3_gamepad_m0_playlist_bots_defaultsquad": 3,
            "br_matchesplayed_gamepad_m0_playlist_bots_defaultsquad": 3,
            "br_matchesplayed_keyboardmouse_m0_playlist_50v50": 3,
            "br_score_touch_m0_playlist_hightower_12": 575,
            "br_minutesplayed_keyboardmouse_m0_playlist_mash_squads": 8,
            "br_playersoutlived_gamepad_m0_playlist_respawn_24": 109,
            "br_minutesplayed_gamepad_m0_playlist_playgroundv2": 904,
            "br_matchesplayed_touch_m0_playlist_bots_defaultduo": 3,
            "br_matchesplayed_gamepad_m0_playlist_nitrogen12_duos": 2,
            "br_playersoutlived_gamepad_m0_playlist_defaultduo": 587,
            "br_kills_gamepad_m0_playlist_playgroundv2": 27,
            "br_matchesplayed_gamepad_m0_playlist_playgroundv2": 12,
            "br_playersoutlived_gamepad_m0_playlist_showdownalt_solo": 18,
            "br_kills_gamepad_m0_playlist_creative_playonly": 35,
            "br_kills_keyboardmouse_m0_playlist_playgroundv2": 3,
            "br_kills_gamepad_m0_playlist_battlelab": 53,
            "br_minutesplayed_touch_m0_playlist_playgroundv2": 125,
            "br_lastmodified_touch_m0_playlist_defaultsolo": 1601384387,
            "br_playersoutlived_touch_m0_playlist_respawn_24": 107,
            "br_placetop12_touch_m0_playlist_defaultduo": 3,
            "br_lastmodified_gamepad_m0_playlist_respawn_24": 1599924884,
            "br_matchesplayed_keyboardmouse_m0_playlist_defaultsquad": 17,
            "br_lastmodified_gamepad_m0_playlist_showdownalt_trios": 1598996488,
            "br_playersoutlived_touch_m0_playlist_hightower_12": 11,
            "br_placetop10_gamepad_m0_playlist_defaultsolo": 3,
            "br_minutesplayed_touch_m0_playlist_creative_playonly": 36,
            "br_minutesplayed_keyboardmouse_m0_playlist_playgroundv2": 788,
            "br_score_touch_m0_playlist_defaultduo": 2032,
            "br_score_keyboardmouse_m0_playlist_mash_squads": 130,
            "br_matchesplayed_keyboardmouse_m0_playlist_playground": 1,
            "br_matchesplayed_gamepad_m0_playlist_respawn_24": 14,
            "br_kills_keyboardmouse_m0_playlist_showdowntournament_solo": 1,
            "br_minutesplayed_gamepad_m0_playlist_showdownalt_trios": 2,
            "br_kills_touch_m0_playlist_defaultduo": 16,
            "br_matchesplayed_gamepad_m0_playlist_showdownalt_solo": 2,
            "br_kills_gamepad_m0_playlist_defaultsolo": 6,
            "br_kills_touch_m0_playlist_hightower_12": 3,
            "br_score_touch_m0_playlist_battlelab": 255,
            "br_score_gamepad_m0_playlist_nitrogen12_duos": 543,
            "br_score_gamepad_m0_playlist_showdownalt_trios": 28,
            "br_placetop6_touch_m0_playlist_defaultsquad": 3,
            "br_matchesplayed_gamepad_m0_playlist_showdownalt_trios": 1,
            "br_matchesplayed_touch_m0_playlist_respawn_24": 11,
            "br_minutesplayed_touch_m0_playlist_defaultduo": 70,
            "s11_social_bp_level": 678,
            "br_kills_touch_m0_playlist_bots_defaultduo": 4,
            "br_score_keyboardmouse_m0_playlist_defaultduo": 17,
            "br_placetop1_touch_m0_playlist_defaultduo": 1,
            "br_playersoutlived_gamepad_m0_playlist_defaultsquad": 1220,
            "s17_social_bp_level": 240,
            "s14_social_bp_level": 3837,
            "br_kills_touch_m0_playlist_defaultsolo": 1,
            "br_placetop12_gamepad_m0_playlist_nitrogen12_duos": 2,
            "br_score_gamepad_m0_playlist_defaultsquad": 4026,
            "br_placetop1_gamepad_m0_playlist_bots_defaultsquad": 3,
            "br_lastmodified_gamepad_m0_playlist_defaultsquad": 1599504576,
            "br_score_touch_m0_playlist_hightower_hydro_12v12": 151,
            "br_lastmodified_keyboardmouse_m0_playlist_showdowntournament_solo": 1598217009,
            "br_placetop25_touch_m0_playlist_defaultsolo": 2,
            "br_lastmodified_gamepad_m0_playlist_nitrogen12_duos": 1599053483,
            "br_matchesplayed_gamepad_m0_playlist_defaultsolo": 16,
            "br_placetop6_gamepad_m0_playlist_defaultsquad": 5,
            "br_minutesplayed_keyboardmouse_m0_playlist_showdowntournament_solo": 41,
            "br_kills_gamepad_m0_playlist_nitrogen12_duos": 1,
            "br_matchesplayed_gamepad_m0_playlist_defaultduo": 12,
            "br_placetop25_keyboardmouse_m0_playlist_showdowntournament_solo": 1,
            "br_minutesplayed_gamepad_m0_playlist_defaultsquad": 181,
            "br_kills_gamepad_m0_playlist_cobalt_ht_duos": 17,
            "br_score_keyboardmouse_m0_playlist_playgroundv2": 6323,
            "mash_bestscore_gamepad_m0_playlist_mash_squads": 0,
            "br_score_keyboardmouse_m0_playlist_defaultsolo": 242,
            "br_matchesplayed_touch_m0_playlist_defaultsolo": 4,
            "br_lastmodified_gamepad_m0_playlist_bots_defaultsquad": 1598283095,
            "br_lastmodified_keyboardmouse_m0_playlist_playgroundv2": 1637448752,
            "br_matchesplayed_keyboardmouse_m0_playlist_respawn_24": 8,
            "br_matchesplayed_touch_m0_playlist_playgroundv2": 4,
            "br_kills_gamepad_m0_playlist_intro_apollo_newplayer": 4,
            "br_lastmodified_keyboardmouse_m0_playlist_respawn_24": 1612394445,
            "br_matchesplayed_gamepad_m0_playlist_defaultsquad": 30,
            "br_matchesplayed_gamepad_m0_playlist_bling_squads": 1,
            "br_lastmodified_keyboardmouse_m0_playlist_defaultduo": 1607998131,
            "br_score_touch_m0_playlist_respawn_24": 4051,
            "br_playersoutlived_keyboardmouse_m0_playlist_defaultsolo": 1,
            "br_matchesplayed_gamepad_m0_playlist_cobalt_ht_duos": 1,
            "s15_social_bp_level": 280,
            "br_lastmodified_touch_m0_playlist_creative_playonly": 1564092833,
            "br_kills_touch_m0_playlist_defaultsquad": 4,
            "br_lastmodified_gamepad_m0_playlist_cobalt_ht_duos": 1599920784,
            "br_matchesplayed_keyboardmouse_m0_playlist_defaultduo": 1,
            "br_minutesplayed_gamepad_m0_playlist_nitrogen12_duos": 20,
            "br_matchesplayed_keyboardmouse_m0_playlist_mash_squads": 2,
            "br_matchesplayed_touch_m0_playlist_hightower_hydro_12v12": 1,
            "br_score_gamepad_m0_playlist_bots_defaultsquad": 1992,
            "br_minutesplayed_gamepad_m0_playlist_respawn_24": 116,
            "br_placetop3_keyboardmouse_m0_playlist_mash_squads": 2,
            "br_score_touch_m0_playlist_defaultsquad": 1160,
            "br_lastmodified_touch_m0_playlist_playgroundv2": 1600822698,
            "br_playersoutlived_gamepad_m0_playlist_showdownalt_trios": 28,
            "br_playersoutlived_gamepad_m0_playlist_defaultsolo": 619,
            "br_kills_touch_m0_playlist_hightower_hydro_12v12": 1,
            "br_lastmodified_gamepad_m0_playlist_battlelab": 1599923879,
            "br_lastmodified_gamepad_m0_playlist_dadbro_squads": 1592776957,
            "br_matchesplayed_gamepad_m0_playlist_creative_playonly": 15,
            "br_placetop12_gamepad_m0_playlist_cobalt_ht_duos": 1,
            "br_playersoutlived_touch_m0_playlist_defaultsquad": 328,
            "br_minutesplayed_touch_m0_playlist_hightower_hydro_12v12": 4,
            "br_score_touch_m0_playlist_defaultsolo": 577,
            "br_score_touch_m0_playlist_creative_playonly": 510,
            "br_placetop6_keyboardmouse_m0_playlist_mash_squads": 2,
            "br_minutesplayed_gamepad_m0_playlist_defaultduo": 76,
            "br_placetop5_touch_m0_playlist_defaultduo": 3,
            "br_minutesplayed_touch_m0_playlist_bots_defaultduo": 13,
            "br_placetop5_gamepad_m0_playlist_nitrogen12_duos": 2,
            "br_playersoutlived_touch_m0_playlist_defaultsolo": 161,
            "br_playersoutlived_touch_m0_playlist_defaultduo": 449,
            "br_score_touch_m0_playlist_bots_defaultduo": 300,
            "br_placetop12_gamepad_m0_playlist_defaultduo": 2,
            "br_score_gamepad_m0_playlist_battlelab": 2175,
            "br_kills_gamepad_m0_playlist_bots_defaultsquad": 4,
            "s16_social_bp_level": 565,
            "s13_social_bp_level": 2067,
            "br_placetop6_gamepad_m0_playlist_bots_defaultsquad": 3,
            "br_lastmodified_touch_m0_playlist_battlelab": 1600389797,
            "br_lastmodified_touch_m0_playlist_defaultsquad": 1601041097,
            "br_placetop25_keyboardmouse_m0_playlist_defaultsolo": 1,
            "br_lastmodified_gamepad_m0_playlist_defaultduo": 1599501902,
            "br_matchesplayed_gamepad_m0_playlist_intro_apollo_newplayer": 1,
            "s18_social_bp_level": 6474,
            "br_matchesplayed_keyboardmouse_m0_playlist_defaultsolo": 17,
            "br_minutesplayed_gamepad_m0_playlist_bots_defaultsquad": 41,
            "br_matchesplayed_keyboardmouse_m0_playlist_showdowntournament_solo": 7,
            "br_matchesplayed_keyboardmouse_m0_playlist_playgroundv2": 82,
            "br_lastmodified_touch_m0_playlist_bots_defaultduo": 1622518788,
            "br_minutesplayed_gamepad_m0_playlist_battlelab": 423,
            "br_minutesplayed_touch_m0_playlist_defaultsolo": 31,
            "br_minutesplayed_gamepad_m0_playlist_defaultsolo": 91,
            "br_lastmodified_touch_m0_playlist_respawn_24": 1601132937,
            "br_matchesplayed_touch_m0_playlist_hightower_12": 3,
            "br_lastmodified_touch_m0_playlist_hightower_hydro_12v12": 1601037889,
            "br_lastmodified_keyboardmouse_m0_playlist_defaultsolo": 1613521499,
            "br_lastmodified_gamepad_m0_playlist_showdownalt_solo": 1598996012,
            "br_score_gamepad_m0_playlist_playgroundv2": 3273,
            "br_minutesplayed_touch_m0_playlist_hightower_12": 23,
            "br_minutesplayed_gamepad_m0_playlist_cobalt_ht_duos": 19,
            "br_lastmodified_gamepad_m0_playlist_intro_apollo_newplayer": 1577113108,
            "br_matchesplayed_touch_m0_playlist_defaultsquad": 7,
            "br_score_gamepad_m0_playlist_cobalt_ht_duos": 765,
            "br_score_gamepad_m0_playlist_defaultsolo": 1977,
            "br_score_gamepad_m0_playlist_intro_apollo_newplayer": 465,
            "br_lastmodified_touch_m0_playlist_hightower_12": 1600624355,
            "br_matchesplayed_touch_m0_playlist_battlelab": 1,
            "br_lastmodified_gamepad_m0_playlist_playgroundv2": 1599505165,
            "br_score_keyboardmouse_m0_playlist_respawn_24": 1116,
            "br_minutesplayed_touch_m0_playlist_respawn_24": 159,
            "br_score_gamepad_m0_playlist_bling_squads": 17,
            "br_score_gamepad_m0_playlist_showdownalt_solo": 56,
            "br_playersoutlived_gamepad_m0_playlist_bots_defaultsquad": 215,
            "br_minutesplayed_keyboardmouse_m0_playlist_defaultsolo": 8
        },
        "accountId": req.params.accountId
    })
})

app.use(() => {
    throw new ApiException(errors.com.epicgames.common.not_found)
})

app.use(
    /**
    * @param {any} err
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {express.NextFunction} next
    */
    (err, req, res, next) => {
        if (err instanceof ApiException) {
            err
                .Add('originatingService', 'statsproxy')
                .Add('intent', 'live')
                .apply(res);
        }
        else {
            console.log(err);
            new ApiException(errors.com.epicgames.common.server_error)
                .Add('originatingService', 'statsproxy')
                .Add('intent', 'live')
                .apply(res);
        }
    }
)

module.exports = app;