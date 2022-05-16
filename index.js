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

        const totalGuilds = request.headers.get("TOTAL-GUILDS");
        const totalUsers = request.headers.get("TOTAL-USERS");

        // If API-KEY is valid

        // If TOTAL-GUILDS header is present, and is an integer, put to KV
        if (totalGuilds) {
            if (!Number.isInteger(Number.parseInt(totalGuilds))) return new Response(`Value ${totalGuilds} for TOTAL-GUILDS is not an integer.`, { headers: { "Content-Type": "text/plain" }, status: 400 });
            await DATA.put("TOTAL_GUILDS", Number.parseInt(totalGuilds));
        }

        // If TOTAL-USERS header is present, and is an integer, put to KV
        if (totalUsers) {
            if (!Number.isInteger(Number.parseInt(totalUsers))) return new Response(`Value ${totalUsers} for TOTAL-USERS is not an integer.`, { headers: { "Content-Type": "text/plain" }, status: 400 });
            await DATA.put("TOTAL_USERS", Number.parseInt(totalUsers));
        }

        return new Response("Data posted", {
            headers: { "Content-Type": "text/plain" },
            status: 200
        });
    }

    if (request.method === "GET") {

        const totalGuilds = Number.parseInt(await DATA.get("TOTAL_GUILDS"));
        const totalUsers = Number.parseInt(await DATA.get("TOTAL_USERS"));

        return new Response(JSON.stringify({ totalGuilds, totalUsers }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });
    }
}