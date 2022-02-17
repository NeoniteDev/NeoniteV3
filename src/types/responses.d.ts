export namespace EOS {
    export interface room {
        roomId: string;
        participants: {
            puid: string;
            token: string;
            hardMuted: boolean;
        }[];
        deploymentId: string;
        clientBaseUrl: string;
    }


    export interface oAuthToken {
        access_token: string;
        token_type: string;
        expires_at: string;
        features: string[];
        organization_id: string;
        product_id: string;
        sandbox_id: string;
        deployment_id: string;
        expires_in: number;
    }

    export interface ApiError {
        messageVars: string[];
        errorMessage: string;
        errorCode: string;
        correlationId: string;
        numericErrorCode: number;
        responseStatus: number;
        intent: string;
        originatingService: string;
    }
}

export namespace launcherService {
    export namespace downloadInfosV2 {
        export interface Metadata {
            installationPoolId: string;
        }

        export interface QueryParam {
            name: string;
            value: string;
        }

        export interface Manifest {
            uri: string;
            queryParams: QueryParam[];
        }

        export interface Element {
            appName: string;
            labelName: string;
            buildVersion: string;
            hash: string;
            metadata: Metadata;
            manifests: Manifest[];
        }

        export interface RootObject {
            elements: Element[];
        }
    }
}



export namespace XmppApi {
    export interface SessionResponse {
        sessions: Session[];
        session: Session[];
    }

    export interface Session {
        sessionId: string;
        username: string;
        resource: string;
        node: string;
        sessionStatus: string;
        presenceStatus: string;
        presenceMessage: string;
        priority: number;
        hostAddress: string;
        hostName: string;
        creationDate: number;
        lastActionDate: number;
        secure: boolean;
    }

    export interface ChatRoom {
        roomName: string;
        naturalName: string;
        description: string;
        password?: any;
        subject: string;
        creationDate: number;
        modificationDate: number;
        maxUsers: number;
        persistent: boolean;
        publicRoom: boolean;
        registrationEnabled: boolean;
        canAnyoneDiscoverJID: boolean;
        canOccupantsChangeSubject: boolean;
        canOccupantsInvite: boolean;
        canChangeNickname: boolean;
        logEnabled: boolean;
        loginRestrictedToNickname: boolean;
        membersOnly: boolean;
        moderated: boolean;
        broadcastPresenceRole: string[];
        owner: string[];
        admin: any[];
        member: any[];
        outcast: any[];
        ownerGroup: any[];
        adminGroup: any[];
        memberGroup: any[];
        outcastGroup: any[];
    }

    export interface ChatRoomRoot {
        chatRoom: ChatRoom[];
    }

    export interface ParticipantRoot {
        participant: Participant[];
    }

    export interface Participant {
        jid: string;
        role: string;
        affiliation: string;
    }

}

export namespace content {
    export interface Root {
        "jcr:isCheckedOut"?: boolean;
        _title?: string;
        "jcr:baseVersion"?: string;
        _activeDate?: string;
        lastModified?: string;
        _locale?: Locale;
        subgameinfo?: Subgameinfo;
        athenamessage?: Athenamessage;
        battleroyalenews?: Battleroyalenews;
        lobby?: Lobby;
        survivalmessage?: Athenamessage;
        creativenews?: Creativenews;
        savetheworldnews?: Battleroyalenewsv2;
        playersurvey?: Battleroyalenewsv2;
        emergencynotice?: Battleroyalenewsv2;
        koreancafe?: Athenamessage;
        battlepassaboutmessages?: Battlepassaboutmessages;
        loginmessage?: Athenamessage;
        dynamicbackgrounds?: Battleroyalenewsv2;
        subgameselectdata?: Subgameselectdata;
        playlistinformation?: Playlistinformation;
        creativeFeatures?: Battleroyalenewsv2;
        creativeAds?: Athenamessage;
        tournamentinformation?: Battleroyalenewsv2;
        comics?: Battleroyalenewsv2;
        shopSections?: Battleroyalenewsv2;
        creativenewsv2?: Battleroyalenewsv2;
        battleroyalenewsv2?: Battleroyalenewsv2;
        radioStations?: Battleroyalenewsv2;
        subscription?: Subscription;
        emergencynoticev2?: Battleroyalenewsv2;
        shopCarousel?: Battleroyalenewsv2;
        playersurveyv2?: Battleroyalenewsv2;
        specialoffervideo?: Battleroyalenewsv2;
        platformpurchasemessaging?: Battleroyalenewsv2;
        socialevents?: Battleroyalenewsv2;
        leaderboardinformation?: Battleroyalenewsv2;
        scoringrulesinformation?: Battleroyalenewsv2;
        battlepasspurchase?: Battlepasspurchase;
        crewscreendata?: Crewscreendata;
        mediaEvents?: Battleroyalenewsv2;
        _suggestedPrefetch?: any[];
    }

