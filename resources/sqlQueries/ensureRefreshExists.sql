CREATE TABLE IF NOT EXISTS refresh_tokens (
    token varchar(32) not null, 
    clientId varchar(32) not null,
    auth_method varchar(50) not null,
    internal INT not null,
    expireAt BIGINT not null,
    client_service varchar(50) not null,
    bearer_token varchar(32) not null,
    deviceId varchar(32),
    account_id varchar(32),
    displayName varchar(50),
    in_app_id varchar(32) 
);