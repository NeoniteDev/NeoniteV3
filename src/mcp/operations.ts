import * as fs from 'fs';
import * as Path from 'path';
import { Middlewares } from '../utils/types'
import { profile } from '../utils/types';
import { Profile } from './profile';
const operationDir = Path.join(__dirname, 'operations');


interface fullProfileUpdate {
    changeType: 'fullProfileUpdate'
    profile: profile.Profile
}

interface itemAdded {
    changeType: 'itemAdded',
    item: profile.ItemValue,
    itemId: string
}

interface itemAttrChanged {
    changeType: 'itemAttrChanged',
    itemId: string,
    attributeName: string,
    attributeValue: any,
}

interface statModified {
    changeType: 'statModified',
    name: string,
    value: any
}

interface itemRemoved {
    changeType: 'itemRemoved',
    itemId: string,
}

interface itemQuantityChanged {
    changeType: 'itemQuantityChanged',
    itemId: string,
    quantity: number
}

export type profileChange = fullProfileUpdate | itemAdded | itemAttrChanged | statModified | itemRemoved | itemQuantityChanged;

export type notification = CatalogPurchase | DailyRewards | CardPackResult;

export interface DailyRewards {
    "type": "daily_rewards",
    "primary": boolean,
    "daysLoggedIn": number,
    "items": {
        "itemType": string,
        "quantity": number,
    }[]
}

export interface CardPackResult {
    "type": "cardPackResult",
    "primary": boolean,
    "displayLevel": number,
    "lootGranted": {
        "tierGroupName": string,
        "items": {
            "itemType": string,
            "itemGuid": string,
            "itemProfile": string  ,
            "attributes": Record<string, any>,
            "quantity": 1
        }[],
    }
}


export interface CatalogPurchase {
    "type": "CatalogPurchase",
    "primary": boolean,
    "lootResult": {
        "tierGroupName"?: string,
        "items": {
            "itemType": string,
            "itemGuid": string,
            "itemProfile": string,
            "quantity": number
        }[]
    }
}


export interface mcpResponse {
    profileRevision: number,
    profileId: string,
    profileChangesBaseRevision: number,
    multiUpdate?: multiUpdate[],
    profileChanges: profileChange[],
    serverTime: Date,
    notifications?: notification[]
    profileCommandRevision: number,
    responseVersion: 1,
    command: string
}

export type multiUpdate = Omit<mcpResponse, 'responseVersion' | 'serverTime' | 'multiUpdate' | 'notifications' | 'command'>;


export interface profileRevision {
    profileId: string,
    clientCommandRevision: number
}

export interface Handleparams<T = (any | undefined)> {
    profileId: profile.ProfileID;
    /** the rvn query */
    revision: number;
    accountId: string;
    revisions?: profileRevision[]
    body: T;
    command: string;
    clientInfos: Middlewares.fortniteReq
}

export interface commandHandle {
    supportedProfiles: string[] | '*',
    command: string,
    execute: (request: Handleparams, profile: Profile) => mcpResponse
}

export interface commandModule {
    supportedProfiles: string[],
    handle: (request: Handleparams) => mcpResponse
}

const operations: commandHandle[] = fs.readdirSync(operationDir).map(
    (filename) => {
        const module: commandModule = require(Path.join(operationDir, filename));
        return {
            command: filename.split('.').shift() || filename,
            execute: module.handle,
            supportedProfiles: module.supportedProfiles
        }
    }
)

export function getHandle(command: string): commandHandle | undefined {
    return operations.find(x => x.command != undefined && x.command == command)
}