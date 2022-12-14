import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../utils/types';
import errors from '../../utils/errors'

export const supportedProfiles = '*';

export async function handle(config: Handleparams, profile: Profile): Promise<mcpResponse> {
    profile.setStat('season_num', config.clientInfos.season);

    return await profile.generateResponse(config);
}