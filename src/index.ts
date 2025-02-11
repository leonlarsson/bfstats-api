import app from "@/app";
import { UserDurableObject } from "@/do/user";
import type { CloudflareBindings } from "@/types";

export default {
  async fetch(request: Request, env: CloudflareBindings, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
};

export { UserDurableObject };
