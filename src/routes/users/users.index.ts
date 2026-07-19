import { createRouter } from "@/lib/create-app";
import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

export const usersRouter = createRouter()
  .openapi(routes.count, handlers.count)
  .openapi(routes.top, handlers.top)
  .openapi(routes.usageByUserId, handlers.usageByUserId)
  .openapi(routes.create, handlers.create)
  .openapi(routes.addSearch, handlers.addSearch)
  .openapi(routes.getRecentUsernamesByGameAndPlatform, handlers.getRecentUsernamesByGameAndPlatform)
  .openapi(routes.getLinks, handlers.getLinks)
  .openapi(routes.putLink, handlers.putLink)
  .openapi(routes.deleteLink, handlers.deleteLink);
