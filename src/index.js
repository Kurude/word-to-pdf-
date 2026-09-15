import { Container, getContainer } from '@cloudflare/containers';

export class Word2PdfContainer extends Container {
  defaultPort = 3000;
  sleepAfter = '10m';
  envVars = {
    NODE_ENV: 'production',
    PORT: '3000'
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) {
      const assetPaths = url.pathname === '/'
        ? ['/home']
        : [url.pathname, url.pathname.endsWith('/') ? `${url.pathname}index.html` : `${url.pathname}.html`];
      for (const assetPath of assetPaths) {
        const assetUrl = new URL(assetPath, request.url);
        assetUrl.search = url.search;
        const assetRequest = new Request(assetUrl, request);
        const assetResponse = await env.ASSETS.fetch(assetRequest);
        if (assetResponse.status !== 404) {
          const publicResponse = new Response(assetResponse.body, assetResponse);
          publicResponse.headers.set('X-Robots-Tag', 'index, follow');
          return publicResponse;
        }
      }
    }

    const container = getContainer(env.WORD2PDF_CONTAINER, 'word2pdf');
    const response = await container.fetch(request);
    const newResponse = new Response(response.body, response);
    newResponse.headers.delete('X-Robots-Tag');
    newResponse.headers.set('X-Robots-Tag', 'index, follow');
    newResponse.headers.set('X-Debug-Marker', 'v2-active');
    return newResponse;
  }
};
