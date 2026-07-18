import { imageProxyCors } from "@/middleware/imageProxyCors";
import { injectDb } from "@/middleware/injectDb";
import { IMAGE_PROXY_BASE_PATH } from "@/routes/images";
import { OpenAPIHono } from "@hono/zod-openapi";

import { cors } from "hono/cors";

export const createRouter = () => {
  return new OpenAPIHono<{ Bindings: CloudflareBindings }>({
    strict: false,
  });
};

export const createApp = () => {
  const app = createRouter();

  // Image proxy uses its own restricted CORS. Global open CORS skips this path so it can't override it.
  app.use(`${IMAGE_PROXY_BASE_PATH}/*`, imageProxyCors);

  const openCors = cors();
  app.use("*", (c, next) => (c.req.path.startsWith(`${IMAGE_PROXY_BASE_PATH}/`) ? next() : openCors(c, next)));

  app.use(injectDb);

  // Redirect any other route to the API Reference
  app.notFound((c) => c.redirect("/", 302));

  return app;
};
