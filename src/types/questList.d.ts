export interface QuestList {
    author:       string;
    SaveTheWorld: SaveTheWorld;
    BattleRoyale: BattleRoyale;
}

export interface BattleRoyale {
    Daily:    Daily[];
    Season3:  BattleRoyaleSeason3;
    Season4:  BattleRoyaleSeason4;
    Season5:  BattleRoyaleSeason5;
    Season6:  BattleRoyaleSeason6;
    Season7:  BattleRoyaleSeason7;
    Season8:  BattleRoyaleSeason8;
    Season9:  BattleRoyaleSeason9;
    Season10: BattleRoyaleSeason10;
    Season11: Season11;
    Season12: Season12;
    Season13: Season13;
    Season14: Season14;
    Season15: Season15;
    Season16: Season16;
    Season17: Season17;
    Season18: Season18;
    Season19: Season19;
    Season20: Season20;
    Season21: Season21;
}

export interface Daily {
    templateId: string;
    objectives: string[];
}

export interface BattleRoyaleSeason10 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season10ChallengeBundle[];
    Quests:                   Season11Quest[];
}

export interface Season10ChallengeBundleSchedule {
    itemGuid:        string;
    templateId:      string;
    granted_bundles: string[];
}

export interface Season10ChallengeBundle {
    itemGuid:                     string;
    templateId:                   string;
    grantedquestinstanceids:      string[];
    challenge_bundle_schedule_id: string;
    questStages?:                 string[];
}

export interface Season11Quest {
    itemGuid:            string;
    templateId:          string;
    objectives:          Objective[];
    challenge_bundle_id: string;
}

export interface Objective {
    name:  string;
    count: number;
}

export interface Season11 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season10ChallengeBundle[];
    Quests:                   Season11Quest[];
}

export interface Season12 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season10ChallengeBundle[];
    Quests:                   Season12Quest[];
}

export interface Season12Quest {
    itemGuid:            string;
    templateId:          string;
    objectives:          Objective[];
    challenge_bundle_id: string;
}

export interface Season13 {
    ChallengeBundleSchedules: Season13ChallengeBundleSchedule[];
    ChallengeBundles:         Season13ChallengeBundle[];
    Quests:                   Season13Quest[];
}

export interface Season13ChallengeBundleSchedule {
    itemGuid:        PurpleItemGUID;
    templateId:      string;
    granted_bundles: string[];
}

export enum PurpleItemGUID {
    S13ChallengeBundleScheduleSeason13BuildABrellaSchedule = "S13-ChallengeBundleSchedule:Season13_BuildABrella_Schedule",
    S13ChallengeBundleScheduleSeason13FeatBundleSchedule = "S13-ChallengeBundleSchedule:Season13_Feat_BundleSchedule",
    S13ChallengeBundleScheduleSeason13MissionSchedule = "S13-ChallengeBundleSchedule:Season13_Mission_Schedule",
    S13ChallengeBundleScheduleSeason13PunchCardSchedule = "S13-ChallengeBundleSchedule:Season13_PunchCard_Schedule",
    S13ChallengeBundleScheduleSeason13SandCastleSchedule = "S13-ChallengeBundleSchedule:Season13_SandCastle_Schedule",
    S13ChallengeBundleScheduleSeason13ScheduleEventCoinCollect = "S13-ChallengeBundleSchedule:Season13_Schedule_Event_CoinCollect",
    S13ChallengeBundleScheduleSeason13StylesSchedule = "S13-ChallengeBundleSchedule:Season13_Styles_Schedule",
}

export interface Season13ChallengeBundle {
    itemGuid:                     string;
    templateId:                   string;
    grantedquestinstanceids:      string[];
    challenge_bundle_schedule_id: PurpleItemGUID;
}

export interface Season13Quest {
    itemGuid:            string;
    templateId:          string;
    objectives:          Objective[];
    challenge_bundle_id: string;
}

export interface Season14 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season10ChallengeBundle[];
    Quests:                   Season14Quest[];
}

export interface Season14Quest {
    itemGuid:            string;
    templateId:          string;
    objectives:          Objective[];
    challenge_bundle_id: string;
}

export interface Season15 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season10ChallengeBundle[];
    Quests:                   Season11Quest[];
}

export interface Season16 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season10ChallengeBundle[];
    Quests:                   Season16Quest[];
}

export interface Season16Quest {
    itemGuid:            string;
    templateId:          string;
    objectives:          Objective[];
    challenge_bundle_id: string;
}

export interface Season17 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season10ChallengeBundle[];
    Quests:                   Season17Quest[];
}

export interface Season17Quest {
    itemGuid:            string;
    templateId:          string;
    objectives:          Objective[];
    challenge_bundle_id: string;
}

export interface Season18 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season18ChallengeBundle[];
    Quests:                   Season18Quest[];
}

export interface Season18ChallengeBundle {
    itemGuid:                     string;
    templateId:                   string;
    grantedquestinstanceids:      string[];
    challenge_bundle_schedule_id: string;
}

export interface Season18Quest {
    itemGuid:            string;
    templateId:          string;
    objectives:          Objective[];
    challenge_bundle_id: string;
}

export interface Season19 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season10ChallengeBundle[];
    Quests:                   Season19Quest[];
}

export interface Season19Quest {
    itemGuid:            string;
    templateId:          string;
    objectives:          Objective[];
    challenge_bundle_id: string;
}

export interface Season20 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season18ChallengeBundle[];
    Quests:                   Season20Quest[];
}

export interface Season20Quest {
    itemGuid:            string;
    templateId:          string;
    objectives:          Objective[];
    challenge_bundle_id: string;
}

export interface Season21 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season18ChallengeBundle[];
    Quests:                   Season21Quest[];
}

