export namespace party {
    export namespace CreateParty {
        export interface root {
            config: Config;
            join_info: JoinInfo;
            meta?: Record<string, string>;
        }

        export interface Config {
            type: string;
            joinability: string;
            discoverability: string;
            sub_type: string;
            max_size: number;
            invite_ttl: number;
            join_confirmation: boolean;
            intention_ttl: number;
        }

        export interface JoinInfo {
            connection: Connection;
        }

        export interface Connection {
            id: string;
            meta?: Record<string, string>;
        }
    }

    export namespace JoinParty {
        export interface Root {
            connection: Connection;
            meta?: Record<string, string>;
        }

        export interface Connection {
            id: string;
            meta?: Record<string, string>;
            yield_leadership?: boolean;
        }
    }

    export namespace MetaUpdate {
        export interface Root {
            update: Record<string, string>;
            delete: string[];
        }
    }
}