CREATE TABLE IF NOT EXISTS save_configs (
    /* ACCOUNTID:FILENAME */
    `dbName` VARCHAR(100) NOT NULL PRIMARY KEY,
    `accountId` VARCHAR(32) NOT NULL,
    `fileName`  VARCHAR(25) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `sha256` VARCHAR(256),
    `sha1` VARCHAR(160),
    `length` INT,
    `uploaded` VARCHAR(25)
);