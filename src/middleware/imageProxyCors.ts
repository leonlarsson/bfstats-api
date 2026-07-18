import type { Context, Next } from "hono";

/** Production frontend origin allowed to fetch the image proxy. */
const PROD_ORIGIN = "https://battlefieldstats.com";

/** Any localhost / 127.0.0.1 origin (any port) for local development. */
const LOCAL_ORIGIN_REGEX = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const resolveAllowedOrigin = (origin: string): string | null => {
  if (origin === PROD_ORIGIN) return origin;
  if (LOCAL_ORIGIN_REGEX.test(origin)) return origin;
  return null;
};

/** CORS for the image proxy, restricted to the frontend origin(s). Sets the header after next() so it is never baked into the cached response. */
export const imageProxyCors = async (c: Context, next: Next) => {
  const origin = c.req.header("Origin") ?? "";
  const allowedOrigin = resolveAllowedOrigin(origin);

  if (c.req.method === "OPTIONS") {
    const headers = new Headers({ Vary: "Origin" });
    if (allowedOrigin) {
      headers.set("Access-Control-Allow-Origin", allowedOrigin);
      headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      headers.set("Access-Control-Max-Age", "86400");
    }
    return new Response(null, { status: 204, headers });
  }

  await next();

  c.res.headers.append("Vary", "Origin");
  if (allowedOrigin) {
    c.res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  } else {
    c.res.headers.delete("Access-Control-Allow-Origin");
  }
};