    export enum Locale {
        EnUS = "en-US",
    }

    export interface Athenamessage {
        _title?: string;
        overrideablemessage?: LoginmessageClass;
        _activeDate?: string;
        lastModified?: string;
        _locale?: Locale;
        ad_info?: AthenamessageAdInfo;
        cafe_info?: CafeInfo;
        loginmessage?: LoginmessageClass;
    }

    export interface AthenamessageAdInfo {
        ads?: any[];
        _type?: AdInfoType;
    }

    export enum AdInfoType {
        CreativeAdInfo = "Creative Ad Info",
        FortniteMediaEventList = "Fortnite - Media Event List",
        LeaderboardsInfo = "Leaderboards Info",
        PlayerSurveyMessage = "Player Survey - Message",
        SubscriptionBulletPoints = "SubscriptionBulletPoints",
    }

    export interface CafeInfo {
        cafes?: Cafe[];
        _type?: string;
    }

    export interface Cafe {
        korean_cafe?: string;
        korean_cafe_description?: string;
        _type?: string;
        korean_cafe_header?: string;
    }

    export interface LoginmessageClass {
        _type?: string;
        message?: LoginmessageMessage;
    }

    export interface LoginmessageMessage {
        image?: string;
        _type?: MessageType;
        title?: string;
        body?: string;
    }

    export enum MessageType {
        CommonUISimpleMessageBase = "CommonUI Simple Message Base",
    }

    export interface Battlepassaboutmessages {
        news?: BattlepassaboutmessagesNews;
        _title?: string;
        _noIndex?: boolean;
        _activeDate?: string;
        lastModified?: string;
        _locale?: Locale;
    }

    export interface BattlepassaboutmessagesNews {
        _type?: string;
        messages?: MessageElement[];
    }

    export interface MessageElement {
        layout?: string;
        image?: string;
        hidden?: boolean;
        _type?: MessageType;
        title?: string;
        body?: string;
        spotlight?: boolean;
        messagetype?: string;
        adspace?: string;
    }

    export interface Battlepasspurchase {
        battlePassPurchaseDisclaimer?: string;
        battlePassPurchaseBackgroundURL?: string;
        "jcr:isCheckedOut"?: boolean;
        _title?: string;
        battlePassPurchaseConfirmBackgroundURL?: string;
        battlePassPurchaseDescription?: string;
        _noIndex?: boolean;
        "jcr:baseVersion"?: string;
        _activeDate?: string;
        lastModified?: string;
        _locale?: Locale;
    }

    export interface Battleroyalenews {
        news?: BattleroyalenewsNews;
        "jcr:isCheckedOut"?: boolean;
        _title?: string;
        header?: string;
        style?: Style;
        _noIndex?: boolean;
        alwaysShow?: boolean;
        "jcr:baseVersion"?: string;
        _activeDate?: string;
        lastModified?: string;
        _locale?: Locale;
    }

