import { waitUntil } from "cloudflare:workers";
import { events } from "@/db/schema";
import { AppEvent } from "@/utils/constants";
import type { Context } from "hono";

/** Base path the image proxy is mounted at. */
export const IMAGE_PROXY_BASE_PATH = "/images";

/** Query params the upstream image API reads. Everything else is stripped before caching. */
export const IMAGE_PROXY_ALLOWED_PARAMS = ["username", "platform", "locale"];

/** Games the upstream supports. Whitelisted to prevent path injection. */
const ALLOWED_GAMES = ["bf2", "bf3", "bf4", "bfh", "bf1", "bfv", "bf2042", "bf6"] as const;

/** Segments exposed through the proxy. */
const ALLOWED_SEGMENTS = ["overview"] as const;

type Game = (typeof ALLOWED_GAMES)[number];
type Segment = (typeof ALLOWED_SEGMENTS)[number];

const isGame = (value: string): value is Game => (ALLOWED_GAMES as readonly string[]).includes(value);
const isSegment = (value: string): value is Segment => (ALLOWED_SEGMENTS as readonly string[]).includes(value);

/** Proxies GET /images/:game/:segment to the VPS image API, injecting the bearer token server-side so it never reaches the client. */
export const handleImageProxy = async (c: Context<{ Bindings: CloudflareBindings }>) => {
  const game = c.req.param("game").toLowerCase();
  const segment = c.req.param("segment").toLowerCase();

  if (!isGame(game) || !isSegment(segment)) {
    return c.json({ error: "NOT_FOUND" }, 404);
  }

  const baseUrl = c.env.IMAGE_API_BASE_URL;
  const apiKey = c.env.IMAGE_API_KEY;
  if (!baseUrl || !apiKey) {
    console.error("[image-proxy] missing IMAGE_API_BASE_URL or IMAGE_API_KEY");
    return c.json({ error: "INTERNAL_ERROR", message: "image proxy is not configured" }, 500);
  }

  const upstreamUrl = new URL(`/api/${game}/${segment}`, baseUrl);
  upstreamUrl.search = new URL(c.req.url).search;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch (error) {
    console.error("[image-proxy] upstream fetch failed:", error);
    return c.json({ error: "BAD_GATEWAY", message: "failed to reach the image service" }, 502);
  }

  // Count each successful generation. Only cache misses reach here, so this is one event per image generated.
  if (upstream.ok) {
    waitUntil(
      (async () => {
        try {
          await c.get("db").insert(events).values({ event: AppEvent.ApiImageGenerated });
        } catch (error) {
          console.error("[image-proxy] failed to insert ApiImageGenerated event:", error);
        }
      })(),
    );
  }

  // Forward the upstream status, content type, and body
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/octet-stream" },
  });
};
