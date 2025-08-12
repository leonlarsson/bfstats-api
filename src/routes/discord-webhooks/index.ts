import { events } from "@/db/schema";
import { AppEvent } from "@/utils/constants";
import { sendDiscordWebhook, validateSecurityHeaders } from "@/utils/discordApiUtils";
import {
  type APIWebhookEvent,
  ApplicationIntegrationType,
  ApplicationWebhookEventType,
  ApplicationWebhookType,
} from "discord-api-types/v10";
import type { Context } from "hono";

export const handleDiscordWebhooks = async (c: Context<{ Bindings: CloudflareBindings }>) => {
  const verified = await validateSecurityHeaders(c.req.raw);
  if (!verified) {
    return new Response("invalid request signature", { status: 401 });
  }

  const webhook = await c.req.json<APIWebhookEvent>();

  if (webhook.type === ApplicationWebhookType.Ping) {
    return new Response(null, { status: 204 });
  }

  // ApplicationAuthorized includes both when a user installs the app and when a bot is added to a guild
  if (webhook.event.type === ApplicationWebhookEventType.ApplicationAuthorized) {
    const installedToUser = webhook.event.data.integration_type === ApplicationIntegrationType.UserInstall;
    const { user } = webhook.event.data;

    if (installedToUser) {
      c.executionCtx.waitUntil(
        sendDiscordWebhook(
          c.env.DISCORD_JOINS_WEBHOOK_URL,
          `:person_bald: - Bot was installed to account **${user.username}** (${user.global_name}) (<@${user.id}>)`,
        ),
      );
    }

    try {
      await c
        .get("db")
        .insert(events)
        .values({
          event: installedToUser ? AppEvent.AppUserInstall : AppEvent.AppGuildInstall,
        });
    } catch (error: any) {
      console.error("Error inserting ApplicationAuthorized event:", error);
    }
  }

  // ApplicationDeauthorized does NOT include when a bot is simply kicked OR de-authed from a guild
  // It only is called when a user de-auths it from their own account
  if (webhook.event.type === ApplicationWebhookEventType.ApplicationDeauthorized) {
    const { user } = webhook.event.data;

    c.executionCtx.waitUntil(
      sendDiscordWebhook(
        c.env.DISCORD_JOINS_WEBHOOK_URL,
        `:no_entry_sign: - Bot was deauthorized by user **${user.username}** (${user.global_name}) (<@${user.id}>)`,
      ),
    );

    try {
      await c.get("db").insert(events).values({
        event: AppEvent.AppUserUninstall,
      });
    } catch (error: any) {
      console.error("Error inserting ApplicationDeauthorized event:", error);
    }
  }

  return new Response("ok");
};
