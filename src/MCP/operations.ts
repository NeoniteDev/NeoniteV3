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

interface itemRemoved {
    changeType: 'itemRemoved',
    itemId: string,
}

type profileChange = fullProfileUpdate | itemAdded | itemAttrChanged | statModified | itemRemoved;

export interface mcpResponse {
    profileRevision: number,
    profileId: string,
    profileChangesBaseRevision: number,
    multiUpdate?: Omit<mcpResponse, 'responseVersion' | 'serverTime' | 'multiUpdate' | 'command'>[],
    profileChanges: profileChange[],
    serverTime: Date,
    profileCommandRevision: number,
    responseVersion: 1,
    command: string
}

export interface profileRevisions {
    profileId: string,
    clientCommandRevision: number
}

export interface Handleparams<T = any> {
    profileId: profile.ProfileID;
    /** the rvn query */
    revision: number;
    accountId: string;
    revisions?: profileRevisions[]
    body?: T;
    command: string;
}

export interface commandHandle {
    supportedProfiles: string[] | '*',
    command: string,
    execute: (request: Handleparams) => mcpResponse
}

export interface commandModule {
    supportedProfiles: string[],
    handle: (request: Handleparams) => mcpResponse
}

const operations = fs.readdirSync(operationDir).map(
    (filename) => {
        const module: commandModule = require(Path.join(operationDir, filename));
        return {
            command: filename.split('.').shift(),
            execute: module.handle,
            supportedProfiles: module.supportedProfiles
        }
    }
)

export function getHandle(command: string): commandHandle | undefined {
    return operations.find(x => x.command != undefined && x.command == command)
}