import axios, { AxiosResponse } from 'axios';
import * as os from 'os';
import errors from './errors';
import { randomUUID } from 'crypto';

/// <reference path="../types/responses.d.ts"/>
/// <reference path="../types/statuses.d.ts"/>

if (!process.env.eosProductId ||
    !process.env.eosSandBoxId ||
    !process.env.eosDeploymentId ||
    !process.env.eosClientId ||
    !process.env.eosClientSecret) {
    throw new Error();
}

const productId = process.env.eosProductId;
const sandboxId = process.env.eosSandBoxId;
const deploymentId = process.env.eosDeploymentId;
const clientId = process.env.eosClientId;
const clientSecret = process.env.eosClientSecret;

const nodePlat = os.platform();
const platform = nodePlat === "win32" ? "Windows" : nodePlat;

const axiosClient = axios.create({
    headers: {
        'User-Agent': `EOS-SDK/1.14.1-18153445 (${platform}/${os.release()}) CSharpSamples/1.0.1`,
        'X-EOS-Version': '1.14.1-18153445'
    },
    validateStatus: undefined
})

export default async function generateRoom(): Promise<EOS.room> {
    const roomId = randomUUID();

    const authorization = await getAuthorization();

    const response = await axiosClient.post<never, apiRequest<EOS.room, 200>>(
        `https://api.epicgames.dev/rtc/v1/${deploymentId}/room/${roomId}`,
        {
            participants: [
                {
                    puid: productId,
                    hardMuted: false
                }
            ]
        },
        {
            headers: {
                'authorization': authorization.token_type + ' ' + authorization.access_token
            }
        }
    )

    if (response.status != 200) {
        throw new EosApiError(response);
    }

    return response.data;
}

var lastUsedClient: EOS.oAuthToken | undefined;

async function getAuthorization(): Promise<EOS.oAuthToken> {
    if (
        lastUsedClient == undefined ||
        new Date(lastUsedClient.expires_at).getTime() <= Date.now()
    ) {
        const response = await axiosClient.post<never, apiRequest<EOS.oAuthToken, 200>>(
            'https://api.epicgames.dev/auth/v1/oauth/token',
            new URLSearchParams(
                {
                    'grant_type': 'client_credentials',
                    'deployment_id': deploymentId
                }
            ),
            {
                auth: {
                    username: clientId,
                    password: clientSecret
                }
            }
        );

        if (response.status != 200) {
            throw new EosApiError(response);
        }

        if (!response.data.features.includes('Voice')) {
            throw new Error('Missing Voice feature.');
        }

        lastUsedClient = response.data;
    }


    return lastUsedClient;
}


// @ts-ignore
interface successRequest<T, S = statusesEnum.success> extends AxiosResponse<T> {
    status: S
}

interface failedRequest extends AxiosResponse<EOS.ApiError> {
    status: statusesEnum.failure
}

type apiRequest<T, S = statusesEnum.success> = successRequest<T, S> | failedRequest;


class EosApiError extends Error implements EosApiError {
    constructor(response: failedRequest) {
        const reponseData = response.data;
        super(reponseData.errorCode);
        this.messageVars = reponseData.messageVars;
        this.errorMessage = reponseData.errorMessage;
        this.errorCode = reponseData.errorCode;
        this.correlationId = reponseData.correlationId;
        this.numericErrorCode = reponseData.numericErrorCode;
        this.responseStatus = reponseData.responseStatus;
        this.intent = reponseData.intent;
        this.originatingService = reponseData.originatingService;
    }

    messageVars: string[];
    errorMessage: string;
    errorCode: string;
    correlationId: string;
    numericErrorCode: number;
    responseStatus: number;
    intent: string;
    originatingService: string;
}