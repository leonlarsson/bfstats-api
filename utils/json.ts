export default (json: any, status = 200): Response => Response.json(json, { status, headers: { "Access-Control-Allow-Origin": "*" } });
