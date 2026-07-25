-- Migration number: 0011 	 2026-07-25T13:24:20.753Z
CREATE INDEX IF NOT EXISTS idx_outputs_chain_identifier ON outputs (chain_identifier);