import app from "./app";
import type { CloudflareBindings } from "./types";
import sendEmail from "./utils/sendEmail";

export default {
  async fetch(request: Request, env: CloudflareBindings, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
  scheduled(event: ScheduledEvent, env: CloudflareBindings, ctx: ExecutionContext) {
    switch (event.cron) {
      // Weekly email update
      case "0 9 * * MON":
        ctx.waitUntil(sendEmail(env));
        break;
    }
  },
};
