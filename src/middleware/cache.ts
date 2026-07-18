import { cache as honoCache } from "hono/cache";
import type { StatusCode } from "hono/utils/http-status";

/** Cache middleware. Only 200s are cached by default. Pass cacheableStatusCodes to also cache specific error statuses. */
export const cache = (name: string, minutes: number, cacheableStatusCodes?: StatusCode[]) =>
  honoCache({
    cacheName: name,
    cacheControl: `public, max-age=${minutes * 60}, must-revalidate`,
    cacheableStatusCodes,
  });
