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
            // Get totalStatsSent and the specific game to increment
            const totalStatsSent = parseInt(statsObject.totalStats.totalStatsSent);
            const totalStatsSentGame = parseInt(statsObject.totalStats[game]);
            // Increment totalStatsSent and the specific game
            if (Number.isInteger(totalStatsSent)) statsObject.totalStats.totalStatsSent += 1;
            if (Number.isInteger(totalStatsSentGame)) statsObject.totalStats[game] += 1;
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
            headers: { "Content-Type": "application/json" },
            status: 200
        });
    }
}