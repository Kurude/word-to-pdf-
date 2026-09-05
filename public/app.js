const analyticsScript = document.createElement('script');
analyticsScript.src = '/analytics.js';
document.head.append(analyticsScript);
const input = document.querySelector('#file-input');
const zone = document.querySelector('#drop-zone');
const select = document.querySelector('#select-button');
const fileRow = document.querySelector('#file-row');
const nameEl = document.querySelector('#file-name');
const metaEl = document.querySelector('#file-meta');
const remove = document.querySelector('#remove-button');
const convert = document.querySelector('#convert-button');
const status = document.querySelector('#status');
let selectedFile;

document.querySelector('#year').textContent = new Date().getFullYear();
const themeStyle = document.createElement('style');
themeStyle.textContent = `.theme-toggle{width:36px;height:36px;border:1px solid var(--line);border-radius:50%;background:transparent;color:var(--ink);cursor:pointer;font-size:17px;line-height:1}.theme-toggle:hover{background:#f1f1f1}.theme-toggle:focus-visible{outline:3px solid #f6b7b1;outline-offset:3px}body.dark-mode{--ink:#ededed;--muted:#b6b6b6;--line:#343434;--paper:#202020;--wash:#151515;background:#151515;color:#ededed}body.dark-mode .topbar,body.dark-mode .details{background:#1d1d1d;border-color:#343434}body.dark-mode .brand{color:#f3f3f3}body.dark-mode .topbar nav a,body.dark-mode .locale,body.dark-mode .intro,body.dark-mode .drop-zone p,body.dark-mode .privacy,body.dark-mode .details p,body.dark-mode footer{color:#bdbdbd}body.dark-mode .drop-zone{border-color:#555;background:#202020}body.dark-mode .drop-zone.is-dragging,body.dark-mode .drop-zone:focus-visible{background:#29201f;border-color:#ef7369}body.dark-mode .upload-panel,body.dark-mode .status{background:#202020;border-color:#3c3c3c;box-shadow:0 7px 18px rgba(0,0,0,.2)}body.dark-mode .file-icon{background:#20364d;color:#95c9ff}body.dark-mode .theme-toggle:hover{background:#303030}`;
document.head.append(themeStyle);
const responsiveStyle = document.createElement('style');
responsiveStyle.textContent = `html{overflow-x:hidden}body{min-width:0}.topbar{min-width:0}.file-row,.file-details{min-width:0}@media(max-width:760px){.topbar{height:60px;padding:0 18px;gap:14px}.topbar nav{display:none}.brand{font-size:17px}.locale{margin-left:auto;font-size:13px}.hero{max-width:620px;padding:56px 18px 50px}.eyebrow{margin-bottom:15px}h1{font-size:35px;letter-spacing:-.9px}.intro{font-size:16px;margin:14px auto 29px;max-width:460px}.upload-panel{padding:8px}.drop-zone{min-height:238px;padding:25px 16px}.drop-zone p{font-size:14px}.button{min-height:48px}.file-row:not([hidden]){min-height:0;display:grid;grid-template-columns:40px minmax(0,1fr) auto;gap:12px;padding:18px}.file-details{width:100%}.file-row .button{grid-column:2 / -1;width:100%;margin:3px 0 0}.text-button{font-size:13px;min-height:42px;padding:0}.status{margin-top:21px;padding:21px}.details{padding:38px 18px 45px}}@media(max-width:480px){.topbar{padding:0 14px}.locale{display:none}.theme-toggle{margin-left:auto;flex:0 0 auto}.hero{padding:45px 12px 42px}h1{font-size:30px;line-height:1.16}.intro{font-size:15px;line-height:1.5;margin-bottom:25px}.upload-panel{padding:7px}.drop-zone{min-height:225px;padding:22px 12px}.drop-zone .button{width:100%;max-width:292px;padding:0 12px;font-size:15px}.drop-zone p{margin-top:15px}.drop-zone .accepted{font-size:11px}.file-row:not([hidden]){grid-template-columns:36px minmax(0,1fr) auto;padding:15px 13px;gap:10px}.file-icon{width:34px;height:40px}.file-details strong{font-size:14px}.file-details span{font-size:12px}.text-button{font-size:12px}.file-row .button{grid-column:1 / -1;margin-top:5px}.status{padding:18px 15px;font-size:15px}.status .download{display:grid;gap:12px}.status .download .button{width:100%}.status .download .text-button{justify-self:center;min-height:36px}.privacy{font-size:12px;padding:0 6px}.details h2{font-size:20px}.details p{font-size:14px}footer{padding:19px 14px;line-height:1.5}}@media(max-width:350px){h1{font-size:27px}.hero{padding-left:10px;padding-right:10px}.drop-zone .button{font-size:14px}.file-row:not([hidden]){padding:13px 10px}}`;
document.head.append(responsiveStyle);
const savedTheme = localStorage.getItem('tema');
const useDark = savedTheme ? savedTheme === 'escuro' : window.matchMedia('(prefers-color-scheme: dark)').matches;
document.body.classList.toggle('dark-mode', useDark);
const themeToggle = document.createElement('button');
themeToggle.type = 'button'; themeToggle.className = 'theme-toggle';
document.querySelector('.topbar').append(themeToggle);
function updateThemeToggle() {
  const dark = document.body.classList.contains('dark-mode');
  themeToggle.textContent = dark ? '☀' : '☾';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? 'Ativar modo claro' : 'Ativar modo escuro');
  themeToggle.title = dark ? 'Ativar modo claro' : 'Ativar modo escuro';
}
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('tema', document.body.classList.contains('dark-mode') ? 'escuro' : 'claro');
  updateThemeToggle();
});
updateThemeToggle();
select.addEventListener('click', () => input.click());
zone.addEventListener('click', event => { if (event.target !== select) input.click(); });
zone.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); } });
input.addEventListener('change', () => choose(input.files[0]));
['dragenter', 'dragover'].forEach(type => zone.addEventListener(type, event => { event.preventDefault(); zone.classList.add('is-dragging'); }));
['dragleave', 'drop'].forEach(type => zone.addEventListener(type, event => { event.preventDefault(); zone.classList.remove('is-dragging'); }));
zone.addEventListener('drop', event => choose(event.dataTransfer.files[0]));
remove.addEventListener('click', reset);
convert.addEventListener('click', convertFile);