    export interface BattleroyalenewsNews {
        _type?: string;
        messages?: MessageElement[];
        platform_motds?: PlatformMOTD[];
    }

    export interface PlatformMOTD {
        hidden?: boolean;
        _type?: string;
        message?: PlatformMOTDMessage;
        platform?: string;
    }

    export interface PlatformMOTDMessage {
        entryType?: string;
        image?: string;
        tileImage?: string;
        hidden?: boolean;
        videoMute?: boolean;
        _type?: string;
        title?: string;
        body?: string;
        videoLoop?: boolean;
        videoStreamingEnabled?: boolean;
        id?: string;
        videoAutoplay?: boolean;
        videoFullscreen?: boolean;
        spotlight?: boolean;
        sortingPriority?: number;
    }

    export enum Style {
        None = "None",
    }

    export interface Battleroyalenewsv2 {
        news?: Battleroyalenewsv2News;
        "jcr:isCheckedOut"?: boolean;
        _title?: string;
        _noIndex?: boolean;
        alwaysShow?: boolean;
        "jcr:baseVersion"?: string;
        _activeDate?: string;
        lastModified?: string;
        _locale?: Locale;
        library?: Library;
        ad_info?: LeaderboardInfoClass;
        _script?: string;
        backgrounds?: Backgrounds;
        emergencynotices?: Emergencynotices;
        leaderboard_info?: LeaderboardInfoClass;
        arena_info?: ArenaInfo;
        mediaEvents?: LeaderboardInfoClass;
        platformErrorCodeMessagesList?: PlatformErrorCodeMessagesList;
        s?: Battleroyalenewsv2S;
        surveyData?: SurveyData;
        radioStationList?: RadioStationList;
        scoring_rules_info?: ScoringRulesInfo;
        itemsList?: ItemsList;
        sectionList?: SectionList;
        socialevents?: Socialevents;
        specialoffervideo?: Video;
        bSpecialOfferEnabled?: boolean;
        conversion_config?: ConversionConfig;
        tournament_info?: TournamentInfo;
    }

    export interface LeaderboardInfoClass {
        _type?: AdInfoType;
    }

    export interface ArenaInfo {
        _type?: AdInfoType;
        leaderboards?: Leaderboard[];
    }

    export interface Leaderboard {
        leaderboard_id?: string;
        show_details_panel?: boolean;
        _type?: string;
        leaderboard_name?: string;
    }

    export interface Backgrounds {
        backgrounds?: Background[];
        _type?: string;
    }

    export interface Background {
        stage?: Stage;
        _type?: BackgroundType;
        key?: Title;
    }

    export enum BackgroundType {
        DynamicBackground = "DynamicBackground",
    }

    export enum Title {
        Lobby = "lobby",
        Vault = "vault",
    }

    export enum Stage {
        Default = "default",
        Season19 = "season19",
    }

    export interface ConversionConfig {
        containerName?: string;
        _type?: string;
        enableReferences?: boolean;
        contentName?: string;
    }

    export interface Emergencynotices {
        _type?: string;
        emergencynotices?: any[];
    }

    export interface ItemsList {
        _type?: string;
        items?: any[];
    }

    export interface Library {
        comics?: Comic[];
        _type?: string;
    }

    export interface Comic {
        images?: string[];
        pages?: string;
        _type?: string;
        name?: string;
        showContinue?: boolean;
    }

    export interface Battleroyalenewsv2News {
        motds?: any[];
        _type?: string;
        platform_messages?: any[];
        messages?: MessageElement[];
    }

    export interface PlatformErrorCodeMessagesList {
        _type?: string;
        platformErrorCodeMessages?: PlatformErrorCodeMessage[];
    }

    export interface PlatformErrorCodeMessage {
        errorCodeMessageList?: ErrorCodeMessageList[];
        _type?: string;
        platformId?: string;
    }

    export interface ErrorCodeMessageList {
        _type?: string;
        errorCode?: string;
        messages?: string[];
        title?: string;
    }

