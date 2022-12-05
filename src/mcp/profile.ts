// @ts-nocheck
import { randomUUID } from 'crypto';
import { profile as types } from '../structs/types';
import * as fs from 'fs';
import * as Path from 'path';
import { mcpResponse, multiUpdate, Handleparams, notification } from './operations';
import errors from '../structs/errors';
import * as path from 'path';
import { profiles } from '../database/Local/profilesController';
import { profileChange } from './operations'

export async function ensureProfileExist(profileId: string, accountId: string): Promise<boolean> {
    let hasProfile = await profiles.has(profileId, accountId);

    if (!hasProfile) {
        const success = await createProfile(profileId, accountId);

        if (!success) {
            return false;
        }
    }

    return true;
}

const versionsDir = path.join(__dirname, './profileVersions');
const injectionDir = path.join(__dirname, './injects');

const injections: Record<string, Record<string, types.ItemValue>> = Object.fromEntries(
    fs.readdirSync(injectionDir).filter(x => x.endsWith('.json')).map(fileName => {

        const data: types.ItemValue[] = JSON.parse(fs.readFileSync(path.join(injectionDir, fileName)));
        return [
            fileName.split('.').shift(),
            Object.fromEntries(data.map(x => [x.templateId, x]))
        ]
    })
);

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
    // for local DB
    private fullProfile: types.Profile;

    profileChanges: profileChange[] = [];
    bumpRvn: boolean = false;

    async init() {
        await ensureProfileExist(this.profileId, this.accountId);

        /* use this for SQL Database and remove the code under
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
        this.wipeNumber = infos.wipeNumber;*/


        // I've run in some issues while using the database style ish controller 
        // so I just decided it would be best to just read it and write.

        const fullProfile = await profiles.get(this.profileId, this.accountId);

        this.commandRevision = fullProfile.commandRevision;
        this.created = fullProfile.created;
        this.rvn = fullProfile.rvn;
        this.baseRvn = fullProfile.rvn;
        this.stats = fullProfile.stats;
        this.updated = fullProfile.updated;
        this.version = fullProfile.version;
        this.wipeNumber = fullProfile.wipeNumber;
        this.fullProfile = fullProfile;
    }

    // put back to async for sql DB
    /*async*/ getItem(itemId: string): /*Promise<*/types.ItemValue | undefined/*>*/ {
        //return profiles.getItem(itemId, this.profileId, this.accountId);

        if (!this.fullProfile.items[itemId] && injections[this.profileId] && injections[this.profileId][itemId]) {
            return injections[this.profileId][itemId];
        }

        return this.fullProfile.items[itemId];
    }

    async getItems(itemIds: string[]): Promise<Record<string, types.ItemValue>> {
        /*
        if (injections[this.profileId]) {
            let items = await profiles.getItems(itemIds, this.profileId, this.accountId);
            const wanted = Object.fromEntries(Object.entries(injections[this.profileId]).filter(x => itemIds.includes(x)));
            items = mergeDeep(wanted, items);
            return items;
        } else {
            return await profiles.getItems(requested, this.profileId, this.accountId);
        }*/


        // https://stackoverflow.com/a/56592365
        let items = Object.fromEntries(
            itemIds
                .filter(key => key in this.fullProfile.items) // line can be removed to make it inclusive
                .map(key => [key, this.fullProfile.items[key]])
        );

        if (injections[this.profileId]) {
            const wanted = Object.fromEntries(Object.entries(injections[this.profileId]).filter(x => itemIds.includes(x)));
            items = mergeDeep(wanted, items);
        }

        return items;
    }

    async addItem(itemId: string, itemValue: types.ItemValue) {
        // return profiles.addItem(itemId, itemValue, this.profileId, this.accountId);
        if (itemId in this.fullProfile.items) return;

        this.profileChanges.push(
            {
                changeType: 'itemAdded',
                itemId: itemId,
                item: itemValue
            }
        );

        this.fullProfile.items[itemId] = itemValue;
    }

    async removeItem(itemId: string) {
        // return profiles.removeItem(itemId, this.profileId, this.accountId);
        if (!(itemId in this.fullProfile.items)) return;
        delete this.fullProfile.items[itemId];

        this.profileChanges.push(
            {
                changeType: 'itemRemoved',
                itemId: itemId
            }
        );
    }

    async setItemAttribute(itemId: string, attributeName: string, attributeValue: any) {
        // return profiles.setItemAttr(itemId, attributeName, attributeValue, this.profileId, this.accountId);
        if (!this.getItem(itemId)) {
            return;
        };

        if (!this.fullProfile.items[itemId]) {
            this.fullProfile.items[itemId] = {
                attributes: {}
            }
        };

        this.fullProfile.items[itemId].attributes[attributeName] = attributeValue;

        this.profileChanges.push(
            {
                changeType: 'itemAttrChanged',
                itemId: itemId,
                attributeName: attributeName,
                attributeValue: attributeValue
            }
        );
    }

    async setMutliItemAttribute(values: { itemId: string, attributeName: string, attributeValue: any }[]) {
        //return profiles.setMutliItemAttr(this.profileId, this.accountId, values);

        const validChanges = values.filter(x => this.getItem(x) != undefined)
        if (validChanges.length <= 0) return;

        this.profileChanges = this.profileChanges.concat(
            validChanges.map(
                x => {
                    return {
                        changeType: 'itemAttrChanged',
                        itemId: x.itemId,
                        attributeName: x.attributeName,
                        attributeValue: x.attributeValue
                    }
                }
            )
        );

        values.forEach((itemAttr) => {
            this.fullProfile.items[itemAttr.itemId].attributes[itemAttr.attributeName] = itemAttr.attributeValue;
        });
    }

    async getFullProfile(): Promise<types.Profile> {
        const profileData = { ...this.fullProfile }; //await profiles.get(this.profileId, this.accountId);

        /* if (!profileData) {
             return undefined
         };*/

        if (injections[this.profileId]) {
            profileData.items = mergeDeep(injections[this.profileId], profileData.items)
        }

        //return profileData;
        return profileData;
    }

    async setStat(name: string, value: any): Promise<types.Stats> {
        if (this.stats.attributes[name] == value) return;

        this.stats.attributes[name] = value;
        this.profileChanges.push(
            {
                changeType: 'statModified',
                name: name,
                value: value
            }
        );

        //return profiles.setStat(this.profileId, this.accountId, name, value);
        this.fullProfile.stats.attributes[name] = value;
    }

    // This is only used when everthing is managed throught the profile controller.
    // If you directly manipulate the full profile, you'll have to generate your own response.
    async generateResponse(config: Handleparams, notifications?: notification[], ...mutliUpdates?: Profile[]): mcpResponse {
        let bIsUpToDate = config.revision == this.baseRvn;

        if (config.revisions) {
            const cmdRvn = config.revisions.find(x => x.profileId == this.profileId).clientCommandRevision;
            bIsUpToDate = cmdRvn == this.commandRevision;
        }

        const bShouldBumpRevision = this.profileChanges.length > 0 || this.bumpRvn;

        if (bShouldBumpRevision) {
            this.rvn++;
            this.commandRevision++;
            this.fullProfile.rvn++;
            this.fullProfile.commandRevision++;
        }

        if (this.profileChanges.length > 0) {
            await this.saveProfile();
        }

        const mutliUpdate = mutliUpdates != undefined && mutliUpdates.length > 0 ? await Promise.all(
            mutliUpdates.map(x => x.generateMultiUpdate(config))
        ) : undefined;

        return {
            profileRevision: this.rvn,
            profileId: this.profileId,
            profileChangesBaseRevision: this.baseRvn,
            profileChanges: bIsUpToDate ? this.profileChanges : [
                { changeType: 'fullProfileUpdate', profile:  await this.getFullProfile() }
            ],
            notifications: notifications,
            multiUpdate: mutliUpdate,
            profileCommandRevision: this.commandRevision,
            serverTime: new Date(),
            responseVersion: 1,
            command: config.command
        }
    }

    private async generateMultiUpdate(config: Handleparams): Promise<multiUpdate> {
        let bIsUpToDate = config.revision == this.baseRvn;

        if (config.revisions) {
            const cmdRvn = config.revisions.find(x => x.profileId.toLowerCase() == this.profileId.toLowerCase())?.clientCommandRevision || this.commandRevision;
            bIsUpToDate = cmdRvn == this.commandRevision;
        }

        const bShouldBumpRevision = this.profileChanges.length > 0 || this.bumpRvn;

        if (bShouldBumpRevision) {
            this.rvn++;
            this.commandRevision++;
            this.fullProfile.rvn++;
            this.fullProfile.commandRevision++;
        }

        if (this.profileChanges.length > 0) {
            await this.saveProfile();
        }

        return {
            profileRevision: this.fullProfile.rvn,
            profileId: this.profileId,
            profileChangesBaseRevision: this.baseRvn,
            profileChanges: bIsUpToDate ? this.profileChanges : [
                { changeType: 'fullProfileUpdate', profile: await this.getFullProfile() }
            ],
            profileCommandRevision: this.fullProfile.commandRevision
        }
    }

    private async saveProfile(profile?: types.Profile) {
        profiles.set(this.profileId, this.accountId, profile || this.fullProfile)
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

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}