function choose(file) {
  hideStatus();
  if (!file) return;
  if (!/\.(doc|docx)$/i.test(file.name)) return showError('Este formato de arquivo não é compatível. Envie um arquivo DOC ou DOCX.');
  selectedFile = file;
  nameEl.textContent = file.name;
  metaEl.textContent = `${file.name.split('.').pop().toUpperCase()} · ${formatBytes(file.size)}`;
  zone.hidden = true; fileRow.hidden = false;
}
function reset() { selectedFile = undefined; input.value = ''; fileRow.hidden = true; zone.hidden = false; hideStatus(); }
function formatBytes(bytes) { const mb = bytes / 1024 / 1024; return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: mb < 1 ? 1 : 1 }).format(mb)} MB`; }
function showError(message) { status.hidden = false; status.className = 'status error'; status.textContent = message; }
function hideStatus() { status.hidden = true; status.textContent = ''; status.className = 'status'; }
async function convertFile() {
  if (!selectedFile) return;
  convert.disabled = true; remove.disabled = true;
  status.hidden = false; status.className = 'status loading'; status.textContent = 'Convertendo documento…';
  try {
    const body = new FormData(); body.append('document', selectedFile);
    const response = await fetch('https://word-to-pdf-dnq2.onrender.com/api/convert', {method: 'POST', body });
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.erro || 'Erro durante a conversão.'); }
    const blob = await response.blob();
    const fileName = filenameFrom(response.headers.get('content-disposition')) || selectedFile.name.replace(/\.[^.]+$/, '') + '.pdf';
    const url = URL.createObjectURL(blob);
    status.className = 'status success';
    status.innerHTML = `<strong>✓ Conversão concluída</strong><div class="download"><button class="button button-primary" type="button">Baixar PDF</button> <button class="text-button" type="button">Converter outro documento</button></div>`;
    status.querySelector('.button').addEventListener('click', () => { const link = document.createElement('a'); link.href = url; link.download = fileName; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1_000); });
    status.querySelector('.text-button').addEventListener('click', reset);
  } catch (error) { showError(error.message); }
  finally { convert.disabled = false; remove.disabled = false; }
}
function filenameFrom(header) { const match = header?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i); return decodeURIComponent(match?.[1] || match?.[2] || ''); }
