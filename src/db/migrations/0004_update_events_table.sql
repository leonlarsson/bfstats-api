-- Migration number: 0004 	 2024-11-13T13:54:40.861Z
-- Step 1: Create a new table with NOT NULL constraints
CREATE TABLE IF NOT EXISTS events_new (
    event TEXT NOT NULL,
    date INTEGER NOT NULL
);

-- Step 2: Copy all data from the old table to the new table
INSERT INTO
    events_new
SELECT
    *
FROM
    events;

-- Step 3: Drop the old table
DROP TABLE events;

-- Step 4: Rename the new table to the original table name
ALTER TABLE
    events_new RENAME TO events;