    export interface RadioStationList {
        _type?: string;
        stations?: Station[];
    }

    export interface Station {
        resourceID?: string;
        stationImage?: string;
        _type?: string;
        title?: string;
    }

    export interface Battleroyalenewsv2S {
        s?: Empty[];
        cg?: CGElement[];
        e?: boolean;
        _type?: string;
    }

    export interface CGElement {
        c?: CGC[];
        _type?: PurpleType;
        id?: string;
    }

    export enum PurpleType {
        PlayerSurveyConditionGroup = "Player Survey - Condition Group",
    }

    export interface CGC {
        cg?: CCG;
        _type?: FluffyType;
        pl?: Pl;
        mc?: CMc;
        o?: O;
        ss?: Ss;
        ab?: Ab;
        pi?: Pi;
        rd?: RD;
    }

    export enum FluffyType {
        PlayerSurveyConditionContainer = "Player Survey - Condition Container",
    }

    export interface Ab {
        t?: boolean;
        _type?: string;
    }

    export interface CCG {
        _type?: TentacledType;
        id?: string;
    }

    export enum TentacledType {
        PlayerSurveyConditionConditionGroup = "Player Survey - Condition - Condition Group",
    }

    export interface CMc {
        s?: SElement;
        t?: number;
        _type?: string;
        o?: string;
    }

    export interface SElement {
        t?: string;
        _type?: SType;
    }

    export enum SType {
        PlayerSurveyMetadataSurveyID = "Player Survey - Metadata Survey ID",
        PlayerSurveyMultipleChoiceQuestionChoice = "Player Survey - Multiple Choice Question Choice",
    }

    export interface O {
        c?: OC[];
        _type?: string;
    }

    export interface OC {
        a?: A;
        _type?: StickyType;
    }

    export enum StickyType {
        PlayerSurveyConditionContainerO = "Player Survey - Condition Container O",
    }

    export interface A {
        c?: AC[];
        _type?: AType;
    }

    export enum AType {
        PlayerSurveyConditionAnd = "Player Survey - Condition - And",
    }

    export interface AC {
        rd?: RD;
        _type?: IndigoType;
        pl?: Pl;
        as?: As;
        cg?: CCG;
        mc?: CMc;
    }

    export enum IndigoType {
        PlayerSurveyConditionContainerOA = "Player Survey - Condition Container OA",
    }

    export interface As {
        s?: string;
        pt?: Sg[];
        t?: number;
        ag?: string;
        _type?: string;
        i?: I[];
        o?: string;
    }

    export enum I {
        Gamepad = "gamepad",
        Keyboardmouse = "keyboardmouse",
        Touch = "touch",
    }

    export enum Sg {
        A = "a",
        C = "c",
    }

    export interface Pl {
        p?: string[];
        _type?: PlType;
    }

    export enum PlType {
        PlayerSurveyConditionPlatform = "Player Survey - Condition - Platform",
    }

    export interface RD {
        p?: number;
        _type?: RDType;
    }

    export enum RDType {
        PlayerSurveyConditionRandom = "Player Survey - Condition - Random",
    }

    export interface Pi {
        q?: PiQ;
        _type?: string;
    }

    export interface PiQ {
        t?: string;
        _type?: string;
        n?: string[];
    }

    export interface Ss {
        s?: string;
        t?: number;
        _type?: string;
        o?: string;
    }

    export interface Empty {
        rt?: boolean;
        pr?: PR;
        c?: C[];
        hidden?: boolean;
        e?: boolean;
        _type?: Type;
        cm?: LeaderboardInfoClass;
        q?: QElement[];
        r?: R;
        sg?: Sg[];
        t?: T;
        id?: string;
        po?: LeaderboardInfoClass;
    }

    export enum Type {
        PlayerSurveySurvey = "Player Survey - Survey",
    }

