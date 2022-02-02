import { query } from "./mysqlManager";

namespace pings {
    interface DBvalues {
        pinger: string,
        target: string,
        createdAt: number,
        expireAt: number,
        meta: string
    }

    interface ConfigValues {
        sent_by: string,
        sent_to: string,
        sent_at: Date,
        expires_at: Date,
        meta: Record<string, string>
    }

    export async function create(infos: ConfigValues) {
        query(`DELETE FROM pings WHERE expireAt < ?`, [Date.now()]);
        await query(
            `INSERT INTO pings (
                pinger, target, meta,
                createdAt, expireAt
            ) VALUES (?)`,
            [
                [
                    infos.sent_by,
                    infos.sent_to,
                    JSON.stringify(infos.meta),
                    infos.sent_at.getTime(),
                    infos.expires_at.getTime()
                ]
            ]
        );
    }

    export async function get(pinger: string, target: string): Promise<ConfigValues[]> {
        query(`DELETE FROM pings WHERE expireAt < ?`, [Date.now()]);

          const result = await query<DBvalues>(
            `SELECT * FROM pings WHERE pinger = ? AND \`target\` = ? AND expireAt > ?`,
            [
                pinger,
                target,
                Date.now()
            ]
        );

        return map(result);
    }

    export async function remove(pinger: string, target: string) {
        await query<DBvalues>(
            `DELETE FROM pings WHERE (pinger = ? AND \`target\` = ?) OR expireAt < ?`,
            [
                pinger,
                target,
                Date.now()
            ]
        );
    }

    export async function getUserPings(value: string): Promise<ConfigValues[]> {
        query(`DELETE FROM pings WHERE expireAt < ?`, [Date.now()]);
        const result = await query<DBvalues>(
            `SELECT * FROM pings WHERE target = ? AND expireAt > ?`,
            [
                value, Date.now()
            ]
        )

        return map(result);
    }

    export async function getSentPings(value: string): Promise<ConfigValues[]> {
        query(`DELETE FROM pings WHERE expireAt < ?`, [Date.now()]);
        const result = await query<DBvalues>(
            `SELECT * FROM pings WHERE pinger = ? AND expireAt > ?`,
            [
                value, Date.now()
            ]
        );

        return map(result);
    }


    function map(result: DBvalues[]): ConfigValues[] {
        return result.map(x => {
            return {
                sent_by: x.pinger,
                sent_to: x.target,
                sent_at: new Date(x.createdAt),
                expires_at: new Date(x.expireAt),
                meta: JSON.parse(x.meta)
            }
        })
    }
}

export default pings;