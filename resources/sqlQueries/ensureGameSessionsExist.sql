CREATE TABLE IF NOT EXISTS gameSessions (
    `id` VARCHAR(32) NOT NULL PRIMARY KEY,
    `ownerName` TEXT NOT NULL,
    `serverName` TEXT NOT NULL,
    `severIp` TEXT NOT NULL,
    `maxPlayers` INT NOT NULL,
    `minPlayers` INT NOT NULL,
    `availableTo` BIT NOT NULL,
    `numPlayers` INT DEFAULT 0,
    `players` TEXT DEFAULT "",
    `createdAt` BIGINT,
    `expireAt` BIGINT
);