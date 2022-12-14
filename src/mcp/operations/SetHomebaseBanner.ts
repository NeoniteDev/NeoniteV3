import { mcpResponse, Handleparams } from '../operations'
import { Profile, ensureProfileExist } from '../profile'
import { profile as types } from '../../utils/types';
import errors from '../../utils/errors'
import * as path from 'path';
import { readFileSync } from 'fs';
import { validate, ValidationError } from 'jsonschema';
import * as resources from '../../utils/resources';

export const supportedProfiles: types.ProfileID[] = [
    'common_public', 'profile0'
]

type body = {
    "homebaseBannerIconId": string,
    "homebaseBannerColorId": string
}
export async function handle(config: Handleparams<body>, profile: Profile): Promise<mcpResponse> {
    if (config.profileId == 'profile0') {
        if (!profile.stats.attributes.homebase) throw errors.neoniteDev.internal.dataBaseError;
        const bisNewbannerIconId = profile.stats.attributes.homebase.bannerIconId != config.body.homebaseBannerIconId
        const bisNewbannerColorId = profile.stats.attributes.homebase.bannerColorId != config.body.homebaseBannerColorId

        if (bisNewbannerIconId) {
            profile.stats.attributes.homebase.bannerIconId = config.body.homebaseBannerIconId;
        }

        if (bisNewbannerColorId) {
            profile.stats.attributes.homebase.bannerColorId = config.body.homebaseBannerColorId;
        }


        if (bisNewbannerIconId || bisNewbannerColorId) {
            profile.setStat('homebase', profile.stats.attributes.homebase);
        }
    } else {
        profile.setStat('banner_icon', config.body.homebaseBannerIconId);
        profile.setStat('banner_color', config.body.homebaseBannerColorId);
    }


    return await profile.generateResponse(config);
}