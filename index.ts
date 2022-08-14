import { ZodError } from "zod";
import { Environment, ReceivedBody, ReceivedBodySchema, StatsObject, StatsObjectSchema } from "./types";

const KV_STATS = '{"totalGuilds":1796,"totalChannels":60079,"totalMembers":617562,"totalStatsSent":{"total":108172,"games":{"Battlefield 2042":10432,"Battlefield V":46011,"Battlefield 1":19193,"Battlefield Hardline":1369,"Battlefield 4":23274,"Battlefield 3":3014,"Battlefield Bad Company 2":158,"Battlefield 2":151},"languages":{"English":66414,"French":1040,"Italian":325,"German":867,"Spanish":716,"Russian":1098,"Polish":551,"Brazilian Portuguese":1444,"Turkish":559,"Swedish":315,"Norwegian":30,"Finnish":97,"Arabic":108}},"lastUpdated":{"date":"Sun, 14 Aug 2022 11:08:18 GMT","timestampMilliseconds":1660475298232,"timestampSeconds":1660475298}}';

export default {
    async fetch(request: Request, env: Environment): Promise<Response> {
        if (request.method === "POST") {

            // IF API-KEY is not correct, return
            if (request.headers.get("API-KEY") !== env.API_KEY) {
                return new Response("No valid 'API-KEY' in request headers.", {
                    headers: { "Content-Type": "text/plain" },
                    status: 401
                });
            }

            // Validate the received data with zod against ReceivedBodySchema. If the validation fails, return the zod errors as the response
            let receivedBody: ReceivedBody;
            try {
                const parsedJson = await request.json().catch(() => ({}));
                receivedBody = ReceivedBodySchema.parse(parsedJson);
            } catch (err) {
                if (err instanceof ZodError) {
                    return new Response(JSON.stringify({ note: "Received this ZodError.", ...err.format() }), {
                        headers: { "Content-Type": "application/json" },
                        status: 400
                    });
                }
                return new Response(err.message);
            }

            // At least totalGuilds, totalChannels, totalMembers are guaranteed to be present and numbers
            const { totalGuilds, totalChannels, totalMembers, incrementTotalStatsSent, game, language } = receivedBody;

            // Get the KV STATS object and edit it accordingly, before .put()ing it back
            const statsObject: StatsObject = await env.DATA_KV.get("STATS", { type: "json" });
            try {
                StatsObjectSchema.parse(statsObject);
            } catch (err) {
                return new Response(JSON.stringify({ note: "KV statsObject doesn't match schema. Not updating KV. Received this ZodError.", ...err.format() }), {
                    headers: { "Content-Type": "application/json" },
                    status: 500
                });
            }

            // Update totalGuilds, totalChannels, totalMembers
            statsObject.totalGuilds = totalGuilds;
            statsObject.totalChannels = totalChannels;
            statsObject.totalMembers = totalMembers;

            if (incrementTotalStatsSent === true) {
                // Increment total and specific game and language. Only increment game/language if defined
                statsObject.totalStatsSent.total++;
                if (game) statsObject.totalStatsSent.games[game]++;
                if (language) statsObject.totalStatsSent.languages[language]++;
            }

            // Add lastUpdated to the object
            const date = new Date();
            statsObject.lastUpdated = { date: date.toUTCString(), timestampMilliseconds: date.valueOf(), timestampSeconds: Math.floor(date.valueOf() / 1000) };

            // .put() the edited object
            await env.DATA_KV.put("STATS", JSON.stringify(statsObject));

            return new Response(JSON.stringify({ message: "Data posted to KV.", statsObject }), {
                headers: { "Content-Type": "application/json" },
                status: 200
            });

        } else if (request.method === "GET") {

            const statsObject: string = await env.DATA_KV.get("STATS");
            return new Response(statsObject, {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "https://bfstats.leonlarsson.com",
                },
                status: 200
            });

        } else {
            return Response.redirect("https://api.onlyraccoons.com/405", 302);
        }
    }
}