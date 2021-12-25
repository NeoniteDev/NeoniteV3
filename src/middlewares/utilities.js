const express = require('express');
const errors = require("./../structs/errors");

const regexp = '(.*)/(.*)-CL-(\\d+) (\\w+)/.*';
const regexp2 = 'game=(.*), engine=UE4, build=(.*)-CL-(\\d+)';

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
module.exports.userAgentParse = (req, res, next) => {

    const userAgent = req.headers["user-agent"];

    if (!userAgent) {
        throw errors.neoniteDev.internal.invalidUserAgent.with(null, regexp);
    }

    const newmatch = userAgent.match(regexp);
    const oldmatch = userAgent.match(regexp2);

    if (newmatch == null && oldmatch == null) {
        throw errors.neoniteDev.internal.invalidUserAgent.with(userAgent, regexp);
    }

    if (newmatch) {
        var friendlyVersion = newmatch.at(2).split('-').pop();
        var season = parseInt(friendlyVersion.split('.').pop());
    
        req.clientInfos = {
            game:  newmatch.at(1),
            version: newmatch.at(2),
            CL: newmatch.at(3),
            platform: newmatch.at(4),
            friendlyVersion: friendlyVersion,
            season: season
        }
    } else if (oldmatch) {
        var friendlyVersion = oldmatch.at(2).split('-').pop();
        var season = parseInt(friendlyVersion.split('.').pop());
    
        req.clientInfos = {
            game:  oldmatch.at(1),
            version: oldmatch.at(2),
            CL: oldmatch.at(3),
            platform: "Windows",
            friendlyVersion: friendlyVersion,
            season: !isNaN(season) ? season : 1
        }
    }

    next();
}

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
module.exports.options = (req, res, next) => {
    console.log(req.route)

    next();
}



