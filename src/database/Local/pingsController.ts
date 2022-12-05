interface partyPing {
    sent_by: string,
    sent_to: string,
    sent_at: Date,
    expires_at: Date,
    meta: Record<string, string>
}

const localPings: partyPing[] = [];

namespace pings {

    export async function create(infos: partyPing) {
        localPings.push(infos);
    }

    export async function get(pinger: string, target: string) {
        return localPings.find(x => x.sent_by == pinger && x.sent_to == target);
    }

    export async function remove(pinger: string, target: string) {
        localPings.slice(localPings.findIndex(x => x.sent_by == pinger && x.sent_to == target), 1);
    }

    export async function getUserPings(target: string) {
        return localPings.filter(x => x.sent_to == target);
    }

    export async function getSentPings(pinger: string) {
        return localPings.filter(x => x.sent_by == pinger);
    }
}

export default pings;