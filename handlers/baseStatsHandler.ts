import { ZodError } from "zod";
import { Environment, BaseReceivedBody, BaseReceivedBodySchema, BaseStatsObject, BaseStatsObjectSchema } from "../types";

const KV_STATS = '{"totalGuilds":2147,"totalChannels":70328,"totalMembers":535048,"totalStatsSent":{"total":126573,"games":{"Battlefield 2042":16983,"Battlefield V":51383,"Battlefield 1":22220,"Battlefield Hardline":1477,"Battlefield 4":26170,"Battlefield 3":3409,"Battlefield Bad Company 2":195,"Battlefield 2":166},"languages":{"English":80330,"French":1883,"Italian":459,"German":1566,"Spanish":982,"Russian":1767,"Polish":1110,"Brazilian Portuguese":2191,"Turkish":907,"Swedish":410,"Norwegian":99,"Finnish":149,"Arabic":112}},"lastUpdated":{"date":"Sat, 03 Dec 2022 15:03:09 GMT","timestampMilliseconds":1670079789230,"timestampSeconds":1670079789}}';

export default async (request: Request, env: Environment): Promise<Response> => {

    if (request.method === "POST") {

        // IF API-KEY is not correct, return
        if (request.headers.get("API-KEY") !== env.API_KEY) {
            return new Response("No valid 'API-KEY' in request headers.", { status: 401 });
        }

        // Validate the received data with zod against ReceivedBodySchema. If the validation fails, return the zod errors as the response
        let receivedBody: BaseReceivedBody;
        try {
            const parsedJson = await request.json().catch(() => ({}));
            receivedBody = BaseReceivedBodySchema.parse(parsedJson);
        } catch (err) {
            if (err instanceof ZodError) return Response.json({ note: "Received this ZodError.", ...err.format() }, { status: 400 });
            return new Response(err.message);
        }

        // At least totalGuilds, totalChannels, totalMembers are guaranteed to be present and numbers
        const { totalGuilds, totalChannels, totalMembers, incrementTotalStatsSent, game, language } = receivedBody;

        // Get the KV STATS object and edit it accordingly, before .put()ing it back
        const statsObject: BaseStatsObject = await env.DATA_KV.get("STATS", { type: "json" });
        try {
            BaseStatsObjectSchema.parse(statsObject);
        } catch (err) {
            return Response.json({ note: "KV statsObject doesn't match schema. Not updating KV. Received this ZodError.", ...err.format() }, { status: 500 });
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

        return Response.json({ message: "Data posted to KV.", statsObject });

    } else if (request.method === "GET") {

        const statsObject: string = await env.DATA_KV.get("STATS");
        return new Response(statsObject, {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }
}