    export interface C {
        cg?: CCG;
        _type?: FluffyType;
    }

    export interface PR {
        _type?: AdInfoType;
        m?: string;
        t?: string;
    }

    export interface QElement {
        mc?: QMc;
        _type?: QType;
    }

    export enum QType {
        PlayerSurveyQuestionContainer = "Player Survey - Question Container",
    }

    export interface QMc {
        s?: SEnum;
        c?: SElement[];
        t?: string;
        _type?: McType;
    }

    export enum McType {
        PlayerSurveyMultipleChoiceQuestion = "Player Survey - Multiple Choice Question",
    }

    export enum SEnum {
        Rating = "rating",
        Standard = "standard",
    }

    export enum R {
        Rm = "rm",
    }

    export enum T {
        ComplexTextQuestion = "Complex Text Question",
        Test = "Test",
        WeWantYourFeedback = "We want your feedback!",
    }

    export interface ScoringRulesInfo {
        _type?: string;
        scoring_rules?: ScoringRule[];
    }

    export interface ScoringRule {
        poster_description?: string;
        rule_name?: string;
        _type?: string;
        icon?: string;
        description?: string;
        poster_interval_description?: string;
    }

    export interface SectionList {
        _type?: string;
        sections?: Section[];
    }

    export interface Section {
        bSortOffersByOwnership?: boolean;
        bShowIneligibleOffersIfGiftable?: boolean;
        bEnableToastNotification?: boolean;
        background?: Background;
        _type?: SectionType;
        landingPriority?: number;
        bHidden?: boolean;
        sectionId?: string;
        bShowTimer?: boolean;
        sectionDisplayName?: string;
        bShowIneligibleOffers?: boolean;
    }

    export enum SectionType {
        ShopSection = "ShopSection",
    }

    export interface Socialevents {
        _type?: string;
        events?: Event[];
    }

    export interface Event {
        starts_at_utc?: string;
        event_id?: number;
        _type?: string;
        title?: string;
    }

    export interface Video {
        videoString?: string;
        videoUID?: string;
        _type?: string;
        bStreamingEnabled?: boolean;
        bCheckAutoPlay?: boolean;
    }

    export interface SurveyData {
        conditionGroups?: ConditionGroup[];
        _type?: string;
        surveys?: Survey[];
        bSurveysEnabled?: boolean;
        customTextReplacements?: CustomTextReplacement[];
    }

    export interface ConditionGroup {
        _type?: string;
        conditionGroupID?: string;
        conditions?: Condition[];
    }

    export interface FluffyChildCondition {
        comparisonValue?: string;
        _type?: HilariousType;
        childConditions?: Condition[];
        type?: AmbitiousType;
    }

    export interface PurpleChildCondition {
        comparisonValue?: string;
        _type?: IndecentType;
        type?: ConditionTypeEnum;
        operation?: string;
        childConditions?: FluffyChildCondition[];
    }

    export interface ConditionChildCondition {
        comparisonValue?: string;
        _type?: string;
        childConditions?: PurpleChildCondition[];
        type?: string;
        conditionInfo?: string[];
    }

    export interface Condition {
        _type?: ConditionType;
        childConditions?: ConditionChildCondition[];
        type?: ConditionTypeEnum;
        comparisonValue?: string;
        operation?: Operation;
        conditionInfo?: string[];
    }

    export enum HilariousType {
        PlayerSurveyV2ConditionLevel4 = "Player Survey V2 - Condition Level 4",
    }

    export enum AmbitiousType {
        And = "And",
    }

    export enum IndecentType {
        PlayerSurveyV2ConditionLevel3 = "Player Survey V2 - Condition Level 3",
    }

    export enum ConditionTypeEnum {
        MostRecentlyCompleted = "MostRecentlyCompleted",
        Not = "Not",
        Or = "Or",
        Platform = "Platform",
        PreviousMatchesPlayed = "PreviousMatchesPlayed",
        Random = "Random",
    }

