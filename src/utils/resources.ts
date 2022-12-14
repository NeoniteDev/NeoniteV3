import { readdirSync, readFileSync } from "fs";
import * as path from "path";
import { Battlepass } from "../types/battlePass";
import { BRShop, TimelineSaved } from "./types";

const loadedJsons: Record<string, any> = {

};


const worldInfo = path.join(__dirname, '../../resources/campaign/world.json');
export function getWorldInfo() {
    if (!loadedJsons.world) {
        loadedJsons.world = JSON.parse(
            readFileSync(worldInfo, 'utf-8')
        );
    }

    return loadedJsons.world;
}
const defaultCatalogPath = path.join(__dirname, '../../resources/catalog/defaultStoreFront.json');
export function getDefaultStorefronts(): BRShop['storefronts']  {
    if (!loadedJsons.defaultStorefronts) {
        loadedJsons.defaultStorefronts = JSON.parse(
            readFileSync(defaultCatalogPath, 'utf-8')
        );
    }

    return loadedJsons.defaultStorefronts;
}


const timelineEventsPath = path.join(__dirname, '../../resources/timelineEvents.json');
export function getTimelineEvents(): TimelineSaved[]  {
    if (!loadedJsons.timelineEvents) {
        loadedJsons.timelineEvents = JSON.parse(
            readFileSync(timelineEventsPath, 'utf-8')
        );
    }

    return loadedJsons.timelineEvents;
}


const mcpSchemasPath = path.join(__dirname, '../../resources/schemas/mcp/json/');
export function getMcpSchema(operation: string)  {
    if (!loadedJsons[`schema_${operation}`]) {
        const filePath = path.join(mcpSchemasPath, `${operation}.json`);
        loadedJsons[`schema_${operation}`] = JSON.parse(
            readFileSync(filePath, 'utf-8')
        );
    }

    return loadedJsons[`schema_${operation}`];
}

export function getMcpSchemaList()  {
    return new Set(readdirSync(mcpSchemasPath).map(file => file.replace('.json', '')));
}


const campaignItemsIds = path.join(__dirname, '../../resources/campaign/items.json');
export function getCampaignItems(): string[]  {
    if (!loadedJsons.campaignItemsIds) {
        loadedJsons.campaignItemsIds = JSON.parse(
            readFileSync(campaignItemsIds, 'utf-8')
        );
    }

    return loadedJsons.campaignItemsIds;
}

const battlePassFolder = path.join(__dirname, '../../resources/battlePass');
export function getBattlePassInfo(seasonNum: number): Battlepass  {
    if (!loadedJsons[`BPSeason${seasonNum}`]) {
        const filepath = path.join(battlePassFolder, `season${seasonNum}.json`)
        loadedJsons[`BPSeason${seasonNum}`] = JSON.parse(
            readFileSync(filepath, 'utf-8')
        );
    }

    return loadedJsons[`BPSeason${seasonNum}`];
}

const winterfestFile = path.join(__dirname, '../../resources/winterfest.json');
export function getWinterfestRewards(): Record<string, string[]>  {
    if (!loadedJsons.winterfestRewards) {
        loadedJsons.winterfestRewards = JSON.parse(
            readFileSync(winterfestFile, 'utf-8')
        );
    }

    return loadedJsons.winterfestRewards;
}