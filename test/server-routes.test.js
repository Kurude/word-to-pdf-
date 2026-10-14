import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

process.env.NODE_ENV = 'test';
const { createApp } = await import('../server/server.js');

async function withApp(testFn) {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address();

  try {
    await testFn(port);
  } finally {
    await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
}

test('homepage and valid info pages return HTTP 200 with canonical URLs', async () => {
  await withApp(async (port) => {
    const routes = [
      ['/', 'https://wordparapdf.com/'],
      ['/sobre', 'https://wordparapdf.com/sobre'],
      ['/privacidade', 'https://wordparapdf.com/privacidade'],
      ['/termos', 'https://wordparapdf.com/termos'],
      ['/contato', 'https://wordparapdf.com/contato']
    ];

    for (const [route, expectedCanonical] of routes) {
      const response = await fetch(`http://127.0.0.1:${port}${route}`);
      assert.equal(response.status, 200, `Expected 200 for ${route}`);
      const html = await response.text();
      assert.match(html, new RegExp(`href="${expectedCanonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i'));
    }
  });
});

test('robots.txt and sitemap.xml are served and valid', async () => {
  await withApp(async (port) => {
    const robots = await fetch(`http://127.0.0.1:${port}/robots.txt`);
    assert.equal(robots.status, 200);
    const robotsText = await robots.text();
    assert.match(robotsText, /User-agent:\s*\*/i);
    assert.match(robotsText, /Sitemap:\s*https:\/\/wordparapdf\.com\/sitemap\.xml/i);

    const sitemap = await fetch(`http://127.0.0.1:${port}/sitemap.xml`);
    assert.equal(sitemap.status, 200);
    const sitemapText = await sitemap.text();
    assert.match(sitemapText, /<urlset/i);
    assert.match(sitemapText, /https:\/\/wordparapdf\.com\//i);
    assert.match(sitemapText, /https:\/\/wordparapdf\.com\/sobre/i);
  });
});

test('the explicit 404 page is served with a 404 status', async () => {
  await withApp(async (port) => {
    const response = await fetch(`http://127.0.0.1:${port}/404`);
    assert.equal(response.status, 404);
    assert.match(await response.text(), /WordParaPDF|404/i);
  });
});

test('unknown routes return a real 404', async () => {
  await withApp(async (port) => {
    const response = await fetch(`http://127.0.0.1:${port}/does-not-exist`);
    assert.equal(response.status, 404);
  });
});

test('the browser uses a same-origin conversion endpoint for DOC/DOCX uploads', async () => {
  const appJs = await readFile(path.join(process.cwd(), 'public', 'app.js'), 'utf8');
  assert.match(appJs, /fetch\(['"]\/api\/convert['"],\s*\{\s*method:\s*['"]POST['"],\s*body\s*\}/i);
  assert.doesNotMatch(appJs, /word-to-pdf-dnq2\.onrender\.com/i);
});

test('analytics uses the intended single measurement ID', async () => {
  const analyticsJs = await readFile(path.join(process.cwd(), 'public', 'analytics.js'), 'utf8');
  assert.match(analyticsJs, /G-VPBZ6F2S85/i);
  assert.doesNotMatch(analyticsJs, /G-78FRZLQNRV/i);
});
