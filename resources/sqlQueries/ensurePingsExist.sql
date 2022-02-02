CREATE TABLE IF NOT EXISTS pings (
    `pinger` varchar(32) not null,
    `target` varchar(32) not null,
    `createdAt` BIGINT,
    `expireAt` BIGINT,
    `meta` TEXT
);