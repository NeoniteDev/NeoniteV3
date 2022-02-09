import { Server } from "http";
import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { EventEmitter } from "events";
import { IRoute } from "express";
import * as partyClass from './Party'
import { ExecSyncOptionsWithStringEncoding } from "child_process";
import { party } from "../types/bodies";

export interface partyPing {
    from: string;
    to: string;
}

export interface oauth_Response {
    access_token: string,
    expires_in: number,
    expires_at: string,
    token_type: string,
    refresh_token: string,
    refresh_expires: number,
    refresh_expires_at: string,
    account_id: string,
    client_id: string,
    internal_client: boolean,
    client_service: string,
    displayName: string,
    app: string,
    in_app_id: string,
    device_id: string
}

export interface PartyConfig {
    type: string;
    joinability: string;
    discoverability: string;
    sub_type: string;
    max_size: number;
    invite_ttl: number;
    join_confirmation: boolean;
    intention_ttl: number;
}

export interface Credentials {
    Username: string,
    Password: string
}

export interface fulltokenInfo {
    token: string,
    account_id: string,
    clientId: string,
    displayName: string,
    auth_method: string,
    in_app_id: string,
    internal: boolean,
    expireAt: number,
    client_service: string;
    deviceId: string,
}

export interface tokenInfo {
    token: string,
    account_id: string,
    deviceId?: string,
    clientId: string,
    displayName: string,
    auth_method: 'exchange_code' | 'password' | 'refresh_token' | 'authorization_code' | 'device_auth' ,
    in_app_id: string,
    internal: boolean,
    expireAt: number,
    client_service: string;
}

export interface tokenInfoClient {
    token: string,
    clientId: string,
    auth_method: 'client_credentials',
    internal: boolean,
    expireAt: number,
    client_service: string;
}

interface Router extends IRoute {
    stack: Array<Layer>
}

interface Route {
    path: string,
    stack: any,
    /** @type {Object<String, String>}  */
    methods: Object
}

export interface Layer {
    handle: Router;
    name: 'bound dispatch' | 'router';
    keys: [[Object]];
    regexp: RegExp;
    route: Route | undefined
    path: string;
}


export interface Variant {
    channel: string;
    active: string;
}

export interface Cosmetic {
    type: string;
    items: Array<string>
    variants: Array<Variant>
}

export interface loadout {
    Attributes: {
        use_count: number;
        banner_icon_template: string;
        locker_name: string;
        banner_color_template: string;
        item_seen: boolean;
        favorite: boolean;
    }
    id: string;
    name: string;
    Items: Array<Cosmetic>
}

export interface CloudstorageFile {
    uniqueFilename: string;
    filename: string;
    hash: string;
    hash256: string;
    length: number;
    contentType: string;
    uploaded: Date;
    storageType: string;
    storageIds: {
        DSS: string;
    };
    doNotCache: boolean;
}


export interface Saved_Profile {
    ProfilesRevision: {
        [profile: string]: number;
    };
    revision: number;
    Currency: 0,
    SeasonLevel: 0,
    Favorites: Array<Cosmetic>
    loadouts: Array<loadout>
    CurrentLoadout: string;
    accountId: string;
    purchasedCatalogItems: CatalogEntry[];
}

export namespace Middlewares {
    interface fortniteReq {
        /** @example 'Fortnite' */
        game?: string

        /** @example '++Fortnite+Release-18.00' */
        version?: string

        /** @example '16701187' */
        CL?: string

        /** @example 'Windows' */
        platform?: string

        /** @example 18 */
        season: number

        /** @example '18.00' */
        friendlyVersion: string
    }
}


interface MatchmakingAuth {
    ticketType: string
    payload: string
    signature: string
}

export interface partyMember {
    account_id: string,
    meta: Record<string, string>,
    connections: party.JoinParty.Connection[],
    revision: 0,
    updated_at: String,
    joined_at: String,
    role: "CAPTAIN" | "MEMBER"
}

export interface partyInvite {
    party_id: string,
    sent_by: string,
    meta: Record<string, string>,
    sent_to: string,
    sent_at: Date,
    updated_at: Date,
    expires_at: Date,
    status: string
}

export interface PartyData {
    id: string,
    created_at: string,
    updated_at: string,
    config: party.CreateParty.Config,
    members: partyMember[],
    meta: Record<string, string>,
    invites: any[],
    revision: number
}


export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

declare global {
    namespace Express {
        interface Request {
            clientInfos: Middlewares.fortniteReq
        }

        interface Application {
            httpServer: Server;
        }
    }

    interface Date {
        addSeconds(param: number): this;
        addMinutes(Min: number): this;
        addHours(hours: number): this;
        addDays(param: number): this;
        addWeeks(param: number): this;
        addMonths(param: number): this;
        addYears(param: number): this;
    }

    interface Array<T> {
        /** @file polyfill.js */
        remove(item: any): this;
    }
}

export interface Storefront {
}

export namespace timeline {
    export interface State2 {
        activePurchaseLimitingEventIds: any[];
        storefront: Storefront;
        rmtPromotionConfig: any[];
        storeEnd: Date;
    }

    export interface State {
        validFrom: Date;
        activeEvents: any[];
        state: State2;
    }

    export interface StandaloneStore {
        states: State[];
        cacheExpire: Date;
    }

    export interface OCE {
        eventFlagsForcedOff: string[];
    }

    export interface CN {
        eventFlagsForcedOff: string[];
    }

    export interface REGIONID {
        eventFlagsForcedOff: string[];
    }

    export interface ASIA {
        eventFlagsForcedOff: string[];
    }

    export interface Region {
        OCE: OCE;
        CN: CN;
        REGIONID: REGIONID;
        ASIA: ASIA;
    }

    export interface State4 {
        region: Region;
    }

    export interface State3 {
        validFrom: Date;
        activeEvents: any[];
        state: State4;
    }

    export interface ClientMatchmaking {
        states: State3[];
        cacheExpire: Date;
    }

    export interface State6 {
        k: string[];
    }

    export interface State5 {
        validFrom: Date;
        activeEvents: any[];
        state: State6;
    }

    export interface Tk {
        states: State5[];
        cacheExpire: Date;
    }

    export interface PlaylistCuratedContent {
    }

    export interface PlaylistCuratedHub {
        Playlist_PlaygroundV2: string;
        Playlist_Creative_PlayOnly: string;
    }

