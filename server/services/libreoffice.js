import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const commands = process.env.LIBREOFFICE_BIN
  ? [process.env.LIBREOFFICE_BIN]
  : process.platform === 'win32'
    ? ['C:\\Program Files\\LibreOffice\\program\\soffice.com', 'soffice.com', 'soffice.exe', 'libreoffice.exe']
    : ['libreoffice', 'soffice'];

export async function convertWithLibreOffice({ inputPath, outputDir, profileDir, timeoutMs }) {
  await fs.mkdir(outputDir, { recursive: true });
  let lastError;
  for (const command of commands) {
    try {
      await run(command, ['--headless', '--nologo', '--nofirststartwizard', `-env:UserInstallation=${toFileUrl(profileDir)}`, '--convert-to', 'pdf:writer_pdf_Export', '--outdir', outputDir, inputPath], timeoutMs);
      const pdfPath = path.join(outputDir, `${path.basename(inputPath, path.extname(inputPath))}.pdf`);
      const stat = await fs.stat(pdfPath);
      if (stat.size > 0) return pdfPath;
      throw new Error('O LibreOffice não gerou um PDF válido.');
    } catch (error) {
      lastError = error;
      if (error.code !== 'ENOENT') break;
    }
  }
  if (lastError?.code === 'ENOENT') {
    const error = new Error('O serviço de conversão não está disponível no momento.'); error.status = 503; throw error;
  }
  throw lastError;
}

function toFileUrl(filePath) { return pathToFileURL(filePath).href; }
function run(command, args, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    const timer = setTimeout(() => { child.kill(); const e = new Error('A conversão demorou mais do que o esperado. Tente novamente com um documento menor.'); e.status = 504; reject(e); }, timeoutMs);
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else { const error = new Error('Não foi possível converter este documento. Verifique se o arquivo está íntegro e tente novamente.'); error.status = 422; error.detail = stderr; reject(error); }
    });
  });
}
