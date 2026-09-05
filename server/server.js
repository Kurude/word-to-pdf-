import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { config } from './config.js';
import convertRoute from './routes/convert.js';
import { cleanupExpired } from './services/jobs.js';

const app = express();
app.set('trust proxy', 1);
const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], scriptSrc: ["'self'", 'https://www.googletagmanager.com'], connectSrc: ["'self'", 'https://www.google-analytics.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com'], imgSrc: ["'self'", 'data:', 'https://www.google-analytics.com'] } } }));
app.use(cors(config.corsOrigin ? { origin: config.corsOrigin } : { origin: false }));
app.use('/api', rateLimit({ windowMs: 15 * 60_000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false, message: { erro: 'Muitas solicitações. Aguarde alguns minutos e tente novamente.' } }));
app.use('/api/convert', convertRoute);
app.get('/sitemap.xml', (_req, res) => res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/sobre', '/privacidade', '/termos', '/contato'].map((url) => `<url><loc>${config.canonicalUrl}${url}</loc></url>`).join('')}</urlset>`));
app.get('/robots.txt', (_req, res) => res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${config.canonicalUrl}/sitemap.xml\n`));
app.get('/', (_req, res) => res.sendFile(path.join(publicDir, 'home.html')));
app.use(express.static(publicDir, { extensions: ['html'], maxAge: '1h' }));
app.use((req, res, _next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ erro: 'Recurso não encontrado.' });
  }
  res.status(404).sendFile(path.join(publicDir, '404.html'));
});
app.use((err, req, res, _next) => {
  const tooLarge = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE';
  const status = tooLarge ? 413 : (err.status || 500);
  if (req.path.startsWith('/api/')) {
    const error = tooLarge ? `O arquivo é muito grande. O tamanho máximo permitido é de ${config.maxFileSizeMb} MB.` : (status >= 500 ? 'Ocorreu um erro inesperado. Tente novamente.' : err.message);
    return res.status(status).json({ erro: error });
  }
  if (tooLarge) {
    return res.status(413).sendFile(path.join(publicDir, '413.html'));
  }
  const pageStatus = [400, 404, 422, 429, 500, 503, 504].includes(status) ? status : 500;
  res.status(status).sendFile(path.join(publicDir, `${pageStatus}.html`));
});
cleanupExpired(config.retentionMinutes).catch(() => {});
setInterval(() => cleanupExpired(config.retentionMinutes).catch(() => {}), 60_000).unref();
app.listen(config.port, () => console.log(`Word para PDF em execução na porta ${config.port}`));
