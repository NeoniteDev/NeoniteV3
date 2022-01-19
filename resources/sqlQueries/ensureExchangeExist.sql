CREATE TABLE IF NOT EXISTS ExchangeCodes (
    code varchar(32) not null,
    accountId varchar(32) not null,
    createdAt BIGINT not null,
    expireAt BIGINT not null
);