    export enum ConditionType {
        PlayerSurveyV2ConditionLevel1 = "Player Survey V2 - Condition Level 1",
        PlayerSurveyV2ConditionLevel5 = "Player Survey V2 - Condition Level 5",
    }

    export enum Operation {
        GreaterThan = "GreaterThan",
        LessThan = "LessThan",
    }

    export interface CustomTextReplacement {
        textReplacementTag?: string;
        _type?: string;
        textReplacementValues?: TextReplacementValue[];
    }

    export interface TextReplacementValue {
        textID?: string;
        _type?: TextReplacementValueType;
        localizedText?: string;
    }

    export enum TextReplacementValueType {
        PlayerSurveyV2LocalizableText = "Player Survey V2 - Localizable Text",
        PlayerSurveyV2LocalizableTextLong = "Player Survey V2 - Localizable Text (Long)",
    }

    export interface Survey {
        surveyID?: string;
        hidden?: boolean;
        bRandomizeQuestionOrder?: boolean;
        surveyTags?: SurveyTag[];
        _type?: SurveyType;
        conditionGroupIDs?: ConditionGroupID[];
        questions?: QuestionElement[];
        textReplacementOverrides?: CustomTextReplacement[];
    }

    export enum SurveyType {
        PlayerSurveyV2Survey = "Player Survey V2 - Survey",
    }

    export enum ConditionGroupID {
        FNBRExcludedPlaylistIDs = "FNBR_ExcludedPlaylistIDs",
        FNBRHeartbeatsCooldown = "FNBR_Heartbeats_Cooldown",
        FNBRHeartbeatsPlatformExpRateSwitch = "FNBR_Heartbeats_Platform_Exp_RateSwitch",
        FNBRHeartbeatsPlatformSwitch = "FNBR_Heartbeats_PlatformSwitch",
        FNBRModularPlatformExpRateSwitch = "FNBR_Modular_Platform_Exp_RateSwitch",
    }

    export interface QuestionElement {
        question?: QuestionQuestion;
        _type?: CunningType;
    }

    export enum CunningType {
        PlayerSurveyV2QuestionContainer = "Player Survey V2 - Question Container",
    }

    export interface QuestionQuestion {
        _type?: MagentaType;
        bRandomizeResponseOrder?: boolean;
        responses?: TextReplacementValue[];
        numberOfOptions?: number;
        type?: QuestionType;
        questionText?: TextReplacementValue;
    }

    export enum MagentaType {
        PlayerSurveyV2Question = "Player Survey V2 - Question",
    }

    export enum QuestionType {
        MultipleChoice = "MultipleChoice",
        Rating = "Rating",
        SingleChoice = "SingleChoice",
    }

    export enum SurveyTag {
        FNBRHeartbeatSurveys = "FNBR_HeartbeatSurveys",
    }

    export interface TournamentInfo {
        tournaments?: Tournament[];
        _type?: string;
    }

    export interface Tournament {
        title_color?: TitleColor;
        loading_screen_image?: string;
        background_text_color?: string;
        background_right_color?: string;
        poster_back_image?: string;
        _type?: TournamentType;
        pin_earned_text?: PinEarnedText;
        tournament_display_id?: string;
        highlight_color?: string;
        schedule_info?: string;
        primary_color?: string;
        flavor_description?: string;
        poster_front_image?: string;
        short_format_title?: string;
        title_line_2?: string;
        title_line_1?: string;
        shadow_color?: string;
        details_description?: string;
        background_left_color?: string;
        long_format_title?: string;
        poster_fade_color?: string;
        secondary_color?: string;
        playlist_tile_image?: string;
        base_color?: string;
        series_point_leaderboard_name?: string;
        round_names?: string[];
        pin_score_requirement?: number;
        background_title?: string;
    }

    export enum TournamentType {
        TournamentDisplayInfo = "Tournament Display Info",
    }

