-- Migration number: 0003 	 2024-10-17T20:28:09.378Z
CREATE INDEX IF NOT EXISTS idx_outputs_date ON outputs (date);

CREATE INDEX IF NOT EXISTS idx_outputs_game_date ON outputs (game, date);