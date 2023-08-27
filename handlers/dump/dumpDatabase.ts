import { createBackup } from "@nora-soderlund/cloudflare-d1-backups/src";
import { Bindings } from "../../types";

export default async (env: Bindings) => {
  const result = await createBackup(env.DB, env.BUCKET);
  return Response.json(result);
};
