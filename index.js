const KV_STATS = '{"totalGuilds":1469,"totalChannels":50984,"totalMembers":515374,"totalStatsSent":{"total":88345,"Battlefield 2042":3902,"Battlefield V":39402,"Battlefield 1":16430,"Battlefield Hardline":1267,"Battlefield 4":19887,"Battlefield 3":2666,"Battlefield Bad Company 2":122,"Battlefield 2":128},"lastUpdated":{"date":"Mon, 23 May 2022 20:57:25 GMT","timestampMilliseconds":1653339445395,"timestampSeconds":1653339445}}';

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {

    if (request.method === "POST") {

        // IF API-KEY is not correct, return
        if (request.headers.get("API-KEY") !== API_KEY) {
            return new Response("No valid API key in request.", {
                headers: { "Content-Type": "text/plain" },
                status: 401
            });
        }

        let invalidBody = false;
        const { totalGuilds, totalChannels, totalMembers, incrementTotalStatsSent, game } = await request.json().catch(() => {
            invalidBody = true;
            return {};
        });

        if (invalidBody) return new Response('Invalid body. Please make sure the body is there and is valid JSON.\nFormat is { "totalGuilds": 1, "totalChannels": 2, "totalMembers": 3, "incrementTotalStatsSent": true, "game": "Battlefield 1" }\nNote: Not all keys will need to be there. "game" should be present if "incrementTotalStatsSent" is.', { headers: { "Content-Type": "text/plain" }, status: 400 });

        // Get the KV STATS object and edit it accordingly, before .put()ing it back
        const statsObject = await DATA.get("STATS", { type: "json" });
        if (Number.isInteger(totalGuilds)) statsObject.totalGuilds = totalGuilds;
        if (Number.isInteger(totalChannels)) statsObject.totalChannels = totalChannels;
        if (Number.isInteger(totalMembers)) statsObject.totalMembers = totalMembers;
        if (incrementTotalStatsSent === true) {
            // Get total and the specific game to increment
            const totalStatsSent = parseInt(statsObject.totalStatsSent.total);
            const totalStatsSentGame = parseInt(statsObject.totalStatsSent[game]);
            // Increment total and the specific game
            if (Number.isInteger(totalStatsSent)) statsObject.totalStatsSent.total++;
            if (Number.isInteger(totalStatsSentGame)) statsObject.totalStatsSent[game]++;
        }

        // Add lastUpdated to the object
        const date = new Date();
        statsObject.lastUpdated = { date: date.toUTCString(), timestampMilliseconds: date.valueOf(), timestampSeconds: Math.floor(date.valueOf() / 1000) };

        // .put() the edited object
        await DATA.put("STATS", JSON.stringify(statsObject));

        return new Response(JSON.stringify({ message: "Data posted to KV.", statsObject }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });
    }

    if (request.method === "GET") {

        const statsObject = await DATA.get("STATS");
        return new Response(statsObject, {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "https://bfstats.leonlarsson.com",
            },
            status: 200
        });
    }
}