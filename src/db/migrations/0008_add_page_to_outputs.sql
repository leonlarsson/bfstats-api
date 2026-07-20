-- Migration number: 0008 	 2026-07-20T15:33:27.084Z
ALTER TABLE
    outputs
ADD
    COLUMN pagination_page INTEGER;