import { createRouter } from "@/lib/create-app";
import * as handlers from "./outputs.handlers";
import * as routes from "./outputs.routes";

export const outputsRouter = createRouter()
  .openapi(routes.getByIdentifier, handlers.getByIdentifier)
  .openapi(routes.recent, handlers.recent)
  .openapi(routes.daily, handlers.daily)
  .openapi(routes.dailyGames, handlers.dailyGames)
  .openapi(routes.dailyGamesNoGaps, handlers.dailyGamesNoGaps)
  .openapi(routes.counts, handlers.counts)
  .openapi(routes.countsLast7Days, handlers.countsLast7Days)
  .openapi(routes.create, handlers.create);
