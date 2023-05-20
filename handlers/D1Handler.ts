import { D1OutputPayload, D1UserPayload, Environment } from "../types";
import _401 from "../utils/401";
import json from "../utils/json";

export default async (request: Request, env: Environment): Promise<Response> => {

    const isAdmin = env.API_KEY && request.headers.get("API-KEY") === env.API_KEY;
    const url = new URL(request.url);

    // PRIVATE - D1 general
    if (url.pathname === "/d1") {
        if (!isAdmin) return _401();
        const query = request.headers.get("D1-Query");
        if (!query) return new Response("Header 'D1-Query' is required.", { status: 400 });
        try {
            const { results } = await env.DB.prepare(query).all();
            return json(results);
        } catch (e) {
            console.log({ message: e.message, cause: e.cause?.message });
            return json({ message: e.message, cause: e.cause?.message }, 500);
        }
    }

    // PUBLIC - D1 users (top 20)
    if (request.method === "GET" && url.pathname === "/d1/users/limited") {
        const { results } = await env.DB.prepare("SELECT total_stats_sent FROM users ORDER BY total_stats_sent DESC LIMIT 20").all();
        return json(results);
    }

    // PUBLIC - D1 users (count)
    if (request.method === "GET" && url.pathname === "/d1/users/counts") {
        const { results } = await env.DB.prepare("SELECT COUNT(*) as total_users FROM users").all();
        return json(results);
    }

    // PUBLIC - D1 users (count and top 20)
    if (request.method === "GET" && url.pathname === "/d1/users/special") {
        const { results } = await env.DB.prepare("SELECT (SELECT COUNT(*) FROM users) AS total_users, total_stats_sent FROM users ORDER BY total_stats_sent DESC LIMIT 20").all();
        return json(results);
    }

    // PUBLIC - D1 outputs (last 20)
    if (request.method === "GET" && url.pathname === "/d1/outputs/limited") {
        const { results } = await env.DB.prepare("SELECT game, segment, language, date FROM outputs ORDER BY date DESC LIMIT 20").all();
        return json(results);
    }

    // PUBLIC - D1 outputs (counts)
    if (request.method === "GET" && url.pathname === "/d1/outputs/counts") {
        const { results } = await env.DB.prepare("SELECT 'game' as category, game as item, COUNT(*) as sent FROM outputs GROUP BY game UNION ALL SELECT 'segment' as category, segment as item, COUNT(*) as sent FROM outputs GROUP BY segment UNION ALL SELECT 'language' as category, language as item, COUNT(*) as sent FROM outputs GROUP BY language ORDER BY category ASC, sent DESC").all();
        return json(results);
    }

    // POSTS
    if (request.method === "POST") {
        // D1 users
        if (url.pathname === "/d1/users") {
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
                    return json({ message: e.message, cause: e.cause?.message }, 500);
                }
        }
    
        // D1 outputs
        if (url.pathname === "/d1/outputs") {
                if (!isAdmin) return _401();
    
                try {
    
                    const { userId, username, guildName, guildId, game, segment, language, messageURL, imageURL }: D1OutputPayload = await request.json();
    
                    await env.DB.prepare(`INSERT INTO outputs (user_id, username, guild_name, guild_id, game, segment, language, date, message_url, image_url) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`).bind(userId, username, guildName, guildId, game, segment, language, new Date().getTime(), messageURL, imageURL).run();
    
                    return new Response("POST /d1/outputs OK");
    
                } catch (e) {
                    console.log({ message: e.message, cause: e.cause?.message });
                    return json({ message: e.message, cause: e.cause?.message }, 500);
                }
        }
    }
}