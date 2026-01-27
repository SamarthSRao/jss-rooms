export async function onRequest(context) {
    // Attempt to fetch the asset from the static site
    const response = await context.env.ASSETS.fetch(context.request);

    // If the asset is not found (404), serve index.html for SPA routing
    // This allows the client-side router to handle the path
    if (response.status === 404) {
        const url = new URL(context.request.url);
        return context.env.ASSETS.fetch(new Request(url.origin + '/index.html'));
    }

    // Otherwise, return the original response (static asset found)
    return response;
}
