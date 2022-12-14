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
    auth_method: 'exchange_code' | 'password' | 'refresh_token' | 'authorization_code' | 'device_auth',
    in_app_id: string,
    internal: boolean,
    expireAt: Date,
    client_service: string;
}

export interface tokenInfoClient {
    token: string,
    clientId: string,
    auth_method: 'client_credentials',
    internal: boolean,
    expireAt: Date,
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

export interface TimelineSaved {
    note: string;
    affectedSeason: number;
    EventFlags: string[];
    affectedVersion?: string[];
    dynamicBackground?: string;
    excludedVersion?: string[];
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
        build: string

        /** @example 16701187 */
        CL: number

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

interface MMSpayload {
    playerId: string,
    partyPlayerIds: string[],
    bucketId: string,
    attributes: Record<string, string>,
    expireAt: Date,
    nonce: string
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
    expiration: string;
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
        attributes: ItemAttributes;
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
        squad_id?: string,
        squad_slot_idx?: number,
        variants?: AttributesVariant[];
        cosmetic_item?: string;
        variant_name?: string;
        create_giftbox?: boolean;
        mark_item_unseen?: boolean;
        custom_giftbox?: string;
        auto_equip_variant?: boolean;
        variant_channel?: string;
        [key: string]: any
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
        "theater0" | "theater1" | "theater2" |
        "collection_book_people0" | 'collections'

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
        startActions: any;
        endActions: any;
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

    export interface DailyRewards {
        "nextDefaultReward": number,
        "totalDaysLoggedIn": number,
        "lastClaimDate": string,
        "additionalSchedules": {
            "founderspackdailyrewardtoken": {
                "rewardsClaimed": number,
                "claimedToday": boolean
            }
        }
    }

    export interface StartActions {
        hasRun: boolean;
        conversions: any[];
        itemsToGrant: ItemsTo[];
        questsToUnpause: any[];
        eventCurrencyToSet: any
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
        attributes: Partial<StatsAttributes>
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
        daily_rewards: DailyRewards;
        xp: number;
        season_friend_match_boost: number;
        purchased_bp_offers: PurchasedBpOffer[];
        last_match_end_datetime: string;
        last_stw_accolade_transfer_datetime: string;
        active_loadout_index: number;
        homebaseName: string;
        homebase: {
            townName: string,
            bannerIconId: string,
            bannerColorId: string,
            flagPattern: number,
            flagColor: number
        },
        client_settings: {
            pinnedQuestInstances : string[]
        },
        named_counters: {
            [key: string]: {
                current_count: number,
                last_incremented_time: string
            }
        },
        "in_app_purchases": {
            "receipts": string[],
            "ignoredReceipts": string[],
            "fulfillmentCounts": Record<string, number>,
            "refreshTimers": {
              "EpicPurchasingService": {
                "nextEntitlementRefresh": string
              }
              [key: string]: {
                "nextEntitlementRefresh": string
              }
            }
          }
        [key: string]: any
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


    export interface PoolStat {
        poolName: string;
        nextRefresh: string;
        rerollsRemaining: number;
        questHistory: string[];
    }

    export interface PoolLockout {
        lockoutName: string;
    }

    export interface PoolLockouts {
        poolLockouts: PoolLockout[];
    }

    export interface QuestPoolStats {
        poolStats: PoolStat[];
        dailyLoginInterval: string;
        poolLockouts: PoolLockouts;
    }

    export interface QuestManager {
        dailyLoginInterval: string;
        dailyQuestRerolls: number;
        questPoolStats: QuestPoolStats;
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


