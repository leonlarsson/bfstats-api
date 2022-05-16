addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {

    if (request.method === "POST") {

        // IF API-KEY is not correct, return
        if (request.headers.get("API-KEY") !== API_KEY) {
            return new Response("No valid API key found.", {
                headers: { "Content-Type": "text/plain" },
                status: 401
            });
        }

        // TODO: Deal with empty body?
        const { totalGuilds, totalChannels, totalMembers } = await request.json();

        // If a value is present, but not an integer, return error
        if (totalGuilds && !Number.isInteger(Number.parseInt(totalGuilds)) || totalChannels && !Number.isInteger(Number.parseInt(totalChannels)) && totalMembers && !Number.isInteger(Number.parseInt(totalMembers))) {
            return new Response(`Value ${totalGuilds} (totalGuilds) or ${totalChannels} (totalChannels) or ${totalMembers} (totalChannels) is not an integer.`, { headers: { "Content-Type": "text/plain" }, status: 400 });
        }

        // If totalGuilds is present, and is an integer, put to KV
        if (totalGuilds) await DATA.put("TOTAL_GUILDS", Number.parseInt(totalGuilds));

        // If totalChannels is present, and is an integer, put to KV
        if (totalChannels) await DATA.put("TOTAL_CHANNELS", Number.parseInt(totalChannels));

        // If totalMembers is present, and is an integer, put to KV
        if (totalMembers) await DATA.put("TOTAL_MEMBERS", Number.parseInt(totalMembers));

        // Add last updated KV
        const date = new Date();
        await DATA.put("LAST_UPDATED", JSON.stringify({ date: new Date().toUTCString(), timestampMiliseconds: date.valueOf(), timestampSeconds: Math.floor(date.valueOf() / 1000) }));

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