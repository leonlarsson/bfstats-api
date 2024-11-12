import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { registerAuthComponent } from "./components/auth";
import { registerRoutes_base } from "./routes/base/registerAll";
import { registerRoutes_outputs } from "./routes/outputs/registerAll";
import type { CloudflareBindings } from "./types";
import sendEmail from "./utils/sendEmail";

const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>();
export type App = typeof app;

// CORS middleware
app.use("/*", cors());

// Register components
registerAuthComponent(app);

// Register routes
registerRoutes_base(app);
registerRoutes_outputs(app);

// Base routes
// app.get("/base", getBase);
// app.post("/base", requireAuth, postBase);

// // D1 base route
// app.get("/d1-query", requireAuth, getD1Query);

// // User routes
// app.get("/users/top", getUsersTop);
// app.get("/users/counts", getUsersCount);
// app.get("/users/special", getUsersSpecial);
// app.post("/users", requireAuth, postUser);

// // Output routes
// app.get("/outputs/last", getOutputsLast);
// app.get("/outputs/counts", getOutputsCount);
// app.get("/outputs/counts/last-7-days", getOutputsCountLastWeek);
// app.get("/outputs/daily", getOutputsDaily);
// app.get("/outputs/daily/games", getOutputsDailyGames);
// app.get("/outputs/daily/games-no-gaps", getOutputsDailyGamesNoGaps);
// app.get("/outputs/:id", getOutputByIdentifier);
// app.post("/outputs", requireAuth, postOutput);

// // Event routes
// app.get("/events/last", getEventsLast);
// app.post("/events", requireAuth, postEvent);

// // Usage route
// app.get("/usage/:user", requireAuth, getUsageByUser);

// The OpenAPI spec will be available at /openapi.json
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Battlefield Stats Discord Bot API",
    description:
      "The API specification for the Battlefield Stats Discord Bot, a mostly private API for tracking usage stats across the bot.",
    contact: {
      url: "https://github.com/leonlarsson/bfstats-api",
    },
  },
  tags: [
    {
      name: "Base",
      description: "Basic usage data",
    },
    {
      name: "Users",
      description: "User usage data",
    },
    {
      name: "Outputs",
      description: "Output data",
    },
    {
      name: "Events",
      description: "Event data",
    },
    {
      name: "Usage",
      description: "Usage data",
    },
  ],
  servers: [
    {
      url: "https://api.battlefieldstats.com",
      description: "Production Cloudflare Worker",
    },
    {
      url: "http://127.0.0.1:8787",
      description: "Local Development Environment",
    },
  ],
});

// The API Reference will be available at /
app.get(
  "/",
  apiReference({
    spec: {
      url: "/openapi.json",
    },
    pageTitle: "Battlefield Stats Discord Bot API",
    favicon: "https://battlefieldstats.com/images/favicon.ico",
    theme: "default",
    layout: "modern",
  }),
);

// Redirect any other route to the API Reference
app.notFound((c) => c.redirect("/", 302));

export default {
  async fetch(request: Request, env: CloudflareBindings, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
  scheduled(event: ScheduledEvent, env: CloudflareBindings, ctx: ExecutionContext) {
    switch (event.cron) {
      // Weekly email update
      case "0 9 * * MON":
        ctx.waitUntil(sendEmail(env));
        break;
    }
  },
};
