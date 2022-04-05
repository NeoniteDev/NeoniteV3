import * as NodeCache from "node-cache";
import Party from "./Party";
import { partyPing } from "./types";

export const xmppClients : any[] = [];
export const parties : Party[] = [];
export const pings : partyPing[]= [];

export const tokenCache = new NodeCache(
    {
        checkperiod: 60,
        useClones: false
    }
)