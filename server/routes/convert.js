import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { maxFileBytes, config } from '../config.js';
import { createJob, removeJob } from '../services/jobs.js';
import { downloadName, validateDocument } from '../services/document-validator.js';
import { convertWithLibreOffice } from '../services/libreoffice.js';

const router = express.Router();
const storage = multer.diskStorage({ destination: async (_req, _file, callback) => { try { const job = await createJob(); _req.job = job; callback(null, job.inputDir); } catch (e) { callback(e); } }, filename: (_req, file, callback) => callback(null, `source${path.extname(file.originalname).toLowerCase()}`) });
const upload = multer({ storage, limits: { fileSize: maxFileBytes, files: 1 }, fileFilter: (_req, file, cb) => cb(null, true) });

router.post('/', (req, res, next) => upload.single('document')(req, res, err => {
  if (err) return next(err); return next();
}), async (req, res, next) => {
  try {
    if (!req.file) { const e = new Error('Selecione um arquivo DOC ou DOCX.'); e.status = 400; throw e; }
    await validateDocument(req.file);
    const pdf = await convertWithLibreOffice({ inputPath: req.file.path, outputDir: req.job.outputDir, profileDir: req.job.profileDir, timeoutMs: config.timeoutMs });
    res.download(pdf, downloadName(req.file.originalname), async () => { await removeJob(req.job.directory); });
  } catch (error) {
    // Do not log a filename or document contents; operational detail only.
    console.error(`Falha na conversão: ${error.code || error.status || 'erro'} ${error.detail || error.message}`);
    if (req.job) await removeJob(req.job.directory); next(error);
  }
});
export default router;
