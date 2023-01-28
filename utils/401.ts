export default () => {
    return new Response("No valid 'API-KEY' in request headers.", {
        status: 401,
        headers: { "Access-Control-Allow-Origin": "*" }
    });
}