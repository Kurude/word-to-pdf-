import { promises as fs } from 'node:fs';
import path from 'node:path';

export const supportedMimes = new Set([
  'application/msword',
  'application/vnd.ms-word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream'
]);

export function extensionOf(name) { return path.extname(name).slice(1).toLowerCase(); }

export async function validateDocument(file) {
  const extension = extensionOf(file.originalname);
  if (!['doc', 'docx'].includes(extension) || !supportedMimes.has(file.mimetype)) {
    const error = new Error('Este formato de arquivo não é compatível. Envie um arquivo DOC ou DOCX.');
    error.status = 415;
    throw error;
  }
  const handle = await fs.open(file.path, 'r');
  const data = Buffer.alloc(8);
  await handle.read(data, 0, data.length, 0);
  await handle.close();
  const isDocx = data.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  const isDoc = data.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  if ((extension === 'docx' && !isDocx) || (extension === 'doc' && !isDoc)) {
    const error = new Error('Este documento parece estar corrompido ou protegido e não pôde ser convertido.');
    error.status = 422;
    throw error;
  }
  return extension;
}

export function downloadName(originalName) {
  const filename = String(originalName).split(/[\\/]/).pop() || '';
  const base = filename.slice(0, Math.max(0, filename.length - path.extname(filename).length)).replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').trim() || 'documento';
  return `${base}.pdf`;
}
