import { D1OutputPayload, D1UserPayload, Environment } from "../types";
import _401 from "../utils/401";

export default async (request: Request, env: Environment): Promise<Response> => {

    const isAdmin = env.API_KEY && request.headers.get("API-KEY") === env.API_KEY;
    const url = new URL(request.url);

    // D1 users
    if (url.pathname === "/d1/users") {
        if (request.method === "POST") {

            if (!isAdmin) return _401();

            try {

                const { userId, username, language }: D1UserPayload = await request.json();

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
            const { results } = await env.DB.prepare(isAdmin ? (query ?? "SELECT * FROM users") : ("SELECT total_stats_sent FROM users ORDER BY total_stats_sent DESC")).all();
            return Response.json(results, { headers: { "Access-Control-Allow-Origin": "*" } });
        }
    }

    // D1 outputs
    if (url.pathname === "/d1/outputs") {
        if (request.method === "POST") {

            if (!isAdmin) return _401();

            try {

                const { userId, username, guildName, guildId, game, segment, language, messageURL, imageURL }: D1OutputPayload = await request.json();

                await env.DB.prepare(`INSERT INTO outputs (user_id, username, guild_name, guild_id, game, segment, language, date, message_url, image_url) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`).bind(userId, username, guildName, guildId, game, segment, language, new Date().getTime(), messageURL, imageURL).run();

                return new Response("POST /d1/outputs OK");

            } catch (e) {
                console.log({ message: e.message, cause: e.cause?.message });
                return Response.json({ message: e.message, cause: e.cause?.message }, { status: 500 });
            }

        } else if (request.method === "GET") {
            const query = request.headers.get("D1-Query");
            const { results } = await env.DB.prepare(isAdmin ? (query ?? "SELECT * FROM outputs") : ("SELECT game, segment, language, date FROM outputs")).all();
            return Response.json(results, { headers: { "Access-Control-Allow-Origin": "*" } });
        }
    }

}