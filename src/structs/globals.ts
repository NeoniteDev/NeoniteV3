import Party from "./Party";
import { partyPing, XmppClient } from "./types";
import client from "../websocket/xmpp/client";

export const xmppClients : client[] = [];
export const parties : Party[] = [];
export const pings : partyPing[]= [];