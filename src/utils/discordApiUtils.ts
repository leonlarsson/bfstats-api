import { env } from "cloudflare:workers";
import type { Snowflake } from "discord-api-types/globals";
import {
  type APIContainerComponent,
  type APIDMChannel,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  type RESTPostAPIChannelMessageJSONBody,
  type RESTPostAPICurrentUserCreateDMChannelJSONBody,
  type RESTPostAPICurrentUserCreateDMChannelResult,
  RouteBases,
  Routes,
} from "discord-api-types/v10";

const hex2bin = (hex: string) => {
  const buf = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < buf.length; i++) {
    buf[i] = Number.parseInt(hex.substr(i * 2, 2), 16);
  }
  return buf;
};

const PUBLIC_KEY = crypto.subtle.importKey(
  "raw",
  hex2bin("50a4b185ecaaf54abfb50418eb14575209511de333fa3c3fb6209ea9f2ab2519"),
  {
    name: "NODE-ED25519",
    namedCurve: "NODE-ED25519",
  },
  true,
  ["verify"],
);

const encoder = new TextEncoder();

export const validateSecurityHeaders = async (request: Request) => {
  const signature = hex2bin(request.headers.get("X-Signature-Ed25519")!);
  const timestamp = request.headers.get("X-Signature-Timestamp")!;
  const unknown = await request.clone().text();

  return await crypto.subtle.verify("NODE-ED25519", await PUBLIC_KEY, signature, encoder.encode(timestamp + unknown));
};

export const sendDiscordWebhook = (url: string, content: string) => {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
};

export const sendDiscordAuthDMToUser = async (userId: Snowflake, message: string) => {
  const reqInit: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bot ${env.BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const channelRes = await fetch(RouteBases.api + Routes.userChannels(), {
      ...reqInit,
      body: JSON.stringify({ recipient_id: userId } satisfies RESTPostAPICurrentUserCreateDMChannelJSONBody),
    });

    const channel = await channelRes.json<APIDMChannel>();

    await fetch(RouteBases.api + Routes.channelMessages(channel.id), {
      ...reqInit,
      body: JSON.stringify({
        flags: MessageFlags.IsComponentsV2,
        components: [getDiscordAPIContainerComponent(message)],
      } satisfies RESTPostAPIChannelMessageJSONBody),
    });
  } catch (error) {
    console.error("Error sending DM to user:", error);
  }
};

export const getDiscordAPIContainerComponent = (message: string): APIContainerComponent => {
  return {
    type: ComponentType.Container,
    accent_color: 0xbf2042,
    components: [
      {
        type: ComponentType.TextDisplay,
        content: `## Battlefield Stats installed!\n${message}`,
      },
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            label: "Website",
            url: "https://battlefieldstats.com",
          },
        ],
      },
      {
        type: ComponentType.TextDisplay,
        content:
          "-# [Battlefield Stats](https://battlefieldstats.com) - By [Mozzy](https://x.com/mozzyfx) • /about • /help",
      },
    ],
  };
};
