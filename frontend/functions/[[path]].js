export async function onRequest(context) {
    const url = new URL(context.request.url);
    const path = url.pathname;

    // Helper to check if the path looks like a file (has an extension)
    // We check if the last segment (after the last /) contains a dot.
    const isFile = path.split('/').pop().includes('.');

    // If it's a file, serve it from assets
    if (isFile) {
        return context.env.ASSETS.fetch(context.request);
    }

    // Otherwise, serve index.html for client-side routing
    return context.env.ASSETS.fetch(new Request(url.origin + '/index.html'));
}
