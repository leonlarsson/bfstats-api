import { Environment } from "../types";

export default async (env: Environment) => {
    try {
        const { results: outputs } = await env.DB.prepare("SELECT game, segment, language, date FROM outputs").all();
        await env.DATA_KV.put("D1_OUTPUTS", JSON.stringify({ cached: new Date().getTime(), outputs }));
        
        const { results: users } = await env.DB.prepare("SELECT total_stats_sent FROM users ORDER BY total_stats_sent DESC").all();
        await env.DATA_KV.put("D1_USERS", JSON.stringify({ cached: new Date().getTime(), users }));
    } catch (error) {
        console.log(error.cause);
    }
};