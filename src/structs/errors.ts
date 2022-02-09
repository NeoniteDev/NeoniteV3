import { Response } from 'express-serve-static-core';

// todo: param message builder

interface ResponseBody {
    errorCode: string
    errorMessage: string
    messageVars?: string[]
    numericErrorCode: number | null
    originatingService: 'Neonite'
    intent: string
    validationFailures?: Record<string, Object>
}

export class ApiError {
    constructor(code: string, message: string, numeric: number | null, statusCode: number) {
        this.statusCode = statusCode;

        this.response = {
            errorCode: code,
            errorMessage: message,
            messageVars: undefined,
            numericErrorCode: numeric,
            originatingService: 'Neonite',
            intent: 'unknown'
        }
    }

    statusCode: number;
    response: ResponseBody;

    withMessage(message: string): typeof this {
        this.response.errorMessage = message;
        return this;
    }

    with(...messagevars: string[]): typeof this {
        if (!this.response.messageVars) {
            this.response.messageVars = messagevars;
        } else {
            this.response.messageVars = this.response.messageVars.concat(messagevars);
        }

        return this;
    }

    appendMessage(message: string): typeof this {
        this.response.errorMessage += message;
        return this;
    }

    apply(res: Response): typeof res {
        return res.status(this.statusCode)
            .set("X-Epic-Error-Code", typeof this.response.numericErrorCode || 1001)
            .set("X-Epic-Error-Name", typeof this.response.errorMessage)
            .json(this.response);
    }
}

