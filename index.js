const KV_LAST_UPDATED = '{"date":"Wed, 18 May 2022 20:22:50 GMT","timestampMilliseconds":1652905370044,"timestampSeconds":1652905370}';
const KV_STATS = '{"totalGuilds":1457,"totalChannels":50596,"totalMembers":514646,"totalStatsSent":{"total":87457,"Battlefield 2042":3670,"Battlefield V":39112,"Battlefield 1":16273,"Battlefield Hardline":1253,"Battlefield 4":19704,"Battlefield 3":2656,"Battlefield Bad Company 2":121,"Battlefield 2":127},"lastUpdated":{"date":"Thu, 19 May 2022 21:41:08 GMT","timestampMilliseconds":1652996468750,"timestampSeconds":1652996468}}';

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