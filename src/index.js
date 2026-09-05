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
    return container.fetch(request);
  }
};
