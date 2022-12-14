const errors = require('./errors');
const { ApiException } = errors;

/** @type {[['type','any'],['joinability',['OPEN','INVITE_AND_FORMER']],['discoverability',['INVITED_ONLY','ALL']],['sub_type','any'],['max_size','any'],['invite_ttl','any'],['join_confirmation',[true,false]],['intention_ttl','any']]} */
const ConfigRequire = Object.entries({
    type: 'any',
    joinability: ['OPEN', 'INVITE_AND_FORMER'],
    discoverability: ['INVITED_ONLY', 'ALL'],
    sub_type: 'any',
    max_size: 'any',
    invite_ttl: 'any',
    join_confirmation: [true, false],
    intention_ttl: 'any'
})


function ValidateConfig(body, validationFailures, MustNotNull = false) {
    if ('config' in body) {
        if (body.config.constructor != Object) {
            throw new ApiException(errors.com.epicgames.common.json_mapping_error).With('config')
        }
        const bPass = ConfigRequire.some(([key, values]) => body.config[key] != undefined && values.includes(body.config[key]));

        if (!bPass) {
            validationFailures['body.config'] = {
                fieldName: 'body.config',
                errorMessage: 'Operation requires at least one value to be present.',
                errorCode: 'errors.com.epicgames.validation.validation_failed',
                invalidValue: "{type=null, joinability=null, discoverability=null, sub_type='null', max_size=null, invite_ttl=null, join_confirmation=null, intention_ttl=null}",
                messageVars: {}
            };
        }
    } else if (MustNotNull) {
        validationFailures['body.config'] = {
            fieldName: 'body.config',
            errorMessage: 'must not be null',
            errorCode: 'neonite.validation.constraints.NotNull',
            invalidValue: 'null',
            messageVars: {}
        }
    }
}

function ValidateJoinInfo(JoinInfo, validationFailures, MustNotNull = false) {

}

function ValidateMeta(meta, validationFailures, MustNotNull = false) {
    if (meta.constructor != Object) {
        throw new ApiException(errors.com.epicgames.common.json_mapping_error).With('meta')
    }

    if ('delete' in meta && meta.delete.constructor != Array) {
        throw new ApiException(errors.com.epicgames.common.json_mapping_error)
            .With('meta', 'delete')
    }

    if ('update' in meta && meta.update.constructor != Object) {
        throw new ApiException(errors.com.epicgames.common.json_mapping_error)
            .With('meta', 'update')
    }

    if ('override' in meta && meta.override.constructor != Object) {
        throw new ApiException(errors.com.epicgames.common.json_mapping_error)
            .With('meta', 'override')
    }


    const bDeleteInvalid = !meta.delete || meta.delete.length == 0;
    const bUpdateInvalid = !meta.update || Object.keys(meta.update).length == 0;
    const bOverrideInvalid = !meta.override || meta.override != Object || Object.keys(meta.override).length == 0;

    if (bDeleteInvalid && bUpdateInvalid && bOverrideInvalid) {
        validationFailures['meta'] = {
            fieldName: 'meta',
            errorMessage: 'Operation requires at least one value to be present.',
            errorCode: 'errors.com.epicgames.validation.validation_failed',
            invalidValue: "{delete=[], update={}, override={}}",
            messageVars: {}
        };
    }
}

function ValidateRevision(body, validationFailures, MustNotNull = true) {
    if ('revision' in body) {
        if (typeof body.revision !== 'number') {
            if (typeof body.revision === 'string') {
                var parsed = parseInt(body.revision)
                if (!isNaN(parsed)) {
                    body.revision = parsed
                    return;
                }
            }
            throw new ApiException(errors.com.epicgames.common.json_mapping_error).With('revision')
        }
    } else if (MustNotNull) {
        validationFailures['body.revision'] = {
            fieldName: 'body.revision',
            errorMessage: 'must not be null',
            errorCode: 'neonite.validation.constraints.NotNull',
            invalidValue: 'null',
            messageVars: {}
        };
    }
}

function ValidatePartyPatch(body) {
    var validationFailures = {};

    if (!('meta' in body) && !('config' in body)) {
        validationFailures.body = {
            fieldName: 'body',
            errorMessage: 'Operation requires at least one value to be present.',
            errorCode: 'errors.com.epicgames.validation.validation_failed',
            invalidValue: `{config=null, meta=null, revision=${typeof body.revision === 'number' ? body.revision : 'null'}}`,
            messageVars: {}
        };
    }

    ValidateRevision(body);
    ValidateConfig(body, validationFailures);

    if ('meta' in body) {
        ValidateMeta(body.meta, validationFailures);
    }

    var failureKeys = Object.keys(validationFailures);

    if (failureKeys.length !== 0) {
        const Exception = new ApiException(errors.com.epicgames.validation.validation_failed);
        Exception.With(`[${failureKeys.join(', ')}]`);
        Exception.Add('validationFailures', validationFailures);
        throw Exception;
    } else {
        return;
    }
}

module.exports.ValidatePartyPatch = ValidatePartyPatch;
module.exports.ValidateMeta = ValidateMeta;