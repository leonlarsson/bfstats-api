-- Migration number: 0001 	 2024-04-26T14:59:07.921Z
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL,
    last_stats_sent INTEGER,
    last_language TEXT,
    total_stats_sent INTEGER
);

CREATE TABLE IF NOT EXISTS outputs (
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    guild_name TEXT,
    guild_id TEXT,
    game TEXT,
    segment TEXT,
    language TEXT,
    date INTEGER,
    message_url TEXT,
    image_url TEXT,
    identifier TEXT
);

CREATE TABLE IF NOT EXISTS events (event TEXT, date INTEGER);

CREATE INDEX IF NOT EXISTS idx_outputs_identifier ON outputs (identifier);