export interface Season21Quest {
    itemGuid:            string;
    templateId:          string;
    objectives:          Objective[];
    challenge_bundle_id: string;
}

export interface BattleRoyaleSeason3 {
    ChallengeBundleSchedules: Season3ChallengeBundleSchedule[];
    ChallengeBundles:         Season3ChallengeBundle[];
    Quests:                   PurpleQuest[];
}

export interface Season3ChallengeBundleSchedule {
    itemGuid:        FluffyItemGUID;
    templateId:      string;
    granted_bundles: string[];
}

export enum FluffyItemGUID {
    S3ChallengeBundleScheduleSeason3ChallengeSchedule = "S3-ChallengeBundleSchedule:Season3_Challenge_Schedule",
    S3ChallengeBundleScheduleSeason3Tier100_Schedule = "S3-ChallengeBundleSchedule:Season3_Tier_100_Schedule",
    S3ChallengeBundleScheduleSeason3Tier2_Schedule = "S3-ChallengeBundleSchedule:Season3_Tier_2_Schedule",
}

export interface Season3ChallengeBundle {
    itemGuid:                     string;
    templateId:                   string;
    grantedquestinstanceids:      string[];
    challenge_bundle_schedule_id: FluffyItemGUID;
}

export interface PurpleQuest {
    itemGuid:            string;
    templateId:          string;
    objectives:          Objective[];
    challenge_bundle_id: string;
}

export interface BattleRoyaleSeason4 {
    ChallengeBundleSchedules: Season4ChallengeBundleSchedule[];
    ChallengeBundles:         Season4ChallengeBundle[];
    Quests:                   FluffyQuest[];
}

export interface Season4ChallengeBundleSchedule {
    itemGuid:        TentacledItemGUID;
    templateId:      string;
    granted_bundles: string[];
}

export enum TentacledItemGUID {
    S4ChallengeBundleScheduleSeason4ChallengeSchedule = "S4-ChallengeBundleSchedule:Season4_Challenge_Schedule",
    S4ChallengeBundleScheduleSeason4ProgressiveBSchedule = "S4-ChallengeBundleSchedule:Season4_ProgressiveB_Schedule",
    S4ChallengeBundleScheduleSeason4StarterChallengeSchedule = "S4-ChallengeBundleSchedule:Season4_StarterChallenge_Schedule",
}

export interface Season4ChallengeBundle {
    itemGuid:                     string;
    templateId:                   string;
    grantedquestinstanceids:      string[];
    challenge_bundle_schedule_id: TentacledItemGUID;
}

export interface FluffyQuest {
    itemGuid:            string;
    templateId:          string;
    objectives:          Objective[];
    challenge_bundle_id: string;
}

export interface BattleRoyaleSeason5 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season10ChallengeBundle[];
    Quests:                   Season11Quest[];
}

export interface BattleRoyaleSeason6 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season10ChallengeBundle[];
    Quests:                   Season11Quest[];
}

export interface BattleRoyaleSeason7 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season10ChallengeBundle[];
    Quests:                   Season11Quest[];
}

export interface BattleRoyaleSeason8 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season10ChallengeBundle[];
    Quests:                   Season11Quest[];
}

export interface BattleRoyaleSeason9 {
    ChallengeBundleSchedules: Season10ChallengeBundleSchedule[];
    ChallengeBundles:         Season10ChallengeBundle[];
    Quests:                   Season11Quest[];
}

export interface SaveTheWorld {
    Daily:    Daily[];
    Season2:  Season2;
    Season3:  SaveTheWorldSeason3;
    Season4:  SaveTheWorldSeason4;
    Season5:  SaveTheWorldSeason5;
    Season6:  SaveTheWorldSeason6;
    Season7:  SaveTheWorldSeason7;
    Season8:  SaveTheWorldSeason8;
    Season9:  SaveTheWorldSeason9;
    Season10: SaveTheWorldSeason10;
}

export interface SaveTheWorldSeason10 {
    Quests: TentacledQuest[];
}

export interface TentacledQuest {
    itemGuid:   string;
    templateId: string;
    objectives: Objective[];
}

export interface Season2 {
    Quests: Season2Quest[];
}

export interface Season2Quest {
    itemGuid:   string;
    templateId: string;
    objectives: Objective[];
}

export interface SaveTheWorldSeason3 {
    Quests: StickyQuest[];
}

export interface StickyQuest {
    itemGuid:   string;
    templateId: string;
    objectives: Objective[];
}

export interface SaveTheWorldSeason4 {
    Quests: IndigoQuest[];
}

export interface IndigoQuest {
    itemGuid:   string;
    templateId: string;
    objectives: Objective[];
}

export interface SaveTheWorldSeason5 {
    Quests: IndecentQuest[];
}

export interface IndecentQuest {
    itemGuid:   string;
    templateId: string;
    objectives: Objective[];
}

export interface SaveTheWorldSeason6 {
    Quests: HilariousQuest[];
}

export interface HilariousQuest {
    itemGuid:   string;
    templateId: string;
    objectives: Objective[];
}

export interface SaveTheWorldSeason7 {
    Quests: AmbitiousQuest[];
}

export interface AmbitiousQuest {
    itemGuid:   string;
    templateId: string;
    objectives: Objective[];
}

export interface SaveTheWorldSeason8 {
    Quests: CunningQuest[];
}

export interface CunningQuest {
    itemGuid:   string;
    templateId: string;
    objectives: Objective[];
}

export interface SaveTheWorldSeason9 {
    Quests: MagentaQuest[];
}

export interface MagentaQuest {
    itemGuid:   string;
    templateId: string;
    objectives: Objective[];
}
