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
        const { totalGuilds, totalChannels, totalMembers, incrementTotalStatsSent } = await request.json().catch(() => {
            invalidBody = true;
            return {};
        });

        if (invalidBody) return new Response('Invalid body. Please make sure the body is there and is valid JSON.\nFormat is { "totalGuilds": 1, "totalChannels": 2, "totalMembers": 3, "incrementTotalStatsSent": true }\nNote: Not all keys will need to be there.', { headers: { "Content-Type": "text/plain" }, status: 400 });

        // Add values to KV
        // TODO: Make this one .put() with a single json string
        if (totalGuilds) await DATA.put("TOTAL_GUILDS", totalGuilds);
        if (totalChannels) await DATA.put("TOTAL_CHANNELS", totalChannels);
        if (totalMembers) await DATA.put("TOTAL_MEMBERS", totalMembers);

        // If incrementTotalStatsSent is true, increment TOTAL_STATS_SENT by 1
        if (incrementTotalStatsSent === true) {
            const totalStatsSent = parseInt(await DATA.get("TOTAL_STATS_SENT"));
            await DATA.put("TOTAL_STATS_SENT", totalStatsSent + 1);
        }

        // Add lastUpdated to KV
        const date = new Date();
        await DATA.put("LAST_UPDATED", JSON.stringify({ date: new Date().toUTCString(), timestampMilliseconds: date.valueOf(), timestampSeconds: Math.floor(date.valueOf() / 1000) }));

        return new Response("Data posted.", {
            headers: { "Content-Type": "text/plain" },
            status: 200
        });
    }

    if (request.method === "GET") {

        const { date, timestampMilliseconds, timestampSeconds } = JSON.parse(await DATA.get("LAST_UPDATED"));
        const totalGuilds = parseInt(await DATA.get("TOTAL_GUILDS"));
        const totalChannels = parseInt(await DATA.get("TOTAL_CHANNELS"));
        const totalMembers = parseInt(await DATA.get("TOTAL_MEMBERS"));
        const totalStatsSent = parseInt(await DATA.get("TOTAL_STATS_SENT"));

        return new Response(JSON.stringify({ lastUpdated: { date, timestampMilliseconds, timestampSeconds }, totalGuilds, totalChannels, totalMembers, totalStatsSent }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });
    }
}