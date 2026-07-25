-- Migration number: 0010 	 2026-07-25T13:21:40.777Z
ALTER TABLE
    outputs
ADD
    COLUMN chain_identifier TEXT;