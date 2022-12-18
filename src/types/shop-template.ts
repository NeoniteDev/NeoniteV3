export interface ShopTemplate {
    featured: Featured;
    daily:    Daily;
}

export interface Daily {
    emote:   GliderClass;
    outfit:  GliderClass;
    pickaxe: GliderClass;
    glider?: GliderClass;
    wrap?:   Wrap;
}

export interface GliderClass {
    uncommon?:  number;
    rare?:      number;
    epic?:      number;
    legendary?: number;
}

export interface Wrap {
    uncommon: number;
}

export interface Featured {
    emote:    PurpleEmote;
    outfit:   GliderClass;
    glider?:  GliderClass;
    pickaxe?: GliderClass;
    bundle?:  Bundle;
}

export interface Bundle {
    legendary: number;
}

export interface PurpleEmote {
}
