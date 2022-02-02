CREATE TABLE IF NOT EXISTS blocklist (
    accountId varchar(32) not null,
    blockedId varchar(32) not null,
    createdAt BIGINT not null
);