-- Migration number: 0009 	 2026-07-24T11:59:30.015Z
ALTER TABLE
    outputs
ADD
    COLUMN sort_key TEXT;