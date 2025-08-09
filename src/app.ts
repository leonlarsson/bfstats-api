import { events } from "@/db/schema";
import { configureOpenAPI } from "@/lib/configure-open-api";
import { createApp } from "@/lib/create-app";
import { baseRouter } from "@/routes/base/base.index";
import { eventsRouter } from "@/routes/events/events.index";
import { outputsRouter } from "@/routes/outputs/outputs.index";
import { usersRouter } from "@/routes/users/users.index";
import { AppEvent } from "@/utils/constants";
import { validateSecurityHeaders } from "@/utils/discordApiUtils";
import {
  type APIWebhookEvent,
  ApplicationIntegrationType,
  ApplicationWebhookEventType,
  ApplicationWebhookType,
} from "discord-api-types/v10";

const app = createApp();

// Add OpenAPI spec and Scalar UI
configureOpenAPI(app);

// Add each route to the app
const routes = [baseRouter, outputsRouter, usersRouter, eventsRouter] as const;
for (const route of routes) {
  app.route("/", route);
}

// Discord webhooks
app.post("/discord-webhooks", async (c) => {
  const verified = await validateSecurityHeaders(c.req.raw);
  if (!verified) {
    return new Response("invalid request signature", { status: 401 });
  }

  const webhook = await c.req.json<APIWebhookEvent>();

  if (webhook.type === ApplicationWebhookType.Ping) {
    return new Response(null, { status: 204 });
  }

  if (webhook.event.type === ApplicationWebhookEventType.ApplicationAuthorized) {
    try {
      await c
        .get("db")
        .insert(events)
        .values({
          event:
            webhook.event.data.integration_type === ApplicationIntegrationType.GuildInstall
              ? AppEvent.AppGuildInstall
              : AppEvent.AppUserInstall,
        });
    } catch (error: any) {
      console.error("Error inserting ApplicationAuthorized event:", error);
    }
  }

  if (webhook.event.type === ApplicationWebhookEventType.ApplicationDeauthorized) {
    try {
      await c.get("db").insert(events).values({
        event: AppEvent.AppUninstall,
      });
    } catch (error: any) {
      console.error("Error inserting ApplicationDeauthorized event:", error);
    }
  }

  return new Response("ok");
});

export type AppType = (typeof routes)[number];

export default app;
