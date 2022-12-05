/*
import { writeFile } from "fs/promises";
import * as path from "path";

const rAccountId = /^[0-9a-f]{8}[0-9a-f]{4}[0-5][0-9a-f]{3}[089ab][0-9a-f]{3}[0-9a-f]{12}$/;
const cloudstoragePath = path.join(__dirname, '../../../cloudstorage/users');

namespace SavedSettings {
    interface DBvalues {
        dbName: string,
        accountId: string,
        fileName: string,
        content: string,
        sha256: string,
        sha1: string,
        length: number,
        uploaded: string
    }

    export async function add(accountId: string, fileName: string, content: string, sha256: string, sha1: string, length: number) {
        if (!rAccountId.test(accountId)) { return; }
        writeFile(path.join(cloudstoragePath, fileName), content, 'base64')
    }

    export async function set(accountId: string, fileName: string, content: string, sha256: string, sha1: string, length: number) {
        if (!rAccountId.test(accountId)) { return; }

        await query(
            `UPDATE save_configs
               SET content = ?, sha256 = ?, sha1 = ?, length = ?, uploaded = ?
            WHERE dbName = ?`,
            [
                content,
                sha256,
                sha1,
                length,
                new Date().toISOString(),
                `${accountId}:${fileName}`,
            ]
        );
    }

    export async function getFilesNames(accountId: string): Promise<Omit<DBvalues, 'content'>[]> {
        const result = await query<Omit<DBvalues, 'content'>>(
            `SELECT dbName, accountId, fileName, length, sha1, sha256 FROM save_configs WHERE accountId = ?`,
            [
                accountId
            ]
        );

        return result
    }

    export async function remove(accountId: string, filename: string) {
        await query<DBvalues>(
            `DELETE FROM save_configs WHERE dbName = ?`,
            [
                `${accountId}:${filename}`
            ]
        );
    }

    export async function get(accountId: string, filename: string): Promise<DBvalues | undefined> {
        const result = await query<DBvalues>(
            `SELECT * FROM save_configs WHERE dbName = ?`,
            [
                `${accountId}:${filename}`
            ]
        )

        return result[0];
    }
}

export default SavedSettings;*/