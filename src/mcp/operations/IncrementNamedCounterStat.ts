import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile } from '../../utils/types'
import errors from '../../utils/errors'

export const supportedProfiles = [
    'profile0'
]

interface body {
    counterName: string
}

export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {
    if (typeof config.body.counterName !== 'string') throw errors.neoniteDev.mcp.invalidPayload;

    // @ts-ignore
    const named_counters: profile.StatsAttributes['named_counters'] = profile.stats.attributes.named_counters;
    named_counters[config.body.counterName].current_count++;
    named_counters[config.body.counterName].last_incremented_time = new Date().toISOString();

    profile.setStat('named_counters', named_counters);
    return await profile.generateResponse(config);
}