import * as fs from 'fs';
import * as Path from 'path';
import { Request, Response, NextFunction } from 'express-serve-static-core'
import { profile } from '../structs/types';
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

type profileChange = fullProfileUpdate | itemAdded | itemAttrChanged | statModified;

export interface mcpResponse {
    profileRevision: number,
    profileId: string,
    profileChangesBaseRevision: number,
    multiUpdate?: mcpResponse[],
    profileChanges: profileChange[],
    serverTime: Date,
    profileCommandRevision: number,
    responseVersion: 1
}

export interface Handleparams<T = any> {
    profileId: string;
    revision: number;
    accountId: string;
    body?: T;
}

export interface commandHandle {
    command: string,
    execute: (request: Handleparams) => mcpResponse
}

const operations = fs.readdirSync(operationDir).map(
    (filename) => {
        return {
            command: filename.split('.').shift(),
            execute: require(Path.join(operationDir, filename))
        }
    }
)

export function getHandle(command: string): commandHandle | undefined {
    return operations.find(x => x.command != undefined && x.command == command)?.execute;
}