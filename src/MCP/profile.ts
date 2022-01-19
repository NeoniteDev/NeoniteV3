// @ts-nocheck
import { randomUUID } from 'crypto';
import { profile as types } from '../structs/types';
import { profiles } from '../database/mysqlManager';
import * as fs from 'fs';
import * as Path from 'path';
import versions from './versions';
import { mcpResponse } from './operations';
import errors from '../structs/errors';

export async function ensureProfileExist(profileId: string, accountId: string): Promise<boolean> {
    var hasProfile = await profiles.has(profileId, accountId);

    if (!hasProfile) {
        const success = await createProfile(profileId, accountId);

        if (!success) {
            return false;
        }
    }

    return true;
}
export class Profile implements Omit<types.Profile, 'items'> {
    constructor(profileId: types.ProfileID, accountId: string) {
        this.accountId = accountId;
        this.profileId = profileId;
    }


    accountId: string;
    profileId: types.ProfileID;

    stats: types.Stats;
    _id: string;
    commandRevision: number;
    created: string;
    rvn: number;
    updated: string;
    version: string;
    wipeNumber: number;
    baseRvn: number;



    async init() {
        const infos = await profiles.getInfos(this.profileId, this.accountId);
        if (!infos) {
            throw new Error("Profile doesn't exist")
        }

        this.commandRevision = infos.commandRevision;
        this.created = infos.created;
        this.rvn = infos.rvn;
        this.baseRvn = infos.rvn;
        this.stats = infos.stats;
        this.updated = infos.updated;
        this.version = infos.version;
        this.wipeNumber = infos.wipeNumber;
    }

    getItem(itemId: string): Promise<types.ItemValue | undefined> {
        return profiles.getItem(itemId, this.profileId, this.accountId);
    }

    addItem(itemId: string, itemValue: types.ItemValue) {
        return profiles.addItem(itemId, itemValue, this.profileId, this.accountId);
    }

    removeItem(itemId: string) {
        return profiles.removeItem(itemId, this.profileId, this.accountId);
    }

    setItemAttribute(itemId: string, attributeName: string, attributeValue: any) {
        return profiles.setItemAttr(itemId, attributeName, attributeValue, this.profileId, this.accountId);
    }

    getFullProfile(): Promise<types.Profile> {
        return profiles.get(this.profileId, this.accountId);
    }

    bumpRvn(respone: mcpResponse | mcpResponse['multiUpdate'][0], command = true) {
        this.rvn++;
        if (command) {
            this.commandRevision++;
        }
        respone.profileRevision = this.rvn;
        respone.profileCommandRevision = this.commandRevision;

        return profiles.setRevision(this.rvn, this.profileId, this.accountId);
    }
}

/*
export async function getOrCreate(profileId: string, accountId: string): Promise<types.Profile | undefined> {
    const existOrCreated = ensureProfileExist(profileId, accountId);

    if (!existOrCreated) {
        return undefined;
    }

    const versionUpdate = versions.find(x => x.profileId == profileId);

    if (versionUpdate && profile.version != versionUpdate.data.version) {
        profile.items = Object.assign(
            profile.items,
            Object.fromEntries(versionUpdate.data.items.map(item => [randomUUID(), item]))
        )

        profile.stats.attributes = Object.assign(
            profile.stats.attributes,
            versionUpdate.data.stats
        )

        profile.version = versionUpdate.data.version;
        profile.rvn++;

        profiles.add(profileId, accountId, profile);
    }

    return profile;
}*/

interface handler {
    handle: (accountId: string) => Promise<types.Profile>,
    profileId: string;
}

const templatesDir = Path.join(__dirname, 'templates');

const templates = fs.readdirSync(templatesDir).map(
    (name) => {
        const module: handler = require(Path.join(templatesDir, name));
        if (!module.handle) return undefined;

        return {
            execute: module.handle,
            profileId: module.profileId,
            filename: name
        }
    }
)


export async function createProfile(profileId: string, accountId: string) {
    const handler = templates.find(x => x.profileId == profileId);

    if (!handler) {
        return false;
    }

    const profile = await handler.execute(accountId);

    profiles.set(profileId, accountId, profile);

    return true;
}