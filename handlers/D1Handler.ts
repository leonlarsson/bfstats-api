import { D1OutputPayload, D1UsersPayload, Environment } from "../types";

export default async (request: Request, env: Environment): Promise<Response> => {

    // IF API-KEY is not correct, return
    if (request.headers.get("API-KEY") !== env.API_KEY) {
        return new Response("No valid 'API-KEY' in request headers.", {
            status: 401,
            headers: { "Access-Control-Allow-Origin": "*" }
        });
    }

    const url = new URL(request.url);

    // D1 users
    if (url.pathname === "/d1/users") {
        if (request.method === "POST") {
            try {

                const { userId, username, language }: D1UsersPayload = await request.json();

                // Insert a new user. If there is a conflict (user_id already exists), then update the existing row
                await env.DB.prepare(`
                    INSERT INTO users (user_id, username, last_stats_sent, last_language, total_stats_sent) 
                    VALUES (?1, ?2, ?3, ?4, 1) 
                    ON CONFLICT (user_id) DO UPDATE SET username = ?2, last_stats_sent = ?3, last_language = ?4, total_stats_sent = total_stats_sent + 1 
                    WHERE user_id = ?1
                    `).bind(userId, username, new Date().getTime(), language).run();

                return new Response("POST /d1/users OK");

            } catch (e) {
                console.log({ message: e.message, cause: e.cause?.message });
                return Response.json({ message: e.message, cause: e.cause?.message }, { status: 500 });
            }

        } else if (request.method === "GET") {
            const query = request.headers.get("D1-Query");
            const { results } = await env.DB.prepare(query ?? "SELECT * FROM users").all();
            return Response.json(results, { headers: { "Access-Control-Allow-Origin": "*" } });
        }
    }

    // D1 output
    if (url.pathname === "/d1/output") {
        if (request.method === "POST") {
            try {

                const { userId, username, guildName, guildId, game, segment, language, messageURL, imageURL }: D1OutputPayload = await request.json();

                await env.DB.prepare(`INSERT INTO output (user_id, username, guild_name, guild_id, game, segment, language, date, message_url, image_url) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`).bind(userId, username, guildName, guildId, game, segment, language, new Date().getTime(), messageURL, imageURL).run();

                return new Response("POST /d1/output OK");

            } catch (e) {
                console.log({ message: e.message, cause: e.cause?.message });
                return Response.json({ message: e.message, cause: e.cause?.message }, { status: 500 });
            }

        } else if (request.method === "GET") {
            const query = request.headers.get("D1-Query");
            const { results } = await env.DB.prepare(query ?? "SELECT * FROM output").all();
            return Response.json(results, { headers: { "Access-Control-Allow-Origin": "*" } });
        }
    }

}