import axios from "axios";

interface responseToken {
    "access_token": string,
    "expires_in": number,
    "expires_at": string,
    "token_type": string,
    "client_id": string,
    "internal_client": boolean,
    "client_service": string
}

interface verifyData {
    token: string;
    session_id: string;
    token_type: string;
    client_id: string;
    internal_client: boolean;
    client_service: string;
    expires_in: number;
    expires_at: number;
    auth_method: string;
}


export async function newClientSession(clientId: string, secret: string): Promise<session> {
    const response = await axios.post<responseToken>(
        'https://account-public-service-prod.ak.epicgames.com/account/api/oauth/token',
        'grant_type=client_credentials',
        {
            auth: {
                username: clientId,
                password: secret
            }
        }
    );

    return new session(response.data);
}

export class session {
    constructor(data: responseToken) {
        this.data = data;
        this.access_token = data.access_token;
        this.expires = new Date(data.expires_at);
        this.client_id = data.client_id;
        this.internal_client = data.internal_client;
        this.client_service = data.client_service;
    }

    data: responseToken
    access_token: string;
    expires: Date;
    client_id: string;
    internal_client: boolean;
    client_service: string;

    async verify(): Promise<boolean> {
        const verifyResponse = await axios.get<verifyData>(
            'https://account-public-service-prod.ol.epicgames.com/account/api/oauth/verify',
            {
                headers: {
                    'authorization': this.data.token_type + ' ' + this.access_token
                },
                validateStatus: undefined,
                timeout: 50000
            }
        )

        return verifyResponse.status == 200;
    }

    isExpired() {
        return this.expires.getTime() <= Date.now();
    }

}