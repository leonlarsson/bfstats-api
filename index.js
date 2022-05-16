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
        const totalUsers = request.headers.get("TOTAL-USERS");

        // If one or both headers are not present or are not integers, return
        if (totalGuilds && !Number.isInteger(Number.parseInt(totalGuilds)) || totalUsers && !Number.isInteger(Number.parseInt(totalUsers))) {
            return new Response(`Header value ${totalGuilds} (TOTAL-GUILDS) or ${totalUsers} (TOTAL-USERS) is not an integer`, { headers: { "Content-Type": "text/plain" }, status: 400 });
        }

        // If TOTAL-GUILDS header is present, and is an integer, put to KV
        if (totalGuilds) await DATA.put("TOTAL_GUILDS", Number.parseInt(totalGuilds));

        // If TOTAL-USERS header is present, and is an integer, put to KV
        if (totalUsers) await DATA.put("TOTAL_USERS", Number.parseInt(totalUsers));

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
        const totalUsers = Number.parseInt(await DATA.get("TOTAL_USERS"));

        return new Response(JSON.stringify({ lastUpdated, totalGuilds, totalUsers }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });
    }
}