addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {

    if (request.method === "POST") {

        // IF API-KEY is not correct, return
        if (request.headers.get("API-KEY") !== API_KEY) {
            return new Response("Not allowed", {
                headers: { "Content-Type": "text/plain" },
                status: 401
            });
        }

        // If API-KEY is valid

        const totalGuilds = request.headers.get("TOTAL-GUILDS");
        const totalChannels = request.headers.get("TOTAL-CHANNELS");
        const totalMembers = request.headers.get("TOTAL-MEMBERS");

        // If a header is present, but not an integer
        if (totalGuilds && !Number.isInteger(Number.parseInt(totalGuilds)) || totalChannels && !Number.isInteger(Number.parseInt(totalChannels)) && totalMembers && !Number.isInteger(Number.parseInt(totalMembers))) {
            return new Response(`Header value ${totalGuilds} (TOTAL-GUILDS) or ${totalChannels} (TOTAL-CHANNELS) or ${totalMembers} (TOTAL-MEMBERS) is not an integer`, { headers: { "Content-Type": "text/plain" }, status: 400 });
        }

        // If TOTAL-GUILDS header is present, and is an integer, put to KV
        if (totalGuilds) await DATA.put("TOTAL_GUILDS", Number.parseInt(totalGuilds));

        // If TOTAL-CHANNELS header is present, and is an integer, put to KV
        if (totalChannels) await DATA.put("TOTAL_CHANNELS", Number.parseInt(totalChannels));

        // If TOTAL-MEMBERS header is present, and is an integer, put to KV
        if (totalMembers) await DATA.put("TOTAL_MEMBERS", Number.parseInt(totalMembers));

        // Add last updated KV
        await DATA.put("LAST_UPDATED", new Date().toUTCString());

        return new Response("Data posted", {
            headers: { "Content-Type": "text/plain" },
            status: 200
        });
    }

    if (request.method === "GET") {

        const lastUpdated = await DATA.get("LAST_UPDATED");
        const totalGuilds = Number.parseInt(await DATA.get("TOTAL_GUILDS"));
        const totalChannels = Number.parseInt(await DATA.get("TOTAL_CHANNELS"));
        const totalMembers = Number.parseInt(await DATA.get("TOTAL_MEMBERS"));

        return new Response(JSON.stringify({ lastUpdated, totalGuilds, totalChannels, totalMembers }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });
    }
}