/**
 * Launch full isaac.zip under Boxedwine; capture WINEDEBUG + canvas nonblack.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const web = join(root, 'web');
const scratch =
  process.env.SCRATCH ||
  join(process.env.TEMP || '/tmp', 'grok-goal-99c99693b918', 'implementer');
mkdirSync(scratch, { recursive: true });

const waitMs = Number(process.env.PROBE_WAIT_MS || 120000);
const tag = process.env.PROBE_TAG || 'paint-probe';
const app = process.env.PROBE_APP || 'isaac';
const program = process.env.PROBE_P || 'run.bat';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
  '.zip': 'application/zip',
};

function startServer() {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      if (urlPath === '/') urlPath = '/emu/index.html';
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
      resolvePromise({ server, port: server.address().port });
    });
  });
}

async function main() {
  const playwright = await import('playwright');
  const { server, port } = await startServer();
  const env = '%22WINEDEBUG:+debugstr,+loaddll%22';
  const url =
    `http://127.0.0.1:${port}/emu/index.html?overlay=debian10&app=${app}` +
    `&p=${program}&resolution=960x540&sound=0&storage=memory&env=${env}`;
  console.log(url);

  const lines = [];
  const browser = await playwright.chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    page.on('console', (msg) => {
      const t = msg.text();
      lines.push(t);
      if (/ISAAC_STUB|S_API|err:|OpenGL|WGL|EXIT|nonblack|paint/i.test(t)) {
        console.log('>>', t.slice(0, 300));
      }
    });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 });
    await page.waitForTimeout(waitMs);

    const snap = await page.evaluate(() => {
      const canvas = document.getElementById('canvas');
      let nonblack = 0;
      let w = 0;
      let h = 0;
      if (canvas) {
        w = canvas.width;
        h = canvas.height;
        try {
          const gl =
            canvas.getContext('webgl2') ||
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl');
          if (gl) {
            const pixels = new Uint8Array(w * h * 4);
            gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            let step = Math.max(1, Math.floor((w * h) / 4096));
            for (let i = 0; i < w * h; i += step) {
              const o = i * 4;
              if (pixels[o] | pixels[o + 1] | pixels[o + 2]) nonblack++;
            }
          }
        } catch (e) {
          return { error: String(e), w, h };
        }
      }
      let runlog = null;
      try {
        const FS = window.FS || window.Module?.FS;
        if (FS) {
          runlog = FS.readFile('/root/home/username/.wine/drive_c/files/runlog.txt', {
            encoding: 'utf8',
          });
        }
      } catch (e) {
        runlog = 'readerr ' + e;
      }
      return { w, h, nonblack, runlog };
    });

    await page.screenshot({ path: join(scratch, `${tag}.png`), fullPage: true });
    const report = {
      snap,
      interesting: lines.filter((l) =>
        /ISAAC_STUB|S_API|err:|OpenGL|WGL|loaddll.*isaac|EXIT|Failed/i.test(l),
      ),
      mips: lines.filter((l) => /\[MIPS\]/.test(l)).slice(-30),
      tail: lines.slice(-40),
    };
    writeFileSync(join(scratch, `${tag}.json`), JSON.stringify(report, null, 2));
    writeFileSync(join(scratch, `${tag}.log`), lines.join('\n'));
    console.log('snap', JSON.stringify(snap).slice(0, 500));
    console.log('wrote', join(scratch, `${tag}.json`));
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((e) => {
  console.error(e);
  writeFileSync(join(scratch, `${tag}-error.log`), String(e.stack || e));
  process.exit(1);
});
