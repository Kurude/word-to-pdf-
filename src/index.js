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
    const container = getContainer(env.WORD2PDF_CONTAINER, 'word2pdf');
    const response = await container.fetch(request);
    const newResponse = new Response(response.body, response);
    newResponse.headers.delete('X-Robots-Tag');
    newResponse.headers.set('X-Debug-Marker', 'v2-worker-active');
    return newResponse;
  }
};
