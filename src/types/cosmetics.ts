export interface Cosmetic {
    id: string;
    type: TypeClass;
    name: string;
    description: string;
    rarity: Rarity;
    series: Series | null;
    price: number;
    added: Added;
    builtInEmote: BuiltInEmote | null;
    copyrightedAudio: boolean;
    upcoming: boolean;
    reactive: boolean;
    releaseDate: null | string;
    lastAppearance: null | string;
    interest: number;
    images: CosmeticImages;
    video: null | string;
    audio: null | string;
    gameplayTags: string[];
    apiTags: string[];
    battlepass: Battlepass | null;
    set: Set | null;
}

export interface Added {
    date: string;
    version: string;
}

export interface Battlepass {
    season: number;
    tier: number;
    page: number | null;
    type: TypeEnum;
    displayText: DisplayText;
    battlePassName: BattlePassName;
}

export type BattlePassName =
    "Battle Pass"

export interface DisplayText {
    chapter: Chapter;
    season: Season;
    chapterSeason: ChapterSeason;
}

export type Chapter =
    "Chapter 1" |
    "Chapter 2" |
    "Chapter 3" |
    "Chapter 4"

export type ChapterSeason =
    "Chapter 1 - Season 2" |
    "Chapter 1 - Season 3" |
    "Chapter 1 - Season 4" |
    "Chapter 1 - Season 5" |
    "Chapter 1 - Season 6" |
    "Chapter 1 - Season 7" |
    "Chapter 1 - Season 8" |
    "Chapter 1 - Season 9" |
    "Chapter 1 - Season X" |
    "Chapter 2 - Season 1" |
    "Chapter 2 - Season 2" |
    "Chapter 2 - Season 3" |
    "Chapter 2 - Season 4" |
    "Chapter 2 - Season 5" |
    "Chapter 2 - Season 6" |
    "Chapter 2 - Season 7" |
    "Chapter 2 - Season 8" |
    "Chapter 3 - Season 1" |
    "Chapter 3 - Season 2" |
    "Chapter 3 - Season 3" |
    "Chapter 3 - Season 4" |
    "Chapter 4 - Season 1"

export type Season =
    "Season 1" |
    "Season 2" |
    "Season 3" |
    "Season 4" |
    "Season 5" |
    "Season 6" |
    "Season 7" |
    "Season 8" |
    "Season 9" |
    "Season X"

export type TypeEnum =
    "free" |
    "paid"

export interface BuiltInEmote {
    id: string;
    type: TypeClass;
    name: string;
    description: string;
    rarity: Rarity;
    series: Series | null;
    images: BuiltInEmoteImages;
    video: null;
}

export interface BuiltInEmoteImages {
    icon: string;
    featured: null | string;
    background: string;
    icon_background: string;
    full_background: string;
}

export interface Rarity {
    id: RarityID;
    name: RarityName;
}

export type RarityID =
    "Common" |
    "Epic" |
    "Legendary" |
    "Rare" |
    "Transcendent" |
    "unattainable" |
    "Uncommon"

export type RarityName =
    "COMMON" |
    "" |
    "Epic" |
    "Exotic" |
    "LEGENDARY" |
    "RARE" |
    "UNCOMMON"

export interface Series {
    id: SeriesID;
    name: SeriesName;
}

export type SeriesID =
    "CUBESeries" |
    "ColumbusSeries" |
    "CreatorCollabSeries" |
    "DCUSeries" |
    "FrozenSeries" |
    "LavaSeries" |
    "MarvelSeries" |
    "PlatformSeries" |
    "ShadowSeries" |
    "SlurpSeries"

export type SeriesName =
    "DARK SERIES" |
    "DC SERIES" |
    "Frozen Series" |
    "Gaming Legends Series" |
    "Icon Series" |
    "Lava Series" |
    "MARVEL SERIES" |
    "Shadow Series" |
    "Slurp Series" |
    "Star Wars Series"

export interface TypeClass {
    id: TypeID;
    name: TypeName;
}

export type TypeID =
    "backpack" |
    "bannertoken" |
    "battlebus" |
    "bundle" |
    "contrail" |
    "cosmeticvariant" |
    "emoji" |
    "emote" |
    "glider" |
    "itemaccess" |
    "loadingscreen" |
    "music" |
    "outfit" |
    "pet" |
    "pickaxe" |
    "spray" |
    "toy" |
    "wrap"

export type TypeName =
    "BackBling" |
    "BANNER" |
    "Battle Bus" |
    "Contrail" |
    "Emote" |
    "Emoticon" |
    "Glider" |
    "Harvesting Tool" |
    "Item Bundle" |
    "itemaccess" |
    "Loading Screen" |
    "Music" |
    "Outfit" |
    "Pet" |
    "Spray" |
    "Style" |
    "Toy" |
    "Wrap"

export interface CosmeticImages {
    icon: null | string;
    featured: null | string;
    background: null | string;
    icon_background: string;
    full_background: null | string;
}

export interface Set {
    id: string;
    name: string;
    partOf: string;
}
