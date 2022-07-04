const KV_STATS = '{"totalGuilds":1632,"totalChannels":55525,"totalMembers":534576,"totalStatsSent":{"total":98723,"games":{"Battlefield 2042":7363,"Battlefield V":42797,"Battlefield 1":18034,"Battlefield Hardline":1320,"Battlefield 4":21567,"Battlefield 3":2813,"Battlefield Bad Company 2":140,"Battlefield 2":142},"languages":{"English":58320,"French":862,"Italian":266,"German":653,"Spanish":560,"Russian":925,"Polish":462,"Brazilian Portuguese":1151,"Turkish":443,"Swedish":282,"Norwegian":26,"Finnish":93,"Arabic":104}},"lastUpdated":{"date":"Mon, 04 Jul 2022 19:39:23 GMT","timestampMilliseconds":1656963563008,"timestampSeconds":1656963563}}';

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
        const { totalGuilds, totalChannels, totalMembers, incrementTotalStatsSent, game, language } = await request.json().catch(() => {
            invalidBody = true;
            return {};
        });

        if (invalidBody) return new Response('Invalid body. Please make sure the body is there and is valid JSON.\nFormat is { "totalGuilds": 1, "totalChannels": 2, "totalMembers": 3, "incrementTotalStatsSent": true, "game": "Battlefield 1", "language": "Swedish" }\nNote: Not all keys will need to be there. "game" and "language" should be present if "incrementTotalStatsSent" is.', { headers: { "Content-Type": "text/plain" }, status: 400 });

        // Get the KV STATS object and edit it accordingly, before .put()ing it back
        const statsObject = await DATA.get("STATS", { type: "json" });
        if (Number.isInteger(totalGuilds)) statsObject.totalGuilds = totalGuilds;
        if (Number.isInteger(totalChannels)) statsObject.totalChannels = totalChannels;
        if (Number.isInteger(totalMembers)) statsObject.totalMembers = totalMembers;
        if (incrementTotalStatsSent === true) {
            // Get total and the specific game to increment
            const totalStatsSent = parseInt(statsObject.totalStatsSent.total);
            const totalStatsSentGame = parseInt(statsObject.totalStatsSent.games[game]);
            const totalStatsSentLanguage = parseInt(statsObject.totalStatsSent.languages[language]);
            // Increment total and the specific game
            if (Number.isInteger(totalStatsSent)) statsObject.totalStatsSent.total++;
            if (Number.isInteger(totalStatsSentGame)) statsObject.totalStatsSent.games[game]++;
            if (Number.isInteger(totalStatsSentLanguage)) statsObject.totalStatsSent.languages[language]++;
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