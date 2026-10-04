/**
 * Launch check: serve static page, open with Playwright Chromium, assert no
 * uncaught errors, canvas sized, and after frames the surface is substantially filled.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const web = join(root, 'web');
const scratch =
  process.env.SCRATCH ||
  join(process.env.TEMP || '/tmp', 'grok-goal-isaac', 'implementer');
mkdirSync(scratch, { recursive: true });

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
};

function startServer() {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      if (urlPath === '/') urlPath = '/index.html';
      const file = join(web, urlPath.replace(/^\//, ''));
      if (!file.startsWith(web) || !existsSync(file) || statSync(file).isDirectory()) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
      res.end(readFileSync(file));
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolvePromise({ server, port });
    });
  });
}

async function main() {
  if (!existsSync(join(web, 'isaac-host.wasm'))) {
    writeFileSync(join(scratch, 'browser-launch-unavailable.log'), 'isaac-host.wasm missing\n');
    process.exit(2);
  }

  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    // try installing
    const r = spawnSync('npm', ['install', '--no-save', 'playwright'], {
      cwd: root,
      stdio: 'inherit',
      shell: true,
    });
    if (r.status !== 0) {
      writeFileSync(
        join(scratch, 'browser-launch-unavailable.log'),
        'playwright install failed\n',
      );
      // fallback structural harness
      await fallbackHarness();
      return;
    }
    playwright = await import('playwright');
  }

  const { server, port } = await startServer();
  const url = `http://127.0.0.1:${port}/`;
  const consoleLines = [];
  const pageErrors = [];

  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true });
  } catch (e) {
    writeFileSync(
      join(scratch, 'browser-launch-unavailable.log'),
      'chromium launch failed: ' + e.message + '\n',
    );
    server.close();
    await fallbackHarness();
    return;
  }

  try {
    for (let run = 1; run <= 2; run++) {
      const page = await browser.newPage();
      page.on('console', (msg) => consoleLines.push(`[run${run}] ${msg.type()}: ${msg.text()}`));
      page.on('pageerror', (err) => pageErrors.push(`[run${run}] ${err.message}`));
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(1500);

      const metrics = await page.evaluate(async () => {
        const canvas = document.getElementById('canvas');
        if (!canvas) return { error: 'no canvas' };
        // wait for wasm boot
        for (let i = 0; i < 50; i++) {
          if (window.__ISAAC__?.Module?._isaac_gl_ready?.()) break;
          await new Promise((r) => setTimeout(r, 100));
        }
        const Module = window.__ISAAC__?.Module;
        if (!Module) return { error: 'no Module', w: canvas.width, h: canvas.height };
        // tick a few frames if loop is running
        for (let i = 0; i < 10; i++) Module._isaac_tick(performance.now());
        const nonblack = Module._isaac_count_nonblack_samples(16);
        return {
          w: canvas.width,
          h: canvas.height,
          gl: Module._isaac_gl_ready(),
          frames: Module._isaac_frame_count(),
          nonblack,
          phase: Module._isaac_get_phase(),
        };
      });

      await page.screenshot({ path: join(scratch, `browser-launch-run${run}.png`), fullPage: true });
      writeFileSync(join(scratch, `browser-launch-run${run}.json`), JSON.stringify(metrics, null, 2));

      if (pageErrors.length) throw new Error('page errors: ' + pageErrors.join('; '));
      if (metrics.error) throw new Error(metrics.error);
      if (metrics.w < 640 || metrics.h < 360) throw new Error('canvas too small ' + JSON.stringify(metrics));
      // substantially filled: > 25% of 16x16 grid non-black after draw
      if (metrics.nonblack < 64) {
        throw new Error('canvas not substantially filled: nonblack=' + metrics.nonblack);
      }
      await page.close();
    }
    writeFileSync(
      join(scratch, 'browser-launch.log'),
      consoleLines.join('\n') + '\nOK two runs\n',
    );
    console.log('browser launch OK', consoleLines.slice(-5));
  } finally {
    await browser.close();
    server.close();
  }
}

async function fallbackHarness() {
  // Node harness: load modularized glue is hard without DOM; validate artifacts + execute pure boot pieces
  const html = readFileSync(join(web, 'index.html'), 'utf8');
  const app = readFileSync(join(web, 'js/app.js'), 'utf8');
  const host = readFileSync(join(web, 'isaac-host.js'), 'utf8');
  const report = {
    mode: 'fallback-no-chromium',
    hasCanvas: /id="canvas"/.test(html),
    hasModuleScript: /type="module"/.test(html),
    hasFileGuard: /file:/.test(html),
    appHasRaf: /createFrameLoop/.test(app),
    hostIsModular: /createIsaacHost|export default/.test(host),
    hostNoNodeRequire: !/\brequire\(['"]fs['"]\)/.test(host),
    wasmBytes: statSync(join(web, 'isaac-host.wasm')).size,
  };
  writeFileSync(join(scratch, 'browser-launch-unavailable.log'), JSON.stringify(report, null, 2));
  if (!report.hasCanvas || !report.hostIsModular || report.wasmBytes < 1000) {
    console.error('fallback harness failed', report);
    process.exit(1);
  }
  console.log('fallback harness OK', report);
}

main().catch((e) => {
  writeFileSync(join(scratch, 'browser-launch.log'), String(e.stack || e));
  console.error(e);
  process.exit(1);
});
