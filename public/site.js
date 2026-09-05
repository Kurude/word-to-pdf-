const analyticsScript = document.createElement('script');
analyticsScript.src = '/analytics.js';
document.head.append(analyticsScript);

const savedTheme = localStorage.getItem('tema');
document.body.classList.toggle('dark-mode', savedTheme ? savedTheme === 'escuro' : window.matchMedia('(prefers-color-scheme: dark)').matches);
const toggle = document.createElement('button');
toggle.type = 'button'; toggle.className = 'theme-toggle';
document.querySelector('.topbar').append(toggle);
function setToggle() { const dark = document.body.classList.contains('dark-mode'); toggle.textContent = dark ? '☀' : '☾'; toggle.setAttribute('aria-label', dark ? 'Ativar modo claro' : 'Ativar modo escuro'); }
toggle.addEventListener('click', () => { document.body.classList.toggle('dark-mode'); localStorage.setItem('tema', document.body.classList.contains('dark-mode') ? 'escuro' : 'claro'); setToggle(); });
setToggle();
