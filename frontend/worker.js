export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Attempt to fetch the request from the static assets
        let response = await env.ASSETS.fetch(request);

        // If the response is a 404 and the path doesn't look like a file (no extension),
        // fallback to serving index.html for Single Page Application routing.
        if (response.status === 404 && !url.pathname.split('/').pop().includes('.')) {
            response = await env.ASSETS.fetch(new URL('/index.html', request.url));
        }

        return response;
    }
};
