import { createRouter } from "../../lib/create-app";

import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

export const usersRouter = createRouter()
  .openapi(routes.count, handlers.count)
  .openapi(routes.top, handlers.top)
  .openapi(routes.usageByUserId, handlers.usageByUserId)
  .openapi(routes.create, handlers.create);