    export enum PinEarnedText {
        ChampionDivisionUnlocked = "Champion Division unlocked!",
        ChampionGrandFinalsUnlocked = "Champion Grand Finals unlocked!",
        ContenderDivisionUnlocked = "Contender Division unlocked!",
        PinEarned = "Pin earned!",
        PinEarnedTextPinEarned = "Pin Earned!",
        PinEarnedTextWinner = "Winner",
        ProspectDivisionUnlocked = "Prospect Division unlocked!",
        The54Ffdc = "54FFDC",
        TopCompetitor = "Top Competitor!",
        TopCompetitorKeepGoing = "Top Competitor! Keep Going!",
        TopSquad = "Top Squad!",
        TopTeam = "Top Team!",
        WeekendFinalsUnlocked = "Weekend Finals Unlocked",
        Winner = "Winner!",
        Winners = "Winners!",
    }

    export enum TitleColor {
        Ac39Ff = "AC39FF",
        Empty = "",
        F94EFF = "F94EFF",
        Fdf800 = "FDF800",
        Ff46Ab = "FF46AB",
        Ffea00 = "ffea00",
        Fff736 = "FFF736",
        Ffffff = "FFFFFF",
        The010D2F = "010D2F",
        The01Fae4 = "01FAE4",
        The0Bffac = "0BFFAC",
        The0Effa7 = "0EFFA7",
        The31F3Ff = "31F3FF",
        The54Ffdc = "54FFDC",
        The58Fe85 = "58FE85",
        The641Ab9 = "641AB9",
        The6B0356 = "6B0356",
        The73D970 = "73D970",
        The7E058F = "7E058F",
        The85Efd3 = "85EFD3",
        TitleColor0Effa7 = "0effa7",
    }

    export interface Creativenews {
        news?: CreativenewsNews;
        "jcr:isCheckedOut"?: boolean;
        _title?: string;
        header?: string;
        style?: Style;
        _noIndex?: boolean;
        alwaysShow?: boolean;
        "jcr:baseVersion"?: string;
        _activeDate?: string;
        lastModified?: string;
        _locale?: Locale;
    }

    export interface CreativenewsNews {
        motds?: any[];
        _type?: string;
        messages?: MessageElement[];
        platform_motds?: PlatformMOTD[];
    }

    export interface Crewscreendata {
        benefits?: Benefits;
        "jcr:isCheckedOut"?: boolean;
        crewDisclaimer?: string;
        defaultData?: DefaultData;
        _title?: string;
        _noIndex?: boolean;
        "jcr:baseVersion"?: string;
        _activeDate?: string;
        lastModified?: string;
        _locale?: Locale;
    }

    export interface Benefits {
        recurringBenefits?: RecurringBenefit[];
        _type?: string;
    }

    export interface RecurringBenefit {
        tileType?: string;
        tileLabel?: string;
        nextDetails?: DefaultData;
        bHasNextCrewPackDetails?: boolean;
        _type?: string;
        details?: Details;
        crewPackItems?: string[];
    }

    export interface Details {
        tileImageURL?: string;
        _type?: string;
        description?: string;
        tag?: string;
        title?: string;
        backgroundImageURL?: string;
    }

    export interface DefaultData {
        _type?: string;
        description?: string;
        tag?: Style;
        title?: string;
        backgroundURL?: string;
    }

    export interface Lobby {
        backgroundimage?: string;
        stage?: string;
        _title?: Title;
        _activeDate?: string;
        lastModified?: string;
        _locale?: Locale;
    }

    export interface Playlistinformation {
        is_tile_hidden?: boolean;
        frontend_matchmaking_header_style?: string;
        conversion_config?: ConversionConfig;
        "jcr:isCheckedOut"?: boolean;
        show_ad_violator?: boolean;
        _title?: string;
        frontend_matchmaking_header_text_description?: string;
        frontend_matchmaking_header_text?: string;
        playlist_info?: PlaylistInfo;
        _noIndex?: boolean;
        "jcr:baseVersion"?: string;
        _activeDate?: string;
        lastModified?: string;
        _locale?: Locale;
    }

