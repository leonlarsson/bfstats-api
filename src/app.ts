import { configureOpenAPI } from "@/lib/configure-open-api";
import { createApp } from "@/lib/create-app";
import { baseRouter } from "@/routes/base/base.index";
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

export type AppType = (typeof routes)[number];

export default app;
