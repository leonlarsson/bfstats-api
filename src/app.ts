import { events } from "@/db/schema";
import { configureOpenAPI } from "@/lib/configure-open-api";
import { createApp } from "@/lib/create-app";
import { cache } from "@/middleware/cache";
import { withSearchParams } from "@/middleware/withSearchParams";
import { baseRouter } from "@/routes/base/base.index";
import { handleDiscordWebhooks } from "@/routes/discord-webhooks";
import { eventsRouter } from "@/routes/events/events.index";
import { IMAGE_PROXY_ALLOWED_PARAMS, IMAGE_PROXY_BASE_PATH, handleImageProxy } from "@/routes/images";
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

// Cached 120 min per URL. Stable client errors (400/403/404) are cached too; transient 429/5xx are not.
app.get(
  `${IMAGE_PROXY_BASE_PATH}/:game/:segment`,
  withSearchParams(IMAGE_PROXY_ALLOWED_PARAMS),
  cache("image-proxy", 120, [200, 400, 403, 404]),
  handleImageProxy,
);

export type AppType = (typeof routes)[number];

export default app;
