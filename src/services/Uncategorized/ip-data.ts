import Router from "express-promise-router";
import errors, { ApiError } from "../../structs/errors";
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { HttpError } from 'http-errors';
import users from "../../database/usersController";
import verifyAuthorization from "../../middlewares/authorization";
import * as geoIp from 'geoip-lite'
import * as iso3166 from 'iso-3166-2'
import * as countryList from 'country-list-js'
import * as Path from 'path';
import { readFileSync } from "fs";


const app = Router();

var continents: [string, string][] | undefined = undefined;

try {
    continents = Object.entries<string>(
        JSON.parse(
            readFileSync(Path.join(__dirname, '../../../node_modules/country-list-js/data/continents.json'), 'utf-8')
        )
    )
} catch {

}

app.get('/region', verifyAuthorization(), (req, res) => {
    var ipAdress = req.get('CF-Connecting-IP') || req.ip;
    var cloudflareCountry = req.get('CF-IPCountry');
    var locationData = geoIp.lookup(ipAdress);

    var countyCode = cloudflareCountry || locationData?.country || 'CA';

    var countryInfo = countryList.findByIso2(countyCode);
    var countryName = countryInfo?.name || countyCode;
    var continentName = countryInfo?.continent || ' ';
    var continentCode = continents?.find(([key, value]) => value == continentName) || 'NA';

    res.json(
        {
            "continent": {
                "code": continentCode,
                "names": {
                    "de": continentName,
                    "en": continentName,
                    "es": continentName,
                    "fr": continentName,
                    "ja": continentName,
                    "pt-BR": continentName,
                    "ru": continentName,
                    "zh-CN": continentName
                }
            },
            "country": {
                "is_in_european_union": locationData?.eu ? locationData?.eu == '1' : false,
                "iso_code": countyCode,
                "names": {
                    "de": countryName,
                    "en": countryName,
                    "es": countryName,
                    "fr": countryName,
                    "ja": countryName,
                    "pt-BR": countryName,
                    "ru": countryName,
                    "zh-CN": countryName
                }
            },
            "subdivisions": []
        }
    )
})

export default app;