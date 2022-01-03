import { BRShop } from './structs/types';
import axios from 'axios';

var catalog: BRShop | undefined = undefined;

interface clientToken {
    access_token: string,
    expires_in: number,
    expires_at: Date,
    token_type: string,
    client_id: string,
    internal_client: boolean,
    client_service: string,
}



var client_token: clientToken | undefined;

export async function getClientToken() {
    var isInvalid =
        !client_token ||
        !client_token.access_token ||
        new Date(client_token.expires_at).getTime() <= Date.now() ||
        (await
            axios.head(
                'https://account-public-service-prod.ak.epicgames.com/account/api/oauth/verify',
                {
                    headers: {
                        'authorization': `bearer ${client_token.access_token}`
                    },
                    validateStatus: undefined,
                    timeout: 50000
                }
            )
        ).status != 200


    if (isInvalid) {
        const request = await axios.post<clientToken>('https://account-public-service-prod.ak.epicgames.com/account/api/oauth/token', 'grant_type=client_credentials', {
            auth: {
                username: 'ec684b8c687f479fadea3cb2ad83f5c6',
                password: 'e1f31c211f28413186262d37a13fc84d'
            },
            validateStatus: undefined
        })

        if (request.status === 200) {
            client_token = request.data;
        }
    }

    return client_token;
}


export async function getCatalog() {
    if (!catalog || new Date(catalog.expiration).getTime() <= Date.now()) {
        const request = await axios.get('https://api.nitestats.com/v1/epic/store', { validateStatus: () => true });
        if (request.status == 200) {
            catalog = request.data;
        }
    }

    return catalog;
}