    export interface PlaylistInfo {
        _type?: string;
        playlists?: Playlist[];
    }

    export interface Playlist {
        image?: string;
        playlist_name?: string;
        hidden?: boolean;
        _type?: PlaylistType;
        violator?: string;
        description?: string;
        display_subname?: string;
        display_name?: string;
        special_border?: Style;
    }

    export enum PlaylistType {
        FortPlaylistInfo = "FortPlaylistInfo",
    }

    export interface Subgameinfo {
        battleroyale?: Battleroyale;
        "jcr:isCheckedOut"?: boolean;
        savetheworld?: Battleroyale;
        _title?: string;
        _noIndex?: boolean;
        creative?: Battleroyale;
        "jcr:baseVersion"?: string;
        _activeDate?: string;
        lastModified?: string;
        _locale?: Locale;
    }

    export interface Battleroyale {
        image?: string;
        color?: string;
        _type?: string;
        description?: string;
        subgame?: string;
        standardMessageLine2?: string;
        title?: string;
        standardMessageLine1?: string;
        specialMessage?: string;
    }

    export interface Subgameselectdata {
        saveTheWorldUnowned?: BattleRoyale;
        _title?: string;
        battleRoyale?: BattleRoyale;
        creative?: BattleRoyale;
        saveTheWorld?: BattleRoyale;
        _activeDate?: string;
        lastModified?: string;
        _locale?: Locale;
    }

    export interface BattleRoyale {
        _type?: string;
        message?: MessageElement;
    }

    export interface Subscription {
        subscriptionDisclaimer?: string;
        "jcr:isCheckedOut"?: boolean;
        blockedBenefitsNotice?: string;
        purchaseSubscriptionDetails?: PurchaseSubscriptionDetails;
        progressiveInfo?: ProgressiveInfo;
        _title?: string;
        subModals?: SubModals;
        nextRewards?: TRewards;
        currentRewards?: TRewards;
        _noIndex?: boolean;
        "jcr:baseVersion"?: string;
        _activeDate?: string;
        lastModified?: string;
        _locale?: Locale;
    }

    export interface TRewards {
        colorA?: string;
        colorB?: string;
        itemShopTileViolatorText?: string;
        battlepassDescription?: string;
        _type?: string;
        itemShopTileViolatorIntensity?: string;
        battlepassTileImageURL?: string;
        skinTitle?: string;
        mtxTitle?: string;
        crewPackItems?: CrewPackItem[];
        battlepassTitle?: string;
        itemShopTileImageURL?: string;
        skinImageURL?: string;
        bSkinImageTakeOver?: boolean;
        colorC?: string;
    }

    export interface CrewPackItem {
        quantity?: number;
        _type?: string;
        templateId?: string;
    }

    export interface ProgressiveInfo {
        sizzleVideo?: Video;
        newStagesUnlockFinePrint?: string;
        _type?: string;
        infoModalEntries?: string[];
    }

    export interface PurchaseSubscriptionDetails {
        battlepassRefund?: number;
        battlepassDescription?: string;
        additionalBulletPoints?: LeaderboardInfoClass;
        battlepassTitle?: string;
        _type?: string;
        mtxDescription?: string;
        skinDescription?: string;
        skinTitle?: string;
        mtxTitle?: string;
    }

    export interface SubModals {
        _type?: string;
        modals?: Modal[];
    }

    export interface Modal {
        entries?: string[];
        _type?: ModalType;
        modalId?: ModalID;
        platformId?: string;
    }

    export enum ModalType {
        SubscriptionModalInfo = "SubscriptionModalInfo",
    }

    export enum ModalID {
        Cancellation = "cancellation",
        Rejoin = "rejoin",
        Resolveissues = "resolveissues",
    }
}