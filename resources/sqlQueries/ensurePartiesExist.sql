CREATE TABLE IF NOT EXISTS parties (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    members TEXT NOT NULL,
    config TEXT NOT NULL,
    meta TEXT NOT NULL,
    invites TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    revision INT NOT NULL
);