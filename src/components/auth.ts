import type { AppType } from "@/app";

export const registerAuthComponent = (app: AppType) => {
  app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
  });
};
