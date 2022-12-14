import { Cosmetic } from "./cosmetics";

export interface Battlepass {
    tierOfferId?: string,
    season: number;
    displayInfo: Display;
    seasonDates: SeasonDates;
    videos: Video[];
    rewards: Reward[];
}

export interface Display {
    chapter: Chapter;
    season: Season;
    chapterSeason: ChapterSeason;
    battlepassName?: BattlepassName;
}

export enum BattlepassName {
    BattlePass = "Battle Pass",
}

export enum Chapter {
    Chapter1 = "Chapter 1",
    Chapter2 = "Chapter 2",
    Chapter4 = "Chapter 4",
}

export enum ChapterSeason {
    Chapter1Season6 = "Chapter 1 - Season 6",
    Chapter1Season7 = "Chapter 1 - Season 7",
    Chapter1Season9 = "Chapter 1 - Season 9",
    Chapter1SeasonX = "Chapter 1 - Season X",
    Chapter2Season4 = "Chapter 2 - Season 4",
    Chapter4Season1 = "Chapter 4 - Season 1",
}

export enum Season {
    Season1 = "Season 1",
    Season4 = "Season 4",
    Season6 = "Season 6",
    Season7 = "Season 7",
    Season9 = "Season 9",
    SeasonX = "Season X",
}

export interface Reward {
    tier: number;
    page: number | null;
    battlepass: BattlepassEnum;
    quantity: number;
    price: Price | null;
    item: Cosmetic;
}

export enum BattlepassEnum {
    Free = "free",
    Paid = "paid",
}

export interface Added {
    date: Date;
    version: Version;
}

export enum Version {
    The100 = "10.0",
    The100Cu = "10.0-CU",
    The1040 = "10.40",
    The1400 = "14.00",
    The2300 = "23.00",
    The60 = "6.0",
    The820 = "8.20",
    The820Cu = "8.20-CU",
    The901 = "9.01",
}

export interface BattlepassClass {
    season: number;
    tier: number;
    page: number | null;
    type: BattlepassEnum;
    displayText: Display;
    battlePassName: BattlepassName;
}

export interface BuiltInEmote {
    id: string;
    type: Rarity;
    name: string;
    description: string;
    rarity: Rarity;
    series: Rarity | null;
    images: Images;
    video: null;
}

export interface Images {
    icon: string;
    featured: null | string;
    background: string;
    icon_background: string;
    full_background: string;
}

export interface Rarity {
    id: ID;
    name: Name;
}

export enum ID {
    Backpack = "backpack",
    Bannertoken = "bannertoken",
    Common = "Common",
    Contrail = "contrail",
    Cosmeticvariant = "cosmeticvariant",
    CreatorCollabSeries = "CreatorCollabSeries",
    Emoji = "emoji",
    Emote = "emote",
    Epic = "Epic",
    Glider = "glider",
    Itemaccess = "itemaccess",
    Legendary = "Legendary",
    Loadingscreen = "loadingscreen",
    MarvelSeries = "MarvelSeries",
    Misc = "misc",
    Music = "music",
    Outfit = "outfit",
    Pet = "pet",
    Pickaxe = "pickaxe",
    PlatformSeries = "PlatformSeries",
    Rare = "Rare",
    Spray = "spray",
    Toy = "toy",
    Uncommon = "Uncommon",
    Wrap = "wrap",
}

export enum Name {
    BackBling = "BackBling",
    Banner = "BANNER",
    Common = "COMMON",
    Contrail = "Contrail",
    Emote = "Emote",
    Emoticon = "Emoticon",
    Epic = "Epic",
    GamingLegendsSeries = "Gaming Legends Series",
    Glider = "Glider",
    HarvestingTool = "Harvesting Tool",
    IconSeries = "Icon Series",
    Itemaccess = "itemaccess",
    Legendary = "LEGENDARY",
    LoadingScreen = "Loading Screen",
    MarvelSeries = "MARVEL SERIES",
    Music = "Music",
    Other = "Other",
    Outfit = "Outfit",
    Pet = "Pet",
    Rare = "RARE",
    Spray = "Spray",
    Style = "Style",
    Toy = "Toy",
    Uncommon = "UNCOMMON",
    Wrap = "Wrap",
}

export interface Introduction {
    chapter: Chapter;
    season: Season;
    text: Text;
}

export enum Text {
    IntroducedInChapter1Season6 = "Introduced in Chapter 1 - Season 6.",
    IntroducedInChapter2Season4 = "Introduced in Chapter 2 - Season 4.",
    IntroducedInChapter4Season1 = "Introduced in Chapter 4 - Season 1.",
}

export interface Set {
    id: string;
    name: string;
    partOf: string;
}

export interface Style {
    name: string;
    channel: Channel;
    channelName: ChannelName;
    tag: string;
    isDefault: boolean;
    startUnlocked: boolean;
    hideIfNotOwned: boolean;
    image: null | string;
}

export enum Channel {
    CosmeticsVariantChannelClothingColor = "Cosmetics.Variant.Channel.ClothingColor",
    CosmeticsVariantChannelMaterial = "Cosmetics.Variant.Channel.Material",
    CosmeticsVariantChannelMesh = "Cosmetics.Variant.Channel.Mesh",
    CosmeticsVariantChannelParticle = "Cosmetics.Variant.Channel.Particle",
    CosmeticsVariantChannelParts = "Cosmetics.Variant.Channel.Parts",
    CosmeticsVariantChannelProgressive = "Cosmetics.Variant.Channel.Progressive",
}

export enum ChannelName {
    ChannelNameStyle = "Style",
    ClothingColor = "CLOTHING COLOR",
    Color = "COLOR",
    Empty = "",
    PickaxeType = "Pickaxe Type",
    Reactivity = "reactivity",
    Stage = "STAGE",
    Style = "STYLE",
}

export interface Price {
    type: Type;
    amount: number;
}

export enum Type {
    AthenaBattleStar = "AthenaBattleStar",
}

export interface SeasonDates {
    begin: Date;
    end: Date;
}

export interface Video {
    lang: string;
    type: string;
    url: string;
}
