import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const root = path.join(process.cwd(), 'data', 'jobs');
export async function createJob() {
  const directory = path.join(root, randomUUID());
  await fs.mkdir(path.join(directory, 'input'), { recursive: true });
  await fs.mkdir(path.join(directory, 'output')); await fs.mkdir(path.join(directory, 'profile'));
  return { directory, inputDir: path.join(directory, 'input'), outputDir: path.join(directory, 'output'), profileDir: path.join(directory, 'profile') };
}
export async function removeJob(directory) { await fs.rm(directory, { recursive: true, force: true }); }
export async function cleanupExpired(retentionMinutes) {
  await fs.mkdir(root, { recursive: true }); const cutoff = Date.now() - retentionMinutes * 60_000;
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory() && (await fs.stat(target)).mtimeMs < cutoff) await removeJob(target);
  }
}
