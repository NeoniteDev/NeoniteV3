import { existsSync } from "fs";
import { mkdir, writeFile, readFile, rm, unlink } from "fs/promises";
import * as path from "path";

export async function saveFile(accountId: string, name: string, content: Buffer) {
    const cloudstoragePath = path.join(__dirname, '../../cloudstorage/users/' + accountId);

    if (!existsSync(cloudstoragePath)) {
        await mkdir(cloudstoragePath);
    }

    const filePath = path.join(cloudstoragePath, name);

    writeFile(filePath, content);
}

export function exist(accountId: string, name: string) {
    const filePath = path.join(__dirname, '../../cloudstorage/users/' + accountId, name);
    return existsSync(filePath);
}

export async function getFile(accountId: string, name: string) {
    const cloudstoragePath = path.join(__dirname, '../../cloudstorage/users/' + accountId);

    if (!existsSync(cloudstoragePath)) {
        return undefined;
    }

    const filePath = path.join(cloudstoragePath, name);

    if (!existsSync(filePath)) {
        return undefined;
    }

    return await readFile(filePath, 'base64');
}

export async function deleteFile(accountId: string, name: string) {
    const cloudstoragePath = path.join(__dirname, '../../cloudstorage/users/' + accountId);

    if (!existsSync(cloudstoragePath)) {
        return;
    }

    const filePath = path.join(cloudstoragePath, name);

    if (!existsSync(filePath)) {
        return;
    }

    await unlink(filePath);
}