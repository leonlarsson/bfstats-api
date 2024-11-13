import { createRouter } from "../../lib/create-app";

import * as handlers from "./events.handlers";
import * as routes from "./events.routes";

export default createRouter().openapi(routes.recent, handlers.recent).openapi(routes.create, handlers.create);
