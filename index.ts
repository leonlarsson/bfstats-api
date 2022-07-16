import { ZodError } from "zod";
import { ReceivedBodySchema, ReceivedBody, StatsObject } from "./types";

const KV_STATS = '{"totalGuilds":1686,"totalChannels":57043,"totalMembers":539451,"totalStatsSent":{"total":101516,"games":{"Battlefield 2042":8280,"Battlefield V":43686,"Battlefield 1":18421,"Battlefield Hardline":1331,"Battlefield 4":22091,"Battlefield 3":2850,"Battlefield Bad Company 2":148,"Battlefield 2":147},"languages":{"English":60657,"French":924,"Italian":279,"German":748,"Spanish":622,"Russian":973,"Polish":473,"Brazilian Portuguese":1254,"Turkish":471,"Swedish":298,"Norwegian":26,"Finnish":95,"Arabic":106}},"lastUpdated":{"date":"Sat, 16 Jul 2022 13:36:17 GMT","timestampMilliseconds":1657978577513,"timestampSeconds":1657978577}}';

export default {
    async fetch(request: Request, env: any): Promise<Response> {
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
                    return new Response("Received the following ZodError: " + JSON.stringify(err.format()), {
                        headers: { "Content-Type": "application/json" },
                        status: 400
                    });
                }
                return new Response(err.message);
            }

            // At least totalGuilds, totalChannels, totalMembers are guaranteed to be present and numbers
            const { totalGuilds, totalChannels, totalMembers, incrementTotalStatsSent, game, language } = receivedBody;

            // Get the KV STATS object and edit it accordingly, before .put()ing it back
            const statsObject: StatsObject = await env.DATA.get("STATS", { type: "json" });
            statsObject.totalGuilds = totalGuilds;
            statsObject.totalChannels = totalChannels;
            statsObject.totalMembers = totalMembers;

            if (incrementTotalStatsSent === true) {

                // Get total and the specific game to increment
                statsObject.totalStatsSent.total++;
                const totalStatsSentGame = game ? statsObject.totalStatsSent.games[game] : null;
                const totalStatsSentLanguage = language ? statsObject.totalStatsSent.languages[language] : null;

                // Increment specific game and language, if defined and an is an integer
                if (game && Number.isInteger(totalStatsSentGame)) statsObject.totalStatsSent.games[game]++;
                if (language && Number.isInteger(totalStatsSentLanguage)) statsObject.totalStatsSent.languages[language]++;
            }

            // Add lastUpdated to the object
            const date = new Date();
            statsObject.lastUpdated = { date: date.toUTCString(), timestampMilliseconds: date.valueOf(), timestampSeconds: Math.floor(date.valueOf() / 1000) };

            // .put() the edited object
            await env.DATA.put("STATS", JSON.stringify(statsObject));

            return new Response(JSON.stringify({ message: "Data posted to KV.", statsObject }), {
                headers: { "Content-Type": "application/json" },
                status: 200
            });

        } else if (request.method === "GET") {

            const statsObject: string = await env.DATA.get("STATS");
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