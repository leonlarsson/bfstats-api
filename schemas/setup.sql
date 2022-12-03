DROP TABLE IF EXISTS users;
CREATE TABLE users (user_id TEXT NOT NULL PRIMARY KEY, username TEXT NOT NULL, last_stats_sent INTEGER, last_language TEXT, total_stats_sent INTEGER);

DROP TABLE IF EXISTS output;
CREATE TABLE output (user_id TEXT NOT NULL, username TEXT NOT NULL, guild_name TEXT, guild_id TEXT, game TEXT, segment TEXT, language TEXT, date INTEGER, message_url TEXT, image_url TEXT);