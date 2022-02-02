CREATE TABLE IF NOT EXISTS friends (
    sentBy VARCHAR(32) NOT NULL,
    sentTo VARCHAR(32) NOT NULL,
    createdAt BIGINT NOT NULL,
    `status` TEXT NOT NULL,
    /* from the sentBy */
    favorite BIT DEFAULT 0,
    note TEXT DEFAULT '',
    alias TEXT DEFAULT '',
    /* from the sentTo  */
    friendFavorite BIT DEFAULT 0,
    friendNote TEXT DEFAULT '',
    friendAlias TEXT DEFAULT ''
);