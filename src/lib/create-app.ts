import { injectDb } from "@/middleware/injectDb";
import { OpenAPIHono } from "@hono/zod-openapi";

import { cors } from "hono/cors";

export const createRouter = () => {
  return new OpenAPIHono<{ Bindings: CloudflareBindings }>({
    strict: false,
  });
};

export const createApp = () => {
  const app = createRouter();

  // Add middleware
  app.use(cors());
  app.use(injectDb);

  // Redirect any other route to the API Reference
  app.notFound((c) => c.redirect("/", 302));

  return app;
};
