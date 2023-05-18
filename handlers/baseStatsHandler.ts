import { ZodError } from "zod";
import { Environment, BaseReceivedBody, BaseReceivedBodySchema, BaseStatsObject, BaseStatsObjectSchema } from "../types";

const KV_STATS = '{"totalGuilds":2904,"totalChannels":88077,"totalMembers":594252,"totalStatsSent":{"total":157170,"games":{"Battlefield 2042":30604,"Battlefield V":58745,"Battlefield 1":26474,"Battlefield Hardline":1663,"Battlefield 4":30300,"Battlefield 3":4309,"Battlefield Bad Company 2":296,"Battlefield 2":209},"languages":{"English":101503,"French":3510,"Italian":682,"German":3038,"Spanish":1946,"Russian":3275,"Polish":2312,"Brazilian Portuguese":3717,"Turkish":1441,"Swedish":544,"Norwegian":139,"Finnish":315,"Arabic":140}},"lastUpdated":{"date":"Thu, 18 May 2023 19:41:12 GMT","timestampMilliseconds":1684438872486,"timestampSeconds":1684438872}}';

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