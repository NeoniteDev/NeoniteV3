export namespace party {
    export namespace CreateParty {
        export interface root {
            config: Record<string, string>;
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
            meta?: Record<string, string>
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
            meta: Record<string, string>;
            yield_leadership: boolean;
        }
    }

    export namespace update {
        export interface Root {
            meta?: Meta;
            config?: Record<string, string>
        }

        export interface Meta {
            update?: Record<string, string>;
            delete?: string[];
        }
    }
}