    export interface State8 {
        islandCodes: string[];
        playlistCuratedContent: PlaylistCuratedContent;
        playlistCuratedHub: PlaylistCuratedHub;
        islandTemplates: any[];
    }

    export interface State7 {
        validFrom: Date;
        activeEvents: any[];
        state: State8;
    }

    export interface FeaturedIslands {
        states: State7[];
        cacheExpire: Date;
    }

    export interface State10 {
        electionId: string;
        candidates: any[];
        electionEnds: Date;
        numWinners: number;
    }

    export interface State9 {
        validFrom: Date;
        activeEvents: any[];
        state: State10;
    }

    export interface CommunityVotes {
        states: State9[];
        cacheExpire: Date;
    }

    export interface ActiveEvent {
        eventType: string;
        activeUntil: Date;
        activeSince: Date;
    }

    export interface EventNamedWeights {
    }

    export interface ActiveEvent2 {
        instanceId: string;
        devName: string;
        eventName: string;
        eventStart: Date;
        eventEnd: Date;
        eventType: string;
    }

    export interface SectionStoreEnds {
        Featured: Date;
        Daily: Date;
        Featured2?: Date;
        Special?: Date;
    }

    export interface State12 {
        activeStorefronts: any[];
        eventNamedWeights: EventNamedWeights;
        activeEvents: ActiveEvent2[];
        seasonNumber: number;
        seasonTemplateId: string;
        matchXpBonusPoints: number;
        eventPunchCardTemplateId: string;
        seasonBegin: Date;
        seasonEnd: Date;
        seasonDisplayedEnd: Date;
        weeklyStoreEnd: Date;
        stwEventStoreEnd: Date;
        stwWeeklyStoreEnd: Date;
        sectionStoreEnds: SectionStoreEnds;
        rmtPromotion: string;
        dailyStoreEnd: Date;
    }

    export interface State11 {
        validFrom: Date;
        activeEvents: ActiveEvent[];
        state: State12;
    }

    export interface ClientEvents {
        states: State11[];
        cacheExpire: Date;
    }

    export interface Channels {
        'standalone-store': StandaloneStore;
        'client-matchmaking': ClientMatchmaking;
        tk: Tk;
        'featured-islands': FeaturedIslands;
        'community-votes': CommunityVotes;
        'client-events': ClientEvents;
    }

    export interface Calendar {
        channels: Channels;
        cacheIntervalMins: number;
        currentTime: Date;
    }
}


export interface BRShop {
    refreshIntervalHrs: number;
    dailyPurchaseHrs: number;
    expiration: Date;
    storefronts: Storefront[];
}

export interface Storefront {
    name: string;
    catalogEntries: CatalogEntry[];
}

export interface CatalogEntry {
    offerId: string;
    devName: string;
    offerType: OfferType;
    prices: Price[];
    categories: string[];
    dailyLimit: number;
    weeklyLimit: number;
    monthlyLimit: number;
    refundable: boolean;
    appStoreId: string[];
    requirements: Requirement[];
    metaInfo?: MetaInfo[];
    catalogGroup?: CatalogGroup;
    catalogGroupPriority: number;
    sortPriority: number;
    title?: string;
    shortDescription?: ShortDescription;
    description?: string;
    displayAssetPath?: string;
    itemGrants: ItemGrant[];
    giftInfo?: GiftInfo;
    fulfillmentIds?: any[];
    dynamicBundleInfo?: DynamicBundleInfo;
    meta?: Meta;
    matchFilter?: string;
    filterWeight?: number;
    additionalGrants?: any[];
    fulfillmentClass?: string;
}

export enum CatalogGroup {
    Empty = "",
    Shared = "Shared",
    Upgrade = "Upgrade",
}

export interface DynamicBundleInfo {
    discountedBasePrice: number;
    regularBasePrice: number;
    floorPrice: number;
    currencyType: CurrencyType;
    currencySubType: string;
    displayType: string;
    bundleItems: BundleItem[];
}

export interface BundleItem {
    bCanOwnMultiple: boolean;
    regularPrice: number;
    discountedPrice: number;
    alreadyOwnedPriceReduction: number;
    item: Item;
}

export interface Item {
    templateId: string;
    quantity: number;
}

export enum CurrencyType {
    GameItem = "GameItem",
    MtxCurrency = "MtxCurrency",
    RealMoney = "RealMoney",
}

export interface GiftInfo {
    bIsEnabled: boolean;
    forcedGiftBoxTemplateId: string;
    purchaseRequirements: any[];
    giftRecordIds?: any[];
}

export interface ItemGrant {
    templateId: string;
    quantity: number;
    attributes?: Attributes;
}

export interface Attributes {
    Alteration: Alteration;
}

export interface Alteration {
    LootTierGroup: string;
    Tier: number;
}

export interface Meta {
    NewDisplayAssetPath?: string;
    SectionId?: string;
    TileSize?: TileSize;
    AnalyticOfferGroupId?: string;
    FirstSeen?: FirstSeen;
    offertag?: string;
    EncryptionKey?: string;
    ViolatorTag?: string;
    ViolatorIntensity?: string;
    MaxConcurrentPurchases?: string;
    Preroll?: string;
    ProfileId?: string;
    EventLimit?: string;
    PurchaseLimitingEventId?: string;
    StoreToastHeader?: string;
    StoreToastBody?: string;
    open_cardpacks?: string;
}

export enum FirstSeen {
    The11162021 = "11/16/2021",
    The11192021 = "11/19/2021",
    The11212021 = "11/21/2021",
}

export enum TileSize {
    DoubleWide = "DoubleWide",
    Normal = "Normal",
    Small = "Small",
}

export interface MetaInfo {
    key?: string;
    value?: string;
    Key?: Key;
    Value?: string;
}

export enum Key {
    CurrencyAnalyticsName = "CurrencyAnalyticsName",
}

export type OfferType = "DynamicBundle" | "StaticPrice"


export interface Price {
    currencyType: CurrencyType;
    currencySubType: CurrencySubType;
    regularPrice: number;
    dynamicRegularPrice: number;
    finalPrice: number;
    saleExpiration: Date;
    basePrice: number;
    saleType?: string;
}

