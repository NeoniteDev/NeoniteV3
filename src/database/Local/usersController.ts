import * as types from '../../structs/types';
import { createService, getService, updateService } from './LocalDBmanager';

const rAccountId = /^[0-9a-f]{8}[0-9a-f]{4}[0-5][0-9a-f]{3}[089ab][0-9a-f]{3}[0-9a-f]{12}$/;

export interface User {
    displayName: string;
    accountId: string;
    email: string;
    password: string;
    discord_account_id?: string,
    discord_user_name?: string,
    google_display_name?: string,
    google_account_id?: string,
    createdAt: number,
    modifiedAt?: number
}

namespace Accounts {
    export async function add(user: User) {
        const service = await getService<User[]>('server', 'users');
        service.push(user);
        updateService('server', 'users', service);
    }


    export async function getById(value: string): Promise<User | undefined> {
        const users = await getService<User[]>('server', 'users');
        return users.find(x => x.accountId);
    }

    export async function getByEmail(value: string): Promise<User | undefined> {
        const users = await getService<User[]>('server', 'users');
        return users.find(x => x.email.toLowerCase() == value);
    }

    export async function getByGoogleId(value: string): Promise<User | undefined> {
        const users = await getService<User[]>('server', 'users');
        return users.find(x => x.google_account_id == value);
    }

    export async function getByDiscordId(value: string): Promise<User | undefined> {
        const users = await getService<User[]>('server', 'users');
        return users.find(x => x.discord_account_id == value);
    }

    export async function getByDiplayName(value: string) {
        const users = await getService<User[]>('server', 'users');
        return users.find(x => x.displayName == value);
    }

    export async function search(searchValue: string) {
        const users = await getService<User[]>('server', 'users');

        var result = users.filter(x => x.displayName.startsWith(searchValue));

        if (result.length > 10) result.length = 10;
        else {
            const includes = users.filter(x => x.displayName.includes(searchValue));
            if (includes.length > 10) includes.length = 10;
            result = result.concat(includes);
            if (result.length > 10) result.length = 10;
        }


        return result;
    }

    export async function gets(userIds: string[]): Promise<User[]> {
        const users = await getService<User[]>('server', 'users');
        return users.filter(x => userIds.includes(x.accountId));
    }
}

export default Accounts;