import { registerRoute_outputs_index } from ".";
import type { App } from "../..";
import { registerRoute_outputs_id } from "./[id]";
import { registerRoute_outputs_counts } from "./counts";
import { registerRoute_outputs_counts_last_7_days } from "./counts-last-7-days";
import { registerRoute_outputs_daily } from "./daily";
import { registerRoute_outputs_daily_games } from "./daily-games";
import { registerRoute_outputs_daily_games_no_gaps } from "./daily-games-no-gaps";
import { registerRoute_outputs_last } from "./last";

export const registerRoutes_outputs = (app: App) => {
  registerRoute_outputs_last(app);
  registerRoute_outputs_counts(app);
  registerRoute_outputs_counts_last_7_days(app);
  registerRoute_outputs_daily(app);
  registerRoute_outputs_daily_games(app);
  registerRoute_outputs_daily_games_no_gaps(app);
  registerRoute_outputs_id(app);
  registerRoute_outputs_index(app);
};