export enum CurrencySubType {
    AccountResourceCurrencyXrayllama = "AccountResource:currency_xrayllama",
    AccountResourceEventcurrencyScaling = "AccountResource:eventcurrency_scaling",
    AccountResourceEventcurrencySnowballs = "AccountResource:eventcurrency_snowballs",
    AccountResourceVoucherBasicpack = "AccountResource:voucher_basicpack",
    AccountResourceVoucherCardpack2021Anniversary = "AccountResource:voucher_cardpack_2021anniversary",
    AccountResourceVoucherCardpackBronze = "AccountResource:voucher_cardpack_bronze",
    AccountResourceVoucherCardpackJackpot = "AccountResource:voucher_cardpack_jackpot",
    AccountResourceVoucherCustomFirecrackerR = "AccountResource:voucher_custom_firecracker_r",
    Empty = "",
    TokenBattlepassgift = "Token:battlepassgift",
    TokenGiftglowtoken = "Token:giftglowtoken",
}

export interface Requirement {
    requirementType: RequirementType;
    requiredId: string;
    minQuantity: number;
}

export enum RequirementType {
    DenyOnFulfillment = "DenyOnFulfillment",
    DenyOnItemOwnership = "DenyOnItemOwnership",
    RequireFulfillment = "RequireFulfillment",
    RequireItemOwnership = "RequireItemOwnership",
}

export enum ShortDescription {
    BattlePass25Levels = "Battle Pass + 25 levels!",
    Chapter2Season1 = "Chapter 2 - Season 1",
    Chapter2Season8 = "Chapter 2 - Season 8",
    Empty = "",
    Season18 = "Season 18",
}


export namespace profile {
    export interface Profile {
        _id?: string;
        created: string;
        updated: string;
        rvn: number;
        wipeNumber: number;
        accountId: string;
        profileId: ProfileID;
        version?: string;
        items: { [key: string]: ItemValue };
        stats: Stats;
        commandRevision: number;
    }

    export interface Category {
        items: (string | null)[],
        activeVariants: ({
            "channel": string,
            "active": string
        } | null)[]
    }

    export type categories =
        'Backpack' |
        'VictoryPose' |
        'LoadingScreen' |
        'Character' |
        'Glider' | 'Dance' |
        'CallingCard' |
        'ConsumableEmote' |
        'MapMarker' |
        'Charm' |
        'SkyDiveContrail' |
        'Hat' |
        'PetSkin' |
        'ItemWrap' |
        'MusicPack' |
        'BattleBus' |
        'Pickaxe' |
        'VehicleDecoration'

    export interface locker {
        templateId: "CosmeticLocker:cosmeticlocker_athena",
        attributes: {
            locker_slots_data: {
                slots: Record<categories, Category>
            },
            use_count: 1,
            banner_icon_template: "galileob",
            banner_color_template: "standardbanner1",
            locker_name: "",
            item_seen: false,
            favorite: false
        },
        quantity: 1
    }

    export interface ItemValue {
        templateId: string;
        attributes: {
            [key: string]: any
        };
        quantity: number;
    }

