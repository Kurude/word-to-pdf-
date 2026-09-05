import 'dotenv/config';

const number = (name, fallback) => {
  const value = Number.parseInt(process.env[name] ?? fallback, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export const config = {
  port: number('PORT', 3000),
  maxFileSizeMb: number('MAX_FILE_SIZE_MB', 50),
  timeoutMs: number('CONVERSION_TIMEOUT_MS', 120000),
  retentionMinutes: number('TEMP_FILE_RETENTION_MINUTES', 10),
  canonicalUrl: (process.env.CANONICAL_URL || 'http://localhost:3000').replace(/\/$/, ''),
  corsOrigin: process.env.CORS_ORIGIN || false
};
export const maxFileBytes = config.maxFileSizeMb * 1024 * 1024;
