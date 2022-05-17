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
        const { totalGuilds, totalChannels, totalMembers } = await request.json().catch(() => {
            invalidBody = true;
            return {};
        });

        if (invalidBody) return new Response('Invalid body. Please make sure the body is there and is valid JSON.\nFormat is { "totalGuilds": 1, "totalChannels": 2, "totalMembers": 3 }\nNote: Not all keys will need to be there.', { headers: { "Content-Type": "text/plain" }, status: 400 });

        // Add values to KV
        if (totalGuilds) await DATA.put("TOTAL_GUILDS", totalGuilds);
        if (totalChannels) await DATA.put("TOTAL_CHANNELS", totalChannels);
        if (totalMembers) await DATA.put("TOTAL_MEMBERS", totalMembers);

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
        const totalGuilds = Number.parseInt(await DATA.get("TOTAL_GUILDS"));
        const totalChannels = Number.parseInt(await DATA.get("TOTAL_CHANNELS"));
        const totalMembers = Number.parseInt(await DATA.get("TOTAL_MEMBERS"));

        return new Response(JSON.stringify({ lastUpdated: { date, timestampMilliseconds, timestampSeconds }, totalGuilds, totalChannels, totalMembers }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });
    }
}