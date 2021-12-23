import { Response } from 'express-serve-static-core';

interface ResponseBody {
    errorCode: string
    errorMessage: string
    messageVars?: string[]
    numericErrorCode: number
    originatingService: 'neonite'
    intent: 'unknown'
}

export class ApiError {
    constructor(code: string, message: string, numeric: number, statusCode: number) {
        this.statusCode = statusCode;

        this.response = {
            errorCode: code,
            errorMessage: message,
            messageVars: undefined,
            numericErrorCode: numeric,
            originatingService: 'neonite',
            intent: 'unknown'
        }
    }

    statusCode: number;
    response: ResponseBody;

    withMessage(message: string): typeof this {
        this.response.errorMessage = message;
        return this;
    }

    with(...messagevars): typeof this {
        if (!this.response.messageVars) {
            this.response.messageVars = messagevars;
        } else {
            this.response.messageVars = this.response.messageVars.concat(messagevars);
        }

        return this;
    }

    apply(res: Response): typeof res {
        return res.status(this.statusCode)
            .set("X-Epic-Error-Code", typeof this.response.numericErrorCode)
            .set("X-Epic-Error-Name", typeof this.response.errorMessage)
            .json(this.response);
    }
}

export const neoniteDev = {
    authentication: {
        get invalidHeader() { return new ApiError('errors.neoniteDev.authentication.invalidHeader', 'It looks like your authorization header is invalid or missing, please verify that you are sending the correct headers.', 1011, 400) },
        get invalidRequest() { return new ApiError('errors.neoniteDev.authentication.invalidRequest', 'The request body you provided is either invalid or missing elements.', 1013, 400) },
        get grantNotImplemented() { return new ApiError('errors.neoniteDev.authentication.grantNotImplemented', 'The grant_type you used is not supported by the server.', 1016, 501) },
        get wrongGrantType() { return new ApiError('errors.neoniteDev.authentication.wrongGrantType', 'Sorry, your client does not have the proper grant_type for access.', 1016, 400) },
        get notYourAccount() { return new ApiError('errors.neoniteDev.authentication.notYourAccount', "You are not allowed to make changes to other people's accounts", 1023, 403) },
        get validation_failed() { return new ApiError('errors.neoniteDev.authentication.validation_failed', "Sorry we couldn't validate your token. Please try with a new token.", 1031, 401) },
        get authenticationFailed() { return new ApiError('errors.neoniteDev.authentication.authenticationFailed', "Authentication failed.", 1032, 401) },
        get invalidGrant() { return new ApiError('errors.neoniteDev.authentication.invalidGrant', 'Invalid email or password.', 18031, 403) },
        get invalidRefresh() { return new ApiError('errors.neoniteDev.authentication.invalidRefresh', 'The refresh token you provided is invalid.', 18036, 400) },
        get invalidClient() { return new ApiError('errors.neoniteDev.authentication.invalidClient', 'The client credentials you are using are invalid.', 18033, 403) },
        get invalidExchange() { return new ApiError('errors.neoniteDev.authentication.invalidExchange', 'The exchange code you provided is invalid.', 18057, 400) },
    },
    party: {
        get partyNotFound() { return new ApiError('errors.neoniteDev.party.partyNotFound', 'Party does not exist.', 51002, 404) },
        get memberNotFound() { return new ApiError('errors.neoniteDev.party.memberNotFound', 'Party member does not exist.', 51004, 404) },
        get alreadyInParty() { return new ApiError('errors.neoniteDev.party.alreadyInParty', 'Your already in a party.', 51012, 409) },
        get userHasNoParty() { return new ApiError('errors.neoniteDev.party.userHasNoParty', 'User has no party to join.', 51019, 404) },
        get notLeader() { return new ApiError('errors.neoniteDev.party.notLeader', 'You are not the party leader.', 51015, 403) },
        get pingNotFound() { return new ApiError('errors.neoniteDev.party.pingNotFound', "Sorry, we couldn't find an invitation", 51021, 404) },
        get notYourAccount() { return new ApiError('errors.neoniteDev.party.notYourAccount', "You are not allowed to make changes to other people's accounts", 51023, 403) },
        get userOffline() { return new ApiError('errors.neoniteDev.party.userOffline', 'User is offline.', 51024, 403) },
    },
    cloudstorage: {
        get fileNotFound() { return new ApiError('errors.neoniteDev.cloudstorage.fileNotFound', 'Cannot find the file you requested.', 12004, 406) }
    },
    account: {
        get toManyAccounts() { return new ApiError('errors.neoniteDev.account.toManyAccounts', "You are trying to query too many accounts at a time", 18066, 400) },
    },
    mcp: {
        get itemNotFound() { return new ApiError("errors.neoniteDev.mcp.itemNotFound", "Locker item not found", 16006, 404) },
        get operationNotFound() { return new ApiError("errors.neoniteDev.mcp.operationNotFound", "Operation not valid", 16035, 404) },
        get templateNotFound() { return new ApiError("errors.neoniteDev.mcp.templateNotFound", "Unable to find template configuration for profile", 12813, 404) },
    },
    matchmaking: {
        get missingCookie() { return new ApiError('errors.neoniteDev.matchmaking.missingCookie', "Missing NetCL cookie", null, 400) },
        get invalidBucketId() { return new ApiError('errors.neoniteDev.matchmaking.invalidBucketId', "blank or invalid bucketId", 16102, 400) },
        get invalidPartyPlayers() { return new ApiError('errors.neoniteDev.matchmaking.invalidPartyPlayers', "blank or invalid partyPlayerIds", 16103, 400) },
        get invalidPlatform() { return new ApiError('errors.neoniteDev.matchmaking.invalidPlatform', "blank or invalid platform", 16104, 400) },
    },
    shop: {
        get itemNotFound() { return new ApiError('errors.neoniteDev.shop.itemNotFound', "Could not find the catalog item you requested", 28001, 400) },
    },
    friends: {
        get selfFriend() { return new ApiError('errors.neoniteDev.friends.selfFriend', "You cannot be friend with yourself.", 14001, 400) }
    },
    internal: {
        get invalidUserAgent() { return new ApiError('errors.neoniteDev.internal.invalidUserAgent', 'The user-agent header you provided does not mach a fortnite user-agent', 16183, 400) },
        get serverError() { return new ApiError('errors.neoniteDev.internal.serverError', 'Sorry an error occurred and we were unable to resolve it.', 1000, 500) },
        get jsonParsingFailed() { return new ApiError('errors.neoniteDev.internal.jsonParsingFailed', 'Json parse failed.', 1020, 400) },
        get requestTimedOut() { return new ApiError('errors.neoniteDev.internal.requestTimedOut', "Request timed out.", null, 408) },
        get unsupportedMediaType() { return new ApiError('errors.neoniteDev.internal.unsupportedMediaType', "Sorry, your request could not be processed because you provide a type of media that we do not support.", 1006, 415) },
        get notImplemented() { return new ApiError('errors.neoniteDev.internal.notImplemented', 'The resource you were trying to find is not yet implemented by the server.', null, 501) },
        get dataBaseError() { return new ApiError('errors.neoniteDev.internal.dataBaseError', 'There was an error while interacting with the database. Please report this issue.', null, 500) },
    },
    basic: {
        get notFound() { return new ApiError('errors.neoniteDev.basic.notFound', "the resource you were trying to find could not be found.", 1004, 404) },
        get notAcceptable() { return new ApiError('errors.neoniteDev.basic.notAcceptable', 'Sorry your request could not be processed as you do not accept the response type generated by this resource. Please check your Accept header.', 1008, 406) },
        get methodNotAllowed() { return new ApiError('errors.neoniteDev.basic.methodNotAllowed', 'Sorry the resource you were trying to access cannot be accessed with the HTTP method you used.', 1009, 405) }
    }
};

export default { neoniteDev: neoniteDev };