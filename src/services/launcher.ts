import axios from "axios";
import PromiseRouter from "express-promise-router";
import verifyAuthorization, { reqWithAuthMulti } from "../middlewares/authorization";
import userAgentParse from "../middlewares/useragent";
import { getClientSession } from "../online";
import errors from "../utils/errors";
const app = PromiseRouter();

app.get('/api/public/assets/Windows/:catalogItemId/:appName', verifyAuthorization(true), async (req: reqWithAuthMulti, res) => {
    const clientToken = await getClientSession();

    const response = await axios.get(`https://launcher-public-service-prod06.ol.epicgames.com${req.originalUrl}`,
        {
            headers: {
                ...req.headers,
                host: 'launcher-public-service-prod06.ol.epicgames.com',
                authorization: `${clientToken.data.token_type} ${clientToken.access_token}`,
            },
            transformResponse: (data, headers) => data
        }
    );

    for (let header in response.headers) {
        res.set(header, response.headers[header]);
    }

    res.status(response.status);
    res.end(response.data);
})

app.get('/api/public/distributionpoints/', userAgentParse(false), (req, res) => {
    res.json(
        {
            "distributions": [
                "https://fastly-download.epicgames.com/",
                "https://epicgames-download1.akamaized.net/",
                "https://download.epicgames.com/",
                "https://download2.epicgames.com/",
                "https://download3.epicgames.com/",
                "https://download4.epicgames.com/"
            ]
        }
    )
})

module.exports = app