    export interface ItemAttributes {
        access_item?: string;
        has_unlock_by_completion?: boolean;
        num_quests_completed?: number;
        level?: number;
        grantedquestinstanceids?: string[];
        item_seen?: ItemSeen;
        max_allowed_bundle_level?: number;
        num_granted_bundle_quests?: number;
        max_level_bonus?: number;
        challenge_bundle_schedule_id?: string;
        num_progress_quests_completed?: number;
        xp?: number;
        favorite?: boolean;
        completion_bits?: number[];
        bundle_level?: number;
        progress_tracker?: ProgressTracker[];
        bundle_max_allowed_level?: number;
        completion_times?: number[];
        bundle_template?: string;
        bundle_id?: string;
        creation_time?: string;
        playlists?: string[];
        sent_new_notification?: boolean;
        challenge_bundle_id?: string;
        xp_reward_scalar?: number;
        challenge_linked_quest_given?: string;
        quest_pool?: string;
        quest_state?: QuestState;
        bucket?: Bucket;
        last_state_change_time?: string;
        challenge_linked_quest_parent?: string;
        quest_rarity?: QuestRarity;
        completion_s18_complete_dire_wolfpack_q03_obj0?: number;
        unlock_epoch?: string;
        granted_bundles?: string[];
        alt_profile_types?: ProfileID[];
        _private?: boolean;
        devName?: string;
        conditions?: Conditions;
        earned_count?: number;
        last_earned_day?: number;
        rnd_sel_cnt?: number;
        variants?: AttributesVariant[];
        completion_s18_complete_penny_buildpassion_q01_obj0?: number;
        completion_s18_complete_ghosthunter_monsterresearch_q04_obj0?: number;
        completion_s18_complete_darkjonesy_spookystory_q04_obj0?: number;
        completion_s18_complete_babayaga_newbrew_q02_obj0?: number;
        completion_bars_donated_wareffort?: number;
        completion_s18_complete_bistroastronaut_monsterhunter_q04_obj0?: number;
        completion_s18_complete_darkjonesy_theoraclespeaks_q01_obj0?: number;
        completion_s18_complete_nitehare_hopawake_q01_obj0?: number;
        completion_s18_complete_spacechimpsuit_wareffort_q03_obj0?: number;
        completion_s18_complete_punkkoi_ioheist_q04_obj0?: number;
        completion_s18_complete_ghosthunter_monsterresearch_q03_obj0?: number;
        completion_s18_complete_raven_darkskies_q02_obj0?: number;
        completion_s18_complete_penny_buildpassion_q02_obj0?: number;
        completion_s18_complete_ember_fireyoga_q04_obj0?: number;
        completion_s18_complete_bigmouth_toothache_q04_obj0?: number;
        days_since_season_start_grant?: number;
        reduced_xp_reward?: number;
        granter_quest_pack?: string;
        card_season_num?: number;
        replaced_rested_xp_value?: number;
        replaced_rested_xp_value_scalar_for_missed_days?: number;
        completion_s18_complete_punkkoi_ioheist_q01_obj0?: number;
        completion_creative_playtime_2?: number;
        completion_s18_complete_dire_wolfpack_q04_obj0?: number;
        completion_s18_complete_rustlord_scrapking_q03_obj0?: number;
        completion_s18_complete_headbandk_fortjutsu_q04_obj0?: number;
        completion_s18_complete_scubajonesy_surfturf_q03_obj0?: number;
        completion_s18_complete_teriyakifishtoon_scarredexploration_q03_obj0?: number;
        completion_s18_complete_darkjonesy_theoraclespeaks_q04_obj0?: number;
        completion_s18_complete_ragsy_shieldtechniques_q02_obj0?: number;
        completion_s18_complete_headbandk_fortjutsu_q05_obj0?: number;
        completion_s18_complete_scubajonesy_surfturf_q04_obj0?: number;
        completion_s18_complete_rustlord_scrapking_q02_obj0?: number;
        completion_s18_complete_ember_fireyoga_q01_obj0?: number;
        completion_quest_s18_repeatable_tr_elim_sniper_obj0?: number;
        completion_creative_playtime_4?: number;
        completion_s18_complete_darkjonesy_theoraclespeaks_q02_obj0?: number;
        completion_s18_complete_ragsy_shieldtechniques_q01_obj0?: number;
        completion_s18_complete_wrath_escapedtenant_q02_obj0?: number;
        completion_creative_playtime_0?: number;
        completion_s18_complete_thebrat_hotdog_q01_obj0?: number;
        completion_quest_s18_repeatable_completedailypunchcards_obj0?: number;
        cosmetic_item?: string;
        variant_name?: string;
        create_giftbox?: boolean;
        mark_item_unseen?: boolean;
        custom_giftbox?: string;
        auto_equip_variant?: boolean;
        variant_channel?: string;
        completion_s18_complete_dire_wolfpack_q05_obj0?: number;
        completion_s18_complete_bistroastronaut_monsterhunter_q01_obj0?: number;
        completion_s18_complete_punkkoi_ioheist_q03_obj0?: number;
        completion_s18_complete_thebrat_hotdog_q03_obj0?: number;
        completion_s18_complete_ember_fireyoga_q03_obj0?: number;
        completion_s18_complete_raven_darkskies_q05_obj0?: number;
        completion_s18_complete_bistroastronaut_monsterhunter_q05_obj0?: number;
        completion_quest_s18_repeatable_dealdamagesmgs_q01_obj0?: number;
        completion_s18_complete_dire_wolfpack_q01_obj0?: number;
        completion_s18_complete_dusk_vampirecombat_q04_obj0?: number;
        completion_s18_complete_ragsy_shieldtechniques_q04_obj0?: number;
        completion_s18_complete_ragsy_shieldtechniques_q05_obj0?: number;
        completion_s18_complete_teriyakifishtoon_scarredexploration_q01_obj0?: number;
        completion_s18_complete_bigmouth_toothache_q02_obj0?: number;
        seasonItemStateList?: any[];
        completion_s18_complete_darkjonesy_spookystory_q02_obj0?: number;
        completion_s18_complete_penny_buildpassion_q05_obj0?: number;
        completion_quest_s18_event_horderush_q02_obj0?: number;
        completion_s18_complete_kitbash_makingfriends_q02_obj0?: number;
        completion_quest_s18_repeatable_tr_elim_assault_obj0?: number;
        completion_s18_complete_kitbash_makingfriends_q01_obj0?: number;
        completion_s18_complete_pitstop_stunttraining_q02_obj0?: number;
        completion_s18_complete_nitehare_hopawake_q03_obj0?: number;
        completion_s18_complete_nitehare_hopawake_q02_obj0?: number;
        completion_s18_complete_sledgehammer_battleorders_q03_obj0?: number;
        completion_s18_complete_penny_buildpassion_q04_obj0?: number;
        completion_s18_complete_bigmouth_toothache_q05_obj0?: number;
        completion_visit_location_pleasantpark?: number;
        completion_visit_location_nightmarejungle?: number;
        completion_visit_location_retailrow?: number;
        completion_visit_location_carl?: number;
        completion_visit_location_sunnyshores?: number;
        completion_visit_location_frenzyfarm?: number;
        completion_visit_location_cattycorner?: number;
        completion_visit_location_saltysprings?: number;
        completion_visit_location_shadowagency?: number;
        completion_visit_location_dirtydocks?: number;
        completion_visit_location_slurpyswamp?: number;
        completion_visit_location_fortilla?: number;
        completion_visit_location_lazylake?: number;
        completion_impossible_poi_of_permanence?: number;
        completion_visit_location_heroesharvest?: number;
        completion_visit_location_theconvergence?: number;
        completion_visit_location_oilrigislands?: number;
        completion_visit_location_saltytowers?: number;
        completion_visit_location_hollyhedgesupdate?: number;
        completion_visit_location_huntershaven?: number;
        completion_visit_location_thecoliseum?: number;
        completion_visit_location_beachybluffs?: number;
        completion_visit_location_maintower?: number;
        completion_visit_location_weepingwoods?: number;
        completion_visit_location_governmentcomplex?: number;
        completion_visit_location_tomatolab?: number;
        completion_visit_location_hollyhedges?: number;
        completion_visit_location_powerplant?: number;
        completion_visit_location_mountainmeadow?: number;
        completion_s18_complete_grimfable_wolfactivity_q01_obj0?: number;
        completion_s18_complete_shadowops_impromptutactical_q05_obj0?: number;
        completion_s18_complete_punkkoi_ioheist_q05_obj0?: number;
        completion_s18_complete_nitehare_hopawake_q05_obj0?: number;
        completion_s18_complete_ragsy_shieldtechniques_q03_obj0?: number;
        completion_s18_complete_pitstop_stunttraining_q01_obj0?: number;
        completion_s18_complete_darkjonesy_spookystory_q05_obj0?: number;
        completion_s18_complete_scubajonesy_surfturf_q02_obj0?: number;
        completion_s18_complete_thebrat_hotdog_q05_obj0?: number;
        completion_s18_complete_madcap_mushroommaster_q04_obj0?: number;
        completion_s18_complete_headbandk_fortjutsu_q02_obj0?: number;
        completion_s18_complete_headbandk_fortjutsu_q03_obj0?: number;
        completion_s18_complete_division_sniperelite_q03_obj0?: number;
        completion_s18_complete_madcap_mushroommaster_q03_obj0?: number;
        completion_s18_complete_grimfable_wolfactivity_q02_obj0?: number;
        completion_s18_complete_ember_fireyoga_q02_obj0?: number;
        completion_s18_complete_thebrat_hotdog_q02_obj0?: number;
        completion_s18_complete_grimfable_wolfactivity_q05_obj0?: number;
        completion_s18_complete_division_sniperelite_q02_obj0?: number;
        completion_s18_complete_wrath_escapedtenant_q05_obj0?: number;
        completion_s18_complete_wrath_escapedtenant_q04_obj0?: number;
        completion_s18_complete_darkjonesy_theoraclespeaks_q03_obj0?: number;
        completion_s18_complete_darkjonesy_spookystory_q01_obj0?: number;
        completion_s18_complete_rustlord_scrapking_q04_obj0?: number;
        completion_quest_s18_repeatable_eliminateplayers_obj0?: number;
        expiry_time?: string;
        completion_s18_complete_teriyakifishtoon_scarredexploration_q04_obj0?: number;
        completion_s18_complete_wrath_escapedtenant_q03_obj0?: number;
        completion_s18_complete_sledgehammer_battleorders_q05_obj0?: number;
        completion_s18_complete_shadowops_impromptutactical_q01_obj0?: number;
        completion_s18_complete_pitstop_stunttraining_q05_obj0?: number;
        completion_s18_complete_kitbash_makingfriends_q04_obj0?: number;
        completion_s18_complete_darkjonesy_theoraclespeaks_q05_obj0?: number;
        completion_quest_s18_transient_division_sniperelite_q01_obj0?: number;
        completion_s18_complete_babayaga_newbrew_q04_obj0?: number;
        completion_s18_complete_raven_darkskies_q03_obj0?: number;
        completion_s18_complete_scubajonesy_surfturf_q01_obj0?: number;
        completion_s18_complete_bistroastronaut_monsterhunter_q02_obj0?: number;
        completion_s18_complete_madcap_mushroommaster_q01_obj0?: number;
        completion_s18_complete_division_sniperelite_q04_obj0?: number;
        completion_s18_complete_kitbash_makingfriends_q03_obj0?: number;
        completion_s18_complete_cerealbox_partylocale_q01_obj0?: number;
        completion_quest_s18_feat_reach_seasonlevel_obj0?: number;
        completion_s18_complete_ember_fireyoga_q05_obj0?: number;
        completion_s18_complete_shadowops_impromptutactical_q03_obj0?: number;
        completion_s18_complete_headbandk_fortjutsu_q01_obj0?: number;
        completion_s18_complete_madcap_mushroommaster_q05_obj0?: number;
        completion_s18_complete_pitstop_stunttraining_q04_obj0?: number;
        completion_quest_s18_repeatable_completedailypunches_obj0?: number;
        completion_s18_complete_rustlord_scrapking_q05_obj0?: number;
        completion_s18_complete_babayaga_newbrew_q05_obj0?: number;
        completion_s18_complete_punkkoi_ioheist_q02_obj0?: number;
        completion_s18_complete_spacechimpsuit_wareffort_q05_obj0?: number;
        completion_s18_complete_thebrat_hotdog_q04_obj0?: number;
        completion_s18_complete_cerealbox_partylocale_q03_obj0?: number;
        completion_s18_complete_teriyakifishtoon_scarredexploration_q02_obj0?: number;
        completion_s18_complete_grimfable_wolfactivity_q03_obj0?: number;
        completion_s18_complete_bistroastronaut_monsterhunter_q03_obj0?: number;
        completion_s18_complete_raven_darkskies_q04_obj0?: number;
        completion_s18_complete_ghosthunter_monsterresearch_q05_obj0?: number;
        completion_s18_complete_kitbash_makingfriends_q05_obj0?: number;
        completion_quest_s18_event_horderush_q04_obj0?: number;
        completion_s18_complete_rustlord_scrapking_q01_obj0?: number;
        completion_s18_complete_nitehare_hopawake_q04_obj0?: number;
        completion_s18_complete_sledgehammer_battleorders_q04_obj0?: number;
        completion_s18_complete_cerealbox_partylocale_q02_obj0?: number;
        completion_s18_complete_spacechimpsuit_wareffort_q04_obj0?: number;
        completion_s18_complete_raven_darkskies_q01_obj0?: number;
        completion_s18_complete_bigmouth_toothache_q01_obj0?: number;
        completion_s18_complete_division_sniperelite_q05_obj0?: number;
        completion_s18_complete_madcap_mushroommaster_q02_obj0?: number;
        completion_s18_complete_ghosthunter_monsterresearch_q01_obj0?: number;
        completion_themarch_complete?: number;
        completion_s18_complete_dusk_vampirecombat_q03_obj0?: number;
        completion_s18_complete_teriyakifishtoon_scarredexploration_q05_obj0?: number;
        completion_s18_complete_dusk_vampirecombat_q02_obj0?: number;
        completion_s18_complete_wrath_escapedtenant_q01_obj0?: number;
        completion_s18_complete_pitstop_stunttraining_q03_obj0?: number;
        completion_s18_complete_dusk_vampirecombat_q01_obj0?: number;
        locker_slots_data?: LockerSlotsData;
        use_count?: number;
        banner_icon_template?: string;
        banner_color_template?: string;
        locker_name?: string;
        completion_s18_complete_penny_buildpassion_q03_obj0?: number;
        completion_s18_complete_spacechimpsuit_wareffort_q01_obj0?: number;
        completion_s18_complete_dire_wolfpack_q02_obj0?: number;
        completion_s18_complete_cerealbox_partylocale_q05_obj0?: number;
        completion_quest_s18_repeatable_catch_air_vehicle_obj0?: number;
        completion_s18_complete_sledgehammer_battleorders_q02_obj0?: number;
        completion_quest_s18_event_horderush_q03_obj0?: number;
        completion_s18_complete_ghosthunter_monsterresearch_q02_obj0?: number;
        completion_s18_complete_spacechimpsuit_wareffort_q02_obj0?: number;
        completion_creative_playtime_1?: number;
        completion_s18_complete_sledgehammer_battleorders_q01_obj0?: number;
        completion_quest_s18_repeatable_tr_eliminateplayers_obj0?: number;
        completion_visit_landmark_basecampgolf?: number;
        completion_visit_namedpoi_tomatowater?: number;
        completion_visit_papaya_mountainpeak?: number;
        completion_visit_landmark_mountf8?: number;
        completion_visit_landmark_beachrentals?: number;
        completion_visit_landmark_cabin?: number;
        completion_visit_landmark_fortruin?: number;
        completion_visit_landmark_heroespark?: number;
        completion_visit_landmark_jetlanding_06?: number;
        completion_visit_landmark_jetlanding_05?: number;
        completion_visit_landmark_pizzapitbarge?: number;
        completion_visit_landmark_jetlanding_04?: number;
        completion_visit_landmark_jetlanding_02?: number;
        completion_visit_landmark_workshop?: number;
        completion_visit_landmark_jetlanding_01?: number;
        completion_visit_landmark_icehotel?: number;
        completion_visit_landmark_theyacht2?: number;
        completion_visit_landmark_islandlodge?: number;
        completion_visit_landmark_iohub_e6?: number;
        completion_visit_landmark_tantorsphere?: number;
        completion_visit_landmark_tomatotown?: number;
        completion_visit_landmark_jetlanding_09?: number;
        completion_visit_landmark_jetlanding_08?: number;
        completion_visit_landmark_jetlanding_07?: number;
        completion_visit_landmark_bigbridgeyellow?: number;
        completion_visit_landmark_butterbarn?: number;
        completion_visit_landmark_spybase_grottoruins?: number;
        completion_visit_landmark_iohub_d1?: number;
        completion_visit_landmark_riskyreels?: number;
        completion_visit_landmark_overgrownheads?: number;
        completion_visit_landmark_spybase_boxfactory?: number;
        completion_visit_landmark_sirenisland?: number;
        completion_visit_landmark_crashsite_03?: number;
        completion_visit_landmark_crashsite_04?: number;
        completion_visit_landmark_crashsite_05?: number;
        completion_visit_landmark_sharkremains?: number;
        completion_visit_papaya_boatracesouth?: number;
        completion_visit_landmark_crashsite_01?: number;
        completion_visit_landmark_outpost_delta?: number;
        completion_visit_landmark_crashsite_02?: number;
        completion_visit_landmark_loverslookout?: number;
        completion_visit_landmark_ruin?: number;
        completion_visit_landmark_remotehouse?: number;
        completion_visit_landmark_outpost_echo?: number;
        completion_visit_landmark_forkknifetruck?: number;
        completion_visit_landmark_bstore?: number;
        completion_visit_landmark_arenafloor5?: number;
        completion_visit_namedpoi_spybase_mountainbase?: number;
        completion_visit_landmark_hatch_c?: number;
        completion_visit_landmark_mounth7?: number;
        completion_visit_landmark_basecampfoxtrot?: number;
        completion_visit_landmark_hatch_a?: number;
        completion_visit_landmark_hatch_b?: number;
        completion_visit_landmark_waterfallgorge?: number;
        completion_visit_landmark_carman?: number;
        completion_visit_landmark_spybase_teddybearspies?: number;
        completion_visit_landmark_beachsidemansion?: number;
        completion_visit_landmark_greasygrove?: number;
        completion_visit_landmark_bonfirecampsite?: number;
        completion_visit_landmark_bigbridgepurple?: number;
        completion_visit_landmark_trophy?: number;
        completion_visit_landmark_jetlanding_17?: number;
        completion_visit_landmark_jetlanding_16?: number;
        completion_visit_landmark_boatsales?: number;
        completion_visit_landmark_jetlanding_15?: number;
        completion_visit_landmark_toilettitan?: number;
        completion_visit_landmark_jetlanding_14?: number;
        completion_visit_landmark_jetlanding_13?: number;
        completion_visit_landmark_jetlanding_12?: number;
        completion_visit_landmark_friendlycube?: number;
        completion_visit_landmark_powerdam?: number;
        completion_visit_landmark_jetlanding_11?: number;
        completion_visit_landmark_jetlanding_10?: number;
        completion_visit_landmark_arenafloor3?: number;
        completion_visit_landmark_lawnmowerraces?: number;
        completion_visit_landmark_arenafloor4?: number;
        completion_visit_landmark_arenafloor1?: number;
        completion_visit_landmark_pipeplayground?: number;
        completion_visit_namedpoi_glasscases?: number;
        completion_visit_landmark_bigbridgeblue?: number;
        completion_visit_landmark_flopperpond?: number;
        completion_visit_landmark_hiddenufo_04?: number;
        completion_visit_landmark_hiddenufo_03?: number;
        completion_visit_landmark_hiddenufo_02?: number;
        completion_visit_landmark_hiddenufo_01?: number;
        completion_visit_landmark_outpost_beta?: number;
        completion_visit_landmark_iceblockfactory?: number;
        completion_visit_landmark_bigdoghouse?: number;
        completion_visit_landmark_boatlaunch?: number;
        completion_visit_landmark_bushface?: number;
        completion_visit_landmark_crashedcargo?: number;
        completion_visit_landmark_boatrace?: number;
        completion_visit_landmark_tallestmountain?: number;
        completion_visit_landmark_pizzapetetruck?: number;
        completion_visit_landmark_hiddenufo_05?: number;
        completion_visit_landmark_stumpyridge?: number;
        completion_visit_landmark_buoyboat?: number;
        completion_visit_papaya_gliderdrop?: number;
        completion_visit_landmark_spybase_recruitmentofficealter?: number;
        completion_visit_landmark_campcod?: number;
        completion_visit_landmark_outpost_charlie?: number;
        completion_visit_landmark_stackshack?: number;
        completion_visit_landmark_sheriffoffice?: number;
        completion_visit_landmark_convoy_10?: number;
        completion_visit_landmark_datehouse?: number;
        completion_visit_namedpoi_spybase_yacht?: number;
        completion_visit_landmark_toyfactory?: number;
        completion_impossible_landmark_of_permanence?: number;
        completion_visit_landmark_pipeperson?: number;
        completion_visit_papaya_fishingpond?: number;
        completion_visit_landmark_outpost_rockface?: number;
        completion_visit_landmark_crashedhelicopter?: number;
        completion_visit_landmark_chair?: number;
        completion_visit_papaya_thehub?: number;
        completion_visit_landmark_basecamphotel?: number;
        completion_visit_papaya_boatramps?: number;
        completion_visit_landmark_restaurantgas?: number;
        completion_visit_landmark_iohub_f4?: number;
        completion_visit_landmark_dustydepot?: number;
        completion_visit_landmark_shipwreckcove?: number;
        completion_visit_namedpoi_tomatosphere?: number;
        completion_visit_landmark_scrapyard?: number;
        completion_visit_landmark_weatherstation?: number;
        completion_visit_landmark_friendmonument?: number;
        completion_visit_landmark_flushfactory?: number;
        completion_visit_landmark_bigbridgegreen?: number;
        completion_visit_landmark_snowconetruck?: number;
        completion_visit_landmark_awakestatue?: number;
        completion_visit_landmark_spybase_undergroundradiostation?: number;
        completion_visit_papaya_giantskeleton?: number;
        completion_visit_landmark_holidaystore?: number;
        completion_visit_landmark_onyxsphere?: number;
        completion_visit_landmark_mountaindanceclub?: number;
        completion_visit_landmark_throne?: number;
        completion_visit_landmark_noahhouse?: number;
        completion_visit_landmark_toiletthrone?: number;
        completion_visit_namedpoi_spybase_shark?: number;
        completion_visit_landmark_bobsbluff?: number;
        completion_visit_landmark_outpost_primalpond?: number;
        completion_visit_landmark_radardish_04?: number;
        completion_visit_landmark_radardish_03?: number;
        completion_visit_landmark_radardish_02?: number;
        completion_visit_landmark_radardish_01?: number;
        completion_visit_landmark_highhoop?: number;
        completion_visit_landmark_radardish_07?: number;
        completion_visit_landmark_radardish_06?: number;
        completion_visit_landmark_radardish_05?: number;
        completion_visit_landmark_fishfarm?: number;
        completion_visit_landmark_outpost_02?: number;
        completion_visit_landmark_convoy_01?: number;
        completion_visit_landmark_outpost_01?: number;
        completion_visit_landmark_convoy_02?: number;
        completion_visit_landmark_outpost_04?: number;
        completion_visit_landmark_convoy_03?: number;
        completion_visit_landmark_agencyhq?: number;
        completion_visit_landmark_outpost_03?: number;
        completion_visit_landmark_convoy_04?: number;
        completion_visit_landmark_convoy_05?: number;
        completion_visit_landmark_outpost_05?: number;
        completion_visit_landmark_convoy_06?: number;
        completion_visit_landmark_convoy_07?: number;
        completion_visit_landmark_convoy_08?: number;
        completion_visit_landmark_sentinelgraveyard?: number;
        completion_visit_landmark_convoy_09?: number;
        completion_visit_landmark_turbo?: number;
        completion_visit_boogieboat?: number;
        completion_visit_landmark_mountainvault?: number;
        completion_visit_landmark_spybase_undergroundgasstation?: number;
        completion_visit_landmark_bigbridgered?: number;
        completion_visit_landmark_unremarkableshack?: number;
        completion_visit_landmark_crackshotscabin?: number;
        completion_visit_landmark_suburban_abandonedhouse?: number;
        completion_visit_namedpoi_spybase_oilrig?: number;
        completion_visit_landmark_swampville?: number;
        completion_visit_landmark_dateroom?: number;
        completion_visit_namedpoi_tomatohouse?: number;
        completion_visit_landmark_beachbus?: number;
        completion_visit_landmark_durrrburgertruck?: number;
        completion_visit_landmark_icechair?: number;
        completion_visit_landmark_corruptedisland?: number;
        completion_visit_landmark_radiostation?: number;
        completion_visit_landmark_lawoffice?: number;
        completion_visit_papaya_theater?: number;
        completion_visit_landmark_canoerentals?: number;
        completion_visit_papaya_obstaclecourse?: number;
        completion_visit_papaya_racecenter?: number;
        completion_visit_landmark_outpost_cattycornergarage?: number;
        completion_visit_landmark_angryapples?: number;
        completion_visit_landmark_captaincarpstruck?: number;
        completion_visit_landmark_cliffsideruinedhouses?: number;
        completion_visit_landmark_digsite?: number;
        completion_visit_landmark_hayhillbilly?: number;
        completion_visit_landmark_lazylakeisland?: number;
        completion_visit_papaya_piratecove?: number;
        completion_visit_landmark_hilltophouse?: number;
        completion_visit_papaya_mainstage?: number;
        completion_visit_landmark_sawmill?: number;
        completion_visit_papaya_secretbeach?: number;
        completion_visit_landmark_crashedairplane?: number;
        completion_visit_papaya_soccerfield?: number;
        completion_visit_landmark_spybase_recruitmentofficeego?: number;
        completion_visit_landmark_cosmoscrashsite?: number;
        completion_visit_landmark_towerruins?: number;
        completion_visit_landmark_steelfarm?: number;
        completion_visit_landmark_coralcove?: number;
        completion_visit_landmark_lighthouse?: number;
        completion_visit_landmark_outpost_goldenisland?: number;
        completion_visit_landmark_zpoint?: number;
        completion_visit_landmark_vikingvillage?: number;
        completion_visit_landmark_outpost_alpha?: number;
        completion_visit_landmark_outpost_outsidetower4?: number;
        completion_visit_landmark_rapidsrest?: number;
        completion_visit_landmark_outpost_outsidetower3?: number;
        completion_visit_landmark_outpost_outsidetower2?: number;
        completion_visit_landmark_outpost_outsidetower1?: number;
        completion_visit_landmark_kitskantina?: number;
        completion_visit_landmark_homelyhills?: number;
        completion_visit_landmark_outpost_outsidetower6?: number;
        completion_visit_landmark_outpost_outsidetower5?: number;
        completion_visit_landmark_spybase_undergroundsoccerfield?: number;
        completion_visit_papaya_boatraceeast?: number;
        completion_visit_landmark_spybase_spyobstaclecourse?: number;
        completion_s18_complete_division_sniperelite_q01_obj0?: number;
        banner_id?: string;
        completion_s18_complete_babayaga_newbrew_q01_obj0?: number;
        completion_creative_playtime_3?: number;
        completion_s18_complete_cerealbox_partylocale_q04_obj0?: number;
        completion_quest_s18_repeatable_interact_freezer_obj0?: number;
        completion_quest_s18_repeatable_completequestsbistroastronaut_obj0?: number;
        completion_quest_s18_transient_grimfable_wolfactivity_q01_obj2?: number;
        completion_quest_s18_transient_grimfable_wolfactivity_q01_obj1?: number;
        completion_quest_s18_transient_grimfable_wolfactivity_q01_obj0?: number;
        completion_s18_complete_babayaga_newbrew_q03_obj0?: number;
        completion_s18_complete_scubajonesy_surfturf_q05_obj0?: number;
        completion_s18_complete_shadowops_impromptutactical_q04_obj0?: number;
        completion_s18_complete_grimfable_wolfactivity_q04_obj0?: number;
        completion_s18_complete_dusk_vampirecombat_q05_obj0?: number;
        completion_quest_s18_repeatable_useshieldpotions_obj0?: number;
        completion_quest_s18_repeatable_craftweapons_q01_obj0?: number;
        completion_s18_complete_shadowops_impromptutactical_q02_obj0?: number;
        completion_s18_complete_bigmouth_toothache_q03_obj0?: number;
        completion_s18_complete_darkjonesy_spookystory_q03_obj0?: number;
    }

