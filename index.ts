import { Hono } from "hono";
import { cors } from "hono/cors";
import getBase from "./handlers/base/getBase";
import postBase from "./handlers/base/postBase";
import getD1Query from "./handlers/d1/getD1Query";
import getEventsLast from "./handlers/events/getEventsLast";
import postEvent from "./handlers/events/postEvent";
import getOutputByIdentifier from "./handlers/outputs/getOutputByIdentifier";
import getOutputsCount from "./handlers/outputs/getOutputsCount";
import getOutputsCountLastWeek from "./handlers/outputs/getOutputsCountLast7Days";
import getOutputsDaily from "./handlers/outputs/getOutputsDaily";
import getOutputsDailyGames from "./handlers/outputs/getOutputsDailyGames";
import getOutputsDailyGamesNoGaps from "./handlers/outputs/getOutputsDailyGamesNoGaps";
import getOutputsLast from "./handlers/outputs/getOutputsLast";
import postOutput from "./handlers/outputs/postOutput";
import getUsageByUser from "./handlers/usage/getUsageByUser";
import getUsersCount from "./handlers/users/getUsersCount";
import getUsersSpecial from "./handlers/users/getUsersSpecial";
import getUsersTop from "./handlers/users/getUsersTop";
import postUser from "./handlers/users/postUser";
import injectAuth from "./middleware/injectAuth";
import requireAuth from "./middleware/requireAuth";
import type { Bindings } from "./types";
import sendEmail from "./utils/sendEmail";

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use("/*", cors());

// Inject authorization middleware
app.use("/*", injectAuth);

// Base routes
app.get("/base", getBase);
app.post("/base", requireAuth, postBase);

// D1 base route
app.get("/d1-query", requireAuth, getD1Query);

// User routes
app.get("/users/top", getUsersTop);
app.get("/users/counts", getUsersCount);
app.get("/users/special", getUsersSpecial);
app.post("/users", requireAuth, postUser);

// Output routes
app.get("/outputs/last", getOutputsLast);
app.get("/outputs/counts", getOutputsCount);
app.get("/outputs/counts/last-7-days", getOutputsCountLastWeek);
app.get("/outputs/daily", getOutputsDaily);
app.get("/outputs/daily/games", getOutputsDailyGames);
app.get("/outputs/daily/games-no-gaps", getOutputsDailyGamesNoGaps);
app.get("/outputs/:id", getOutputByIdentifier);
app.post("/outputs", requireAuth, postOutput);

// Event routes
app.get("/events/last", getEventsLast);
app.post("/events", requireAuth, postEvent);

// Usage route
app.get("/usage/:user", requireAuth, getUsageByUser);

export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
  scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    switch (event.cron) {
      // Weekly email update
      case "0 9 * * MON":
        ctx.waitUntil(sendEmail(env));
        break;
    }
  },
};
