import * as types from '../../utils/types';
import { escape, escapeId } from 'mysql';
import { join } from "path";
import { createService, getService, isServiceExist, updateService } from './LocalDBmanager';

export interface Profiles {
    accountId: string;
    athena: types.profile.Profile,
    commom_core: types.profile.Profile,
    creative: types.profile.Profile,
    common_public: types.profile.Profile
}

interface ProfilesDB {
    accountId: string;
    athena: string,
    commom_core: string,
    creative: string,
    common_public: string
}

type basicProfile = Omit<types.profile.Profile, 'items' | '_id'>;

export namespace profiles {
    export async function has(profileId: string, accountId: string): Promise<boolean> {
        return isServiceExist(accountId, 'p-' + profileId);
    }

    export async function getInfos<T extends basicProfile>(profileId: T['profileId'], accountId: string): Promise<T | undefined> {
        try {
            return await getService<T>(accountId, 'p-' + profileId);
        } catch {
            return undefined;
        }
    }

    export async function setItemAttr
        (
            itemId: string,
            attributeName: string,
            attributeValue: string | number | Object | Array<any>,
            profileId: string,
            accountId: string
        ) {
        const isValid = itemId.match(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/) != null;

        if (!isValid) {
            return;
        }

        const service = await getService<types.profile.Profile>(accountId, 'p-' + profileId);

        //@ts-ignore
        service.items[attributeName] = attributeValue;

        updateService(accountId, 'p-' + profileId, service);
    }

    export async function setMutliItemAttr
        (
            profileId: string,
            accountId: string,
            itemsAttrs: {
                itemId: string,
                attributeName: string,
                attributeValue: string | number | Object | Array<any>,
            }[]
        ) {

        if (itemsAttrs.length <= 0) {
            return;
        }

        const service = await getService<types.profile.Profile>(accountId, 'p-' + profileId);

        //@ts-ignore
        itemsAttrs.forEach(itemsAttr => {
            try { service.items[itemsAttr.itemId].attributes[itemsAttr.attributeName] = itemsAttr.attributeValue }
            catch {
                console.log('failed to set ' + itemsAttr.attributeName + " because it's itemid was not found: " + itemsAttr.itemId)
            }
        })

        updateService(accountId, 'p-' + profileId, service);
    }

    export async function setRevision(revision: number, commandRevision: number, profileId: string, accountId: string) {
        const service = await getService<types.profile.Profile>(accountId, 'p-' + profileId);

        service.commandRevision = commandRevision;
        service.rvn = revision
        updateService(accountId, 'p-' + profileId, service);
    }

    export async function removeItem(itemId: string, profileId: string, accountId: string) {
        const isValid = itemId.match(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/) != null;
        if (!isValid) {
            return undefined;
        }

        const service = await getService<types.profile.Profile>(accountId, 'p-' + profileId);
        delete service.items[itemId];
        updateService(accountId, 'p-' + profileId, service);
    }

    export async function getItem(itemId: string, profileId: string, accountId: string): Promise<types.profile.ItemValue | undefined> {
        const isValid = itemId.match(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/) != null;
        if (!isValid) {
            return undefined;
        }

        const service = await getService<types.profile.Profile>(accountId, 'p-' + profileId);
        return service.items[itemId];
    }

    export async function getItems(itemIds: string[], profileId: string, accountId: string): Promise<Record<string, types.profile.ItemValue>> {
        const service = await getService<types.profile.Profile>(accountId, 'p-' + profileId);

        return Object.fromEntries(Object.entries(service.items).filter(([itemId, value]) => itemIds.includes(itemId)));
    }

    export async function addItem(itemId: string, itemValue: any, profileId: string, accountId: string) {
        const isValid = itemId.match(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/) != null;
        if (!isValid) {
            return;
        }

        const service = await getService<types.profile.Profile>(accountId, 'p-' + profileId);
        service.items[itemId] = itemValue;
        updateService(accountId, 'p-' + profileId, service);
    }

    export async function getStats(profileId: string, accountId: string): Promise<types.profile.Stats | undefined> {
        const service = await getService<types.profile.Profile>(accountId, 'p-' + profileId);

        return service.stats;
    }

    export async function setStat(profileId: string, accountId: string, name: string, value: any) {
        const service = await getService<types.profile.Profile>(accountId, 'p-' + profileId);

        service.stats.attributes[name] = value;

        updateService(accountId, 'p-' + profileId, service);
    }


    export async function get(profileId: keyof Omit<Profiles, 'accountId'>, accountId: string): Promise<types.profile.Profile | undefined> {
        try {
            return await getService<types.profile.Profile>(accountId, 'p-' + profileId);
        } catch {
            return undefined;
        }
    }

    export async function set(profileId: string, accountId: string, Profile: any): Promise<boolean> {
        if (isServiceExist(accountId, 'p-' + profileId)) {
            updateService(accountId, 'p-' + profileId, Profile);
        } else {
            createService(accountId, 'p-' + profileId, Profile)
        }
        return true;
    }
}

export default profiles;