export const neoniteDev = {
    authentication: {
        get invalidHeader() { return new ApiError('errors.com.neoniteDev.authentication.invalidHeader', 'It looks like your authorization header is invalid or missing, please verify that you are sending the correct headers.', 1011, 400) },
        get invalidRequest() { return new ApiError('errors.com.neoniteDev.authentication.invalidRequest', 'The request body you provided is either invalid or missing elements.', 1013, 400) },
        get grantNotImplemented() { return new ApiError('errors.com.neoniteDev.authentication.grantNotImplemented', 'The grant_type you used is not supported by the server.', 1016, 501) },
        get wrongGrantType() { return new ApiError('errors.com.neoniteDev.authentication.wrongGrantType', 'Sorry, your client does not have the proper grant_type for access.', 1016, 400) },
        get notYourAccount() { return new ApiError('errors.com.neoniteDev.authentication.notYourAccount', "You are not allowed to make changes to other people's accounts", 1023, 403) },
        get validation_failed() { return new ApiError('errors.com.neoniteDev.authentication.validation_failed', "Sorry we couldn't validate your token. Please try with a new token.", 1031, 401) },
        get authenticationFailed() { return new ApiError('errors.com.neoniteDev.authentication.authenticationFailed', "Authentication failed.", 1032, 401) },
        get invalidGrant() { return new ApiError('errors.com.neoniteDev.authentication.invalidGrant', 'Invalid email or password.', 18031, 403) },
        get invalidRefresh() { return new ApiError('errors.com.neoniteDev.authentication.invalidRefresh', 'The refresh token you provided is invalid.', 18036, 400) },
        get invalidClient() { return new ApiError('errors.com.neoniteDev.authentication.invalidClient', 'The client credentials you are using are invalid.', 18033, 403) },
        get invalidExchange() { return new ApiError('errors.com.neoniteDev.authentication.invalidExchange', 'The exchange code you provided is invalid.', 18057, 400) },
        get tooManySessions() { return new ApiError('errors.com.neoniteDev.authentication.tooManySessions', 'Sorry too many sessions have been issued for your account. Please try again later', 18048, 400) },
        get notOwnSessionRemoval() { return new ApiError('errors.com.neoniteDev.authentication.notOwnSessionRemoval', 'Sorry you cannot remove the auth session. It was not issued to you.', 18040, 403) },
        get unknownSession() { return new ApiError('errors.com.neoniteDev.authentication.unknownSession', 'Sorry we could not find the auth session', 18051, 404) },
    },
    party: {
        get partyNotFound() { return new ApiError('errors.com.neoniteDev.party.partyNotFound', 'Party does not exist.', 51002, 404) },
        get memberNotFound() { return new ApiError('errors.com.neoniteDev.party.memberNotFound', 'Party member does not exist.', 51004, 404) },
        get alreadyInParty() { return new ApiError('errors.com.neoniteDev.party.alreadyInParty', 'Your already in a party.', 51012, 409) },
        get userHasNoParty() { return new ApiError('errors.com.neoniteDev.party.userHasNoParty', 'User has no party to join.', 51019, 404) },
        get notLeader() { return new ApiError('errors.com.neoniteDev.party.notLeader', 'You are not the party leader.', 51015, 403) },
        get pingNotFound() { return new ApiError('errors.com.neoniteDev.party.pingNotFound', "Sorry, we couldn't find a ping.", 51021, 404) },
        get pingForbidden() { return new ApiError('errors.com.neoniteDev.party.pingForbidden', 'User is not authorized to send pings the desired user', 51020, 403) },
        get notYourAccount() { return new ApiError('errors.com.neoniteDev.party.notYourAccount', "You are not allowed to make changes to other people's accounts", 51023, 403) },
        get userOffline() { return new ApiError('errors.com.neoniteDev.party.userOffline', 'User is offline.', 51024, 403) },
        get selfPing() { return new ApiError('errors.com.neoniteDev.party.selfPing', 'Self pings are not allowed.', 51028, 400) },
        get selfInvite() { return new ApiError('errors.com.neoniteDev.party.selfInvite', 'Self invites are not allowed.', 51040, 400) },
    },
    cloudstorage: {
        get fileNotFound() { return new ApiError('errors.com.neoniteDev.cloudstorage.fileNotFound', 'Cannot find the file you requested.', 12004, 404) }
    },
    account: {
        get toManyAccounts() { return new ApiError('errors.com.neoniteDev.account.toManyAccounts', "You are trying to query too many accounts at a time", 18066, 400) },
        get accountNotFound() { return new ApiError('errors.com.neoniteDev.account.accountNotFound', "Sorry, we couldn't find an account for {displayName}", 18007, 404) },
    },
    mcp: {
        get wrongCommand() { return new ApiError("errors.com.neoniteDev.mcp.wrongCommand", "Wrong command.", 12801, 400) },
        get itemNotFound() { return new ApiError("errors.com.neoniteDev.mcp.itemNotFound", "Locker item not found", 16006, 404) },
        get templateNotFound() { return new ApiError("errors.com.neoniteDev.mcp.templateNotFound", "Unable to find template configuration for profile", 12813, 404) },
        get invalidHeader() { return new ApiError("errors.com.neoniteDev.mcp.invalidHeader", "Parsing client revisions header failed.", 12831, 400) },
        get operationNotFound() { return new ApiError("errors.com.neoniteDev.mcp.operationNotFound", "Operation not found", 16035, 404) },
        get operationForbidden() { return new ApiError("errors.com.neoniteDev.mcp.operationForbidden", "Operation Forbidden", 12813, 403) },
        get invalidChatRequest() { return new ApiError("errors.com.neoniteDev.mcp.invalidChatRequest", "", 16090, 400) },
    },
    matchmaking: {
        get unknownSession() { return new ApiError('errors.com.neoniteDev.matchmaking.unknownSession', "unknown session id", 12101, 404) },
        get missingCookie() { return new ApiError('errors.com.neoniteDev.matchmaking.missingCookie', "Missing NetCL cookie", null, 400) },
        get invalidBucketId() { return new ApiError('errors.com.neoniteDev.matchmaking.invalidBucketId', "blank or invalid bucketId", 16102, 400) },
        get invalidPartyPlayers() { return new ApiError('errors.com.neoniteDev.matchmaking.invalidPartyPlayers', "blank or invalid partyPlayerIds", 16103, 400) },
        get invalidPlatform() { return new ApiError('errors.com.neoniteDev.matchmaking.invalidPlatform', "invalid platform", 16104, 400) },
    },
    shop: {
        get itemNotFound() { return new ApiError('errors.com.neoniteDev.shop.itemNotFound', "Could not find the catalog item you requested", 28001, 400) },
    },
    friends: {
        get selfFriend() { return new ApiError('errors.com.neoniteDev.friends.selfFriend', "You cannot be friend with yourself.", 14001, 400) },
        get accountNotFound() { return new ApiError('errors.com.neoniteDev.friends.accountNotFound', "Account does not exist", 14011, 404) },
        get friendshipNotFound() { return new ApiError('errors.com.neoniteDev.friends.friendshipNotFound', "Friendship does not exist", 14004, 404) },
        get requestAlreadySent() { return new ApiError('errors.com.neoniteDev.friends.requestAlreadySent', "Friendship request has already been sent.", 14014, 409) }
    },
    internal: {
        get validationFailed() { return new ApiError('errors.com.neoniteDev.internal.validationFailed', '', 1040, 400) },
        get invalidUserAgent() { return new ApiError('errors.com.neoniteDev.internal.invalidUserAgent', 'The user-agent header you provided does not mach a unreal engine formated user-agent', 16183, 400) },
        get serverError() { return new ApiError('errors.com.neoniteDev.internal.serverError', 'Sorry an error occurred and we were unable to resolve it.', 1000, 500) },
        get jsonParsingFailed() { return new ApiError('errors.com.neoniteDev.internal.jsonParsingFailed', 'Json parse failed.', 1020, 400) },
        get requestTimedOut() { return new ApiError('errors.com.neoniteDev.internal.requestTimedOut', "Request timed out.", null, 408) },
        get unsupportedMediaType() { return new ApiError('errors.com.neoniteDev.internal.unsupportedMediaType', "Sorry, your request could not be processed because you provide a type of media that we do not support.", 1006, 415) },
        get notImplemented() { return new ApiError('errors.com.neoniteDev.internal.notImplemented', 'The resource you were trying to find is not yet implemented by the server.', null, 501) },
        get dataBaseError() { return new ApiError('errors.com.neoniteDev.internal.dataBaseError', 'There was an error while interacting with the database. Please report this issue.', null, 500) },
        get unknownError() { return new ApiError('errors.com.neoniteDev.internal.unknownError', 'Sorry an error occurred and we were unable to resolve it.', null, 500) },
        get eosError() { return new ApiError('errors.com.neoniteDev.internal.EosError', 'Sorry an error occurred while communication with Epic Online Service Servers.', null, 500) },
    },
    basic: {
        get badRequest() { return new ApiError('errors.com.neoniteDev.basic.badRequest', "Sorry but your request is invalid.", 1001, 400) },
        get notFound() { return new ApiError('errors.com.neoniteDev.basic.notFound', "the resource you were trying to find could not be found.", 1004, 404) },
        get notAcceptable() { return new ApiError('errors.com.neoniteDev.basic.notAcceptable', 'Sorry your request could not be processed as you do not accept the response type generated by this resource. Please check your Accept header.', 1008, 406) },
        get methodNotAllowed() { return new ApiError('errors.com.neoniteDev.basic.methodNotAllowed', 'Sorry the resource you were trying to access cannot be accessed with the HTTP method you used.', 1009, 405) },
        get jsonMappingFailed() { return new ApiError('errors.com.neoniteDev.basic.jsonMappingFailed', 'Json mapping failed.', 1019, 400) }
    }
};

export default { neoniteDev: neoniteDev };