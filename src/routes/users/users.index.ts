import { createRouter } from "@/lib/create-app";
import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

export const usersRouter = createRouter()
  .openapi(routes.count, handlers.count)
  .openapi(routes.top, handlers.top)
  .openapi(routes.usageByUserId, handlers.usageByUserId)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getLastOptions, handlers.getLastOptions)
  .openapi(routes.updateLastOptions, handlers.updateLastOptions)
  .openapi(routes.getRecentSearches, handlers.getRecentSearches)
  .openapi(routes.getRecentUsernamesByGameAndPlatform, handlers.getRecentUsernamesByGameAndPlatform)
  .openapi(routes.deleteRecentSearches, handlers.deleteRecentSearches);
