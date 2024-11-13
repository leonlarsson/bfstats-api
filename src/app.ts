import { configureOpenAPI } from "./lib/configure-open-api";
import { createApp } from "./lib/create-app";
import eventsIndex from "./routes/events/events.index";

const app = createApp();

// Add OpenAPI spec and Scalar UI
configureOpenAPI(app);

// Add each route to the app
const routes = [eventsIndex] as const;
for (const route of routes) {
  app.route("/", route);
}

export type AppType = (typeof routes)[number];

export default app;
