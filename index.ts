import { ReceivedBody, StatsObject } from "./types";

const KV_STATS = '{"totalGuilds":1684,"totalChannels":56965,"totalMembers":539428,"totalStatsSent":{"total":101351,"games":{"Battlefield 2042":8234,"Battlefield V":43631,"Battlefield 1":18396,"Battlefield Hardline":1330,"Battlefield 4":22058,"Battlefield 3":2846,"Battlefield Bad Company 2":147,"Battlefield 2":147},"languages":{"English":60510,"French":921,"Italian":279,"German":744,"Spanish":621,"Russian":968,"Polish":471,"Brazilian Portuguese":1253,"Turkish":471,"Swedish":297,"Norwegian":26,"Finnish":95,"Arabic":105}},"lastUpdated":{"date":"Fri, 15 Jul 2022 18:23:00 GMT","timestampMilliseconds":1657909380671,"timestampSeconds":1657909380}}';

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

            let invalidBody = false;
            const { totalGuilds, totalChannels, totalMembers, incrementTotalStatsSent, game, language }: ReceivedBody = await request.json().catch(() => {
                invalidBody = true;
                return {};
            });

            // Return on invalid body
            if (invalidBody) return new Response('Invalid body. Please make sure the body is there and is valid JSON.\nFormat is { "totalGuilds": 1, "totalChannels": 2, "totalMembers": 3, "incrementTotalStatsSent": true, "game": "Battlefield 1", "language": "Swedish" }\nNote: Not all keys will need to be there. "game" and "language" should be present if "incrementTotalStatsSent" is.', { headers: { "Content-Type": "text/plain" }, status: 400 });

            // Get the KV STATS object and edit it accordingly, before .put()ing it back
            const statsObject: StatsObject = await env.DATA.get("STATS", { type: "json" });
            if (Number.isInteger(totalGuilds)) statsObject.totalGuilds = totalGuilds;
            if (Number.isInteger(totalChannels)) statsObject.totalChannels = totalChannels;
            if (Number.isInteger(totalMembers)) statsObject.totalMembers = totalMembers;

            if (incrementTotalStatsSent === true) {

                // Get total and the specific game to increment
                const totalStatsSent = statsObject.totalStatsSent.total;
                const totalStatsSentGame = game ? statsObject.totalStatsSent.games[game] : null;
                const totalStatsSentLanguage = language ? statsObject.totalStatsSent.languages[language] : null;

                // Increment total
                if (Number.isInteger(totalStatsSent)) statsObject.totalStatsSent.total++;

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