    export type ProfileID =
        "athena" |
        "common_core" |
        "campaign" |
        "collection" |
        "creative" |
        "common_public" |
        "profile0" |
        "outpost0" |
        "metadata" |
        "collection_book_schematics0" |
        "theater0" |
        "collection_book_people0"

    export type Bucket =
        "BR" |
        "" |
        "HordeRush" |
        "TeamRumble"

    export interface Conditions {
        event: Event;
    }

    export interface Event {
        instanceId: string;
        eventName: string;
        eventStart: string;
        eventEnd: string;
        startActions: StartActions;
        endActions: EndActions;
        metaData: CompetitiveIdentity;
    }

    export interface EndActions {
        hasRun: boolean;
        conversions: any[];
        itemsToRemove: ItemsTo[];
        questsToPause: any[];
    }

    export interface ItemsTo {
        templateId: string;
        quantity: number;
    }

    export interface CompetitiveIdentity {
    }

    export interface StartActions {
        hasRun: boolean;
        conversions: any[];
        itemsToGrant: ItemsTo[];
        questsToUnpause: any[];
    }

    export type ItemSeen = boolean | number;

    export interface LockerSlotsData {
        slots: Slots;
    }

    export interface Slots {
        ItemWrap: ItemWrap;
        Dance: Backpack;
        Pickaxe: Backpack;
        LoadingScreen: Backpack;
        Glider: Backpack;
        SkyDiveContrail: Backpack;
        MusicPack: MusicPack;
        Character?: Character;
        Backpack?: Backpack;
    }

    export interface Backpack {
        items: string[];
        activeVariants: null[];
    }

    export interface Character {
        items: string[];
        activeVariants: ActiveVariant[];
    }

    export interface ActiveVariant {
        variants: ActiveVariantVariant[];
    }

    export interface ActiveVariantVariant {
        channel: string;
        active: string;
    }

    export interface ItemWrap {
        items: ItemElement[];
        activeVariants: null[];
    }

    export type ItemElement =
        "AthenaItemWrap:wrap_098_birthday2019" |
        "AthenaItemWrap:wrap_223_fryangles"


    export interface MusicPack {
        items: string[];
        activeVariants?: null[];
    }

    export interface ProgressTracker {
        questTemplate: string;
        partialData: PartialDatum[];
    }

    export interface PartialDatum {
        objectiveName: string;
        count: number;
    }

    export type QuestRarity =
        "common" |
        "rare" |
        "uncommon"


    export type QuestState =
        "Active" |
        "Claimed"

    export interface AttributesVariant {
        channel: string;
        active: string;
        owned: string[];
    }

    export interface Stats {
        templateId?: string;
        attributes: {
            [key: string]: any
        };
    }

    export interface StatsAttributes {
        use_random_loadout: boolean;
        past_seasons: PastSeason[];
        season_match_boost: number;
        loadouts: string[];
        style_points: number;
        mfa_reward_claimed: boolean;
        rested_xp_overflow: number;
        quest_manager: QuestManager;
        book_level: number;
        season_num: number;
        season_update: number;
        book_xp: number;
        creative_dynamic_xp: CreativeDynamicXP;
        permissions: any[];
        battlestars: number;
        battlestars_season_total: number;
        alien_style_points: number;
        party_assist_quest: string;
        lifetime_wins: number;
        book_purchased: boolean;
        purchased_battle_pass_tier_offers: CompetitiveIdentity;
        rested_xp_exchange: number;
        level: number;
        xp_overflow: number;
        rested_xp: number;
        rested_xp_mult: number;
        season_first_tracking_bits: any[];
        accountLevel: number;
        competitive_identity: CompetitiveIdentity;
        inventory_limit_bonus: number;
        pinned_quest: string;
        last_applied_loadout: string;
        daily_rewards: CompetitiveIdentity;
        xp: number;
        season_friend_match_boost: number;
        purchased_bp_offers: PurchasedBpOffer[];
        last_match_end_datetime: string;
        last_stw_accolade_transfer_datetime: string;
        active_loadout_index: number;
    }

    export interface CreativeDynamicXP {
        timespan: number;
        bucketXp: number;
        bankXp: number;
        bankXpMult: number;
        dailyExcessXpMult: number;
        currentDayXp: number;
        currentDay: number;
    }

    export interface PastSeason {
        seasonNumber: number;
        numWins: number;
        numHighBracket: number;
        numLowBracket: number;
        seasonXp: number;
        seasonLevel: number;
        bookXp: number;
        bookLevel: number;
        purchasedVIP: boolean;
    }

    export interface PurchasedBpOffer {
        offerId: string;
        bIsFreePassReward: boolean;
        purchaseDate: string;
        lootResult: LootResult[];
        currencyType: CurrencyType;
        totalCurrencyPaid: number;
    }

    export type CurrencyType = "battlestars"

    export interface LootResult {
        itemType: string;
        itemGuid: string;
        itemProfile: ProfileID;
        quantity: number;
        attributes?: LootResultAttributes;
    }

    export interface LootResultAttributes {
        platform: string;
    }

    export interface QuestManager {
        dailyLoginInterval: string;
        dailyQuestRerolls: number;
    }
}




export interface pastSeasons {
    result: boolean;
    lang: string;
    seasons: {
        season: number;
        chapter: number;
        seasonInChapter: number;
        displayName: string;
        startDate: string;
        endDate: string;
        patchList: {
            version: string;
            date: string;
        }[];
    }[]
}


