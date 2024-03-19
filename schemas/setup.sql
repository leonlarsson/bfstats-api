DROP TABLE IF EXISTS users;
CREATE TABLE users (user_id TEXT NOT NULL PRIMARY KEY, username TEXT NOT NULL, last_stats_sent INTEGER, last_language TEXT, total_stats_sent INTEGER);

DROP TABLE IF EXISTS outputs;
CREATE TABLE outputs (user_id TEXT NOT NULL, username TEXT NOT NULL, guild_name TEXT, guild_id TEXT, game TEXT, segment TEXT, language TEXT, date INTEGER, message_url TEXT, image_url TEXT, identifier TEXT);

DROP TABLE IF EXISTS events;
CREATE TABLE events (event TEXT, date INTEGER);