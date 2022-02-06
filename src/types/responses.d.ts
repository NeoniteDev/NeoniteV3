export namespace EOS {
    export interface room {
        roomId: string;
        participants: {
            puid: string;
            token: string;
            hardMuted: boolean;
        }[];
        deploymentId: string;
        clientBaseUrl: string;
    }


    export interface oAuthToken {
        access_token: string;
        token_type: string;
        expires_at: string;
        features: string[];
        organization_id: string;
        product_id: string;
        sandbox_id: string;
        deployment_id: string;
        expires_in: number;
    }

    export interface ApiError {
        messageVars: string[];
        errorMessage: string;
        errorCode: string;
        correlationId: string;
        numericErrorCode: number;
        responseStatus: number;
        intent: string;
        originatingService: string;
    }
}

export namespace XmppApi {
    export interface SessionResponse {
        sessions: Session[];
        session: Session[];
    }

    export interface Session {
        sessionId: string;
        username: string;
        resource: string;
        node: string;
        sessionStatus: string;
        presenceStatus: string;
        presenceMessage: string;
        priority: number;
        hostAddress: string;
        hostName: string;
        creationDate: number;
        lastActionDate: number;
        secure: boolean;
    }

    export interface ChatRoom {
        roomName: string;
        naturalName: string;
        description: string;
        password?: any;
        subject: string;
        creationDate: number;
        modificationDate: number;
        maxUsers: number;
        persistent: boolean;
        publicRoom: boolean;
        registrationEnabled: boolean;
        canAnyoneDiscoverJID: boolean;
        canOccupantsChangeSubject: boolean;
        canOccupantsInvite: boolean;
        canChangeNickname: boolean;
        logEnabled: boolean;
        loginRestrictedToNickname: boolean;
        membersOnly: boolean;
        moderated: boolean;
        broadcastPresenceRole: string[];
        owner: string[];
        admin: any[];
        member: any[];
        outcast: any[];
        ownerGroup: any[];
        adminGroup: any[];
        memberGroup: any[];
        outcastGroup: any[];
    }

    export interface ChatRoomRoot {
        chatRoom: ChatRoom[];
    }

    export interface ParticipantRoot {
        participant: Participant[];
    }
    
    export interface Participant {
        jid:         string;
        role:        string;
        affiliation: string;
    }
    
}
