import { events } from "@/db/schema";
import { configureOpenAPI } from "@/lib/configure-open-api";
import { createApp } from "@/lib/create-app";
import { baseRouter } from "@/routes/base/base.index";
import { handleDiscordWebhooks } from "@/routes/discord-webhooks";
import { eventsRouter } from "@/routes/events/events.index";
import { outputsRouter } from "@/routes/outputs/outputs.index";
import { usersRouter } from "@/routes/users/users.index";

const app = createApp();

// Add OpenAPI spec and Scalar UI
configureOpenAPI(app);

// Add each route to the app
const routes = [baseRouter, outputsRouter, usersRouter, eventsRouter] as const;
for (const route of routes) {
  app.route("/", route);
}

// Discord webhooks
app.post("/discord-webhooks", handleDiscordWebhooks);

export type AppType = (typeof routes)[number];

export default app;
