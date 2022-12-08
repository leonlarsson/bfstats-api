import handleCORSPreflight from "./handlers/handleCORSPreflight";
import baseStatsHandler from "./handlers/baseStatsHandler";
import D1Handler from "./handlers/D1Handler";
import { Environment } from "./types";

export default {
    async fetch(request: Request, env: Environment): Promise<Response> {

        // Handle CORS preflight. This is to allow me to fetch
        if (request.method === "OPTIONS") return handleCORSPreflight(request);

        const url = new URL(request.url);
        if (url.pathname === "/" && ["GET", "POST"].includes(request.method)) return baseStatsHandler(request, env);
        if (["/d1/users", "/d1/output"].includes(url.pathname) && ["GET", "POST"].includes(request.method)) return D1Handler(request, env);
        return new Response("Not found.", { status: 404 });
    }
}