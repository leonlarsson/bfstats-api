import { Hono } from "hono";
import { cors } from "hono/cors";
import requireAuth from "./middleware/requireAuth";
import getBase from "./handlers/base/getBase";
import postBase from "./handlers/base/postBase";
import getD1Query from "./handlers/d1/getD1Query";
import getUsersTop from "./handlers/users/getUsersTop";
import getUsersCount from "./handlers/users/getUsersCount";
import getUsersSpecial from "./handlers/users/getUsersSpecial";
import postUser from "./handlers/users/postUser";
import getOutputsLast from "./handlers/outputs/getOutputsLast";
import getOutputsCount from "./handlers/outputs/getOutputsCount";
import getOutputsDaily from "./handlers/outputs/getOutputsDaily";
import getOutputsDailyGames from "./handlers/outputs/getOutputsDailyGames";
import getOutputByIdentifier from "./handlers/outputs/getOutputByIdentifier";
import postOutput from "./handlers/outputs/postOutput";
import getEventsLast from "./handlers/events/getEventsLast";
import postEvent from "./handlers/events/postEvent";
import getUsageByUser from "./handlers/usage/getUsageByUser";
import dumpDatabase from "./handlers/dump/dumpDatabase";
import sendEmail from "./utils/sendEmail";
import { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use("/*", cors());

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
app.get("/outputs/daily", getOutputsDaily);
app.get("/outputs/daily/games", getOutputsDailyGames);
app.get("/outputs/:id", getOutputByIdentifier);
app.post("/outputs", requireAuth, postOutput);

// Event routes
app.get("/events/last", getEventsLast);
app.post("/events", requireAuth, postEvent);

// Usage route
app.get("/usage/:user", requireAuth, getUsageByUser);

// Dump route
app.post("/dump", requireAuth, c => dumpDatabase(c.env));

export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
  scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    switch (event.cron) {
      // Weekly email update and DB dump
      case "0 9 * * MON":
        ctx.waitUntil(sendEmail(env));
        ctx.waitUntil(dumpDatabase(env));
        break;
    }
  }
};
