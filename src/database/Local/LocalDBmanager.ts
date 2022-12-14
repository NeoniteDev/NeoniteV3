import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import * as path from "path";
import errors from "../../utils/errors";

const localDataPath = path.join(__dirname, '../../../local-data');


export function isServiceExist(id: string, service: string) {
    const accountPath = path.join(localDataPath, id);

    const parsedPath = path.parse(accountPath);

    if (parsedPath.dir != localDataPath || parsedPath.base != id) {
        throw "Invalid Path Error";
    };

    if (!existsSync(accountPath)) {
        throw errors.neoniteDev.account.accountNotFound.withMessage(`Sorry, we couldn't find an account for ${id}`);
    }

    const servicePath = path.join(accountPath, `${service}.json`);

    return existsSync(servicePath);
}

export async function getService<T>(id: string, service: string): Promise<T> {
    const accountPath = path.join(localDataPath, id);

    const parsedPath = path.parse(accountPath);

    if (parsedPath.dir != localDataPath || parsedPath.base != id) {
        throw "Invalid Path Error";
    };

    if (!existsSync(accountPath)) {
        throw errors.neoniteDev.account.accountNotFound.withMessage(`Sorry, we couldn't find an account for ${id}`);
    }

    const servicePath = path.join(accountPath, `${service}.json`);

    if (!existsSync(servicePath)) {
        throw errors.neoniteDev.internal.dataBaseError.withMessage(`Sorry, we couldn't find service ${service} file for account ${id}`)
    }
    
    let content: string;
    try {
        content = await readFile(servicePath, 'utf-8');
    } catch {
        throw errors.neoniteDev.internal.dataBaseError.withMessage(`Sorry, we couldn't read service ${service}.json file for account ${id}`)
    }

    return JSON.parse(content);
}


export async function updateService<T>(id: string, service: string, data: T) {
    const accountPath = path.join(localDataPath, id);

    const parsedPath = path.parse(accountPath);

    if (parsedPath.dir != localDataPath || parsedPath.base != id) {
        throw "Invalid Path Error";
    };

    if (!existsSync(accountPath)) {
        return createService(id, service, data);
        throw errors.neoniteDev.account.accountNotFound.withMessage(`Sorry, we couldn't find an account for ${id}`);
    }

    const servicePath = path.join(accountPath, `${service}.json`);

    if (!existsSync(servicePath)) {
        return createService(id, service, data);
        throw errors.neoniteDev.internal.dataBaseError.withMessage(`Sorry, we couldn't find service ${service} file for account ${id}`)
    }


    writeFile(servicePath, JSON.stringify(data), 'utf-8');
}

export async function createService<T>(id: string, service: string, data: T) {
    console.log('create service')
    const accountPath = path.join(localDataPath, id);

    const parsedPath = path.parse(accountPath);

    if (parsedPath.dir != localDataPath || parsedPath.base != id) {
        console.log( "Invalid Path Error");
        throw "Invalid Path Error"
    };

    if (!existsSync(accountPath)) {
        await mkdir(accountPath);
    }

    const servicePath = path.join(accountPath, `${service}.json`);

    console.log('creating ' + servicePath)
    writeFile(servicePath, JSON.stringify(data), 'utf-8');
}


