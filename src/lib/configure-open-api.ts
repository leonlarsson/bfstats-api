import { apiReference } from "@scalar/hono-api-reference";
import { registerAuthComponent } from "../components/auth";
import type { AppOpenAPI } from "../types";

export const configureOpenAPI = (app: AppOpenAPI) => {
  registerAuthComponent(app);

  // The OpenAPI spec will be available at /openapi.json
  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Battlefield Stats Discord Bot API",
      description:
        "The API specification for the Battlefield Stats Discord Bot, a mostly private API for tracking usage stats across the bot.",
      contact: {
        url: "https://github.com/leonlarsson/bfstats-api",
      },
    },
    tags: [
      {
        name: "Base",
        description: "Basic usage data",
      },
      {
        name: "Users",
        description: "User usage data",
      },
      {
        name: "Outputs",
        description: "Output data",
      },
      {
        name: "Events",
        description: "Event data",
      },
    ],
    servers: [
      {
        url: "https://api.battlefieldstats.com",
        description: "Production Cloudflare Worker",
      },
      {
        url: "http://127.0.0.1:8787",
        description: "Local Development Environment",
      },
    ],
  });

  // The API Reference will be available at /
  app.get(
    "/",
    apiReference({
      spec: {
        url: "/openapi.json",
      },
      pageTitle: "Battlefield Stats Discord Bot API",
      favicon: "https://battlefieldstats.com/images/favicon.ico",
      theme: "default",
      layout: "modern",
    }),
  );
};
