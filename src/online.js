const axios = require('axios');

/**
 * @type {import('../structs/types').BRShop}
 */
var catalog = undefined;

/**
 * @type {{
 *       access_token: string,
 *       expires_in: number,
 *       expires_at: Date,
 *       token_type: string,
 *       client_id: string,
 *       internal_client: boolean,
 *       client_service: string,
 *   }}
 */
var client_token = {};

async function checkToken() {
    if (!client_token.access_token || new Date(client_token.expires_at).getTime() - Date.now() > 10000) {
        const request = await axios.post('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token', 'grant_type=client_credentials', {
            auth: {
                username: 'ec684b8c687f479fadea3cb2ad83f5c6',
                password: 'e1f31c211f28413186262d37a13fc84d'
            },
            validateStatus: () => true
        })

        if (request.status === 200) {
            client_token = request.data;
        }
    }
}

async function checkCatalog() {
    if (!catalog || new Date(catalog.expiration).getTime() >= Date.now()) {
        const request = await axios.get('https://api.nitestats.com/v1/epic/store', { validateStatus: () => true });
        if (request.status == 200) {
            catalog = request.data;
            catalog.source = 'EpicShop';
        }
    }
}

module.exports = {
    async getCatalog() {
        await checkCatalog();
        return catalog;
    },
    async getClientToken() {
        await checkToken();
        return client_token;
    }
}