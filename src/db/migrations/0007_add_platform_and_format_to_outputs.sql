-- Migration number: 0007 	 2026-07-11T00:00:00.000Z
ALTER TABLE
    outputs
ADD
    COLUMN platform TEXT;

-- Default to 'image_art' to satisfy NOT NULL on existing rows; corrected below
ALTER TABLE
    outputs
ADD
    COLUMN format TEXT NOT NULL DEFAULT 'image_art';

-- No image at all means the output was plain text
UPDATE
    outputs
SET
    format = 'text'
WHERE
    image_url IS NULL;

-- Gifs are distinguishable by extension; the URL may have query params after it, so match both
-- with and without a trailing '?...'. Static images default to 'image_art' (see column default above)
-- since art vs solid can't be determined for existing rows
UPDATE
    outputs
SET
    format = 'image_art_gif'
WHERE
    image_url LIKE '%.gif'
    OR image_url LIKE '%.gif?%';