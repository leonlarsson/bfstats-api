import { Context } from "hono";
import { Bindings } from "../../types";

const KV_STATS =
  '{"totalGuilds":3133,"totalChannels":93641,"totalMembers":597850,"totalStatsSent":{"total":169530,"games":{"Battlefield 2042":35473,"Battlefield V":62151,"Battlefield 1":28298,"Battlefield Hardline":1726,"Battlefield 4":32167,"Battlefield 3":4588,"Battlefield Bad Company 2":317,"Battlefield 2":240},"languages":{"English":110375,"French":4033,"Italian":756,"German":3527,"Spanish":2410,"Russian":3646,"Polish":3080,"Brazilian Portuguese":4297,"Turkish":1584,"Swedish":572,"Norwegian":145,"Finnish":346,"Arabic":151}},"lastUpdated":{"date":"Tue, 25 Jul 2023 17:52:04 GMT","timestampMilliseconds":1690307524009,"timestampSeconds":1690307524}}';

export default async (c: Context<{ Bindings: Bindings }>) => {
  const statsObject: string = await c.env.DATA_KV.get("STATS", { type: "json" });
  return c.json(statsObject);
};
