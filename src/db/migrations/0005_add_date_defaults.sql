-- Migration number: 0005 	 2024-11-13T14:08:29.702Z
-- Update the existing 'outputs' table to convert millisecond timestamps into the 'YYYY-MM-DD HH:MM:SS' format
UPDATE
    outputs
SET
    date = strftime(
        '%Y-%m-%d %H:%M:%S',
        datetime(date / 1000, 'unixepoch')
    );

-- Update the existing 'events' table to convert millisecond timestamps into the 'YYYY-MM-DD HH:MM:SS' format
UPDATE
    events
SET
    date = strftime(
        '%Y-%m-%d %H:%M:%S',
        datetime(date / 1000, 'unixepoch')
    );

-- Update the existing 'users' table to convert millisecond timestamps into the 'YYYY-MM-DD HH:MM:SS' format
UPDATE
    users
SET
    last_stats_sent = strftime(
        '%Y-%m-%d %H:%M:%S',
        datetime(last_stats_sent / 1000, 'unixepoch')
    );

-- Create outputs table with new date column type
CREATE TABLE IF NOT EXISTS outputs_new (
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    guild_name TEXT,
    guild_id TEXT,
    game TEXT NOT NULL,
    segment TEXT NOT NULL,
    language TEXT NOT NULL,
    date TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    message_url TEXT,
    image_url TEXT,
    identifier TEXT
);

INSERT INTO
    outputs_new
SELECT
    *
FROM
    outputs;

DROP TABLE outputs;

ALTER TABLE
    outputs_new RENAME TO outputs;

-- Recreate the indexes (indices?) on the 'outputs' table
CREATE INDEX IF NOT EXISTS idx_outputs_identifier ON outputs (identifier);

CREATE INDEX IF NOT EXISTS idx_outputs_date ON outputs (date);

CREATE INDEX IF NOT EXISTS idx_outputs_game_date ON outputs (game, date);

-- Create events table with new date column type
CREATE TABLE IF NOT EXISTS events_new (
    event TEXT NOT NULL,
    date TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
);

INSERT INTO
    events_new
SELECT
    *
FROM
    events;

DROP TABLE events;

ALTER TABLE
    events_new RENAME TO events;

-- Create users table with new date column type
CREATE TABLE IF NOT EXISTS users_new (
    user_id TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL,
    last_stats_sent TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    last_language TEXT NOT NULL,
    total_stats_sent INTEGER NOT NULL DEFAULT 1
);

INSERT INTO
    users_new
SELECT
    *
FROM
    users;

DROP TABLE users;

ALTER TABLE
    users_new RENAME TO users;