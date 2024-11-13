import { createRouter } from "../../lib/create-app";

import * as handlers from "./base.handlers";
import * as routes from "./base.routes";

export const baseRouter = createRouter()
  .openapi(routes.getData, handlers.getData)
  .openapi(routes.updateData, handlers.updateData);
