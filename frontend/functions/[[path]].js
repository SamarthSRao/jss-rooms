export async function onRequest(context) {
    const url = new URL(context.request.url);

    // Serve static files directly
    if (url.pathname.match(/\.(js|css|png|jpg|svg|ico|woff|woff2)$/)) {
        return context.env.ASSETS.fetch(context.request);
    }

    // Serve index.html for all other routes
    return context.env.ASSETS.fetch(new Request(url.origin + '/index.html'));
}
