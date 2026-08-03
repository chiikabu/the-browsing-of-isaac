/**
 * Probe isaac-ng under Boxedwine; capture WINEDEBUG and runlog.
 * Usage:
 *   node scripts/dll-probe.mjs
 *   node scripts/dll-probe.mjs --app isaac-probe --p run.bat
 *   node scripts/dll-probe.mjs --env "+loaddll,+seh,+module"
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

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
}

const appName = arg('--app', 'isaac-probe');
const program = arg('--p', 'run.bat');
const wineDebug = arg('--env', '+loaddll,+seh');
const waitMs = Number(process.env.PROBE_WAIT_MS || arg('--wait', '70000'));
const tag = arg('--tag', 'dll-probe3');

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
        res.end('not found: ' + urlPath);
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
  const appZip = join(web, 'emu', `${appName}.zip`);
  if (!existsSync(appZip)) {
    console.error('missing', appZip);
    process.exit(2);
  }

  const playwright = await import('playwright');
  const { server, port } = await startServer();
  const env = `%22WINEDEBUG:${wineDebug}%22`;
  const storage = arg('--storage', 'memory');
  const q = [
    'overlay=debian10',
    `app=${appName}`,
    `p=${program}`,
    'resolution=960x540',
    'sound=0',
    `storage=${storage}`,
    `env=${env}`,
  ].join('&');
  const url = `http://127.0.0.1:${port}/emu/index.html?${q}`;
  console.log('URL', url);

  const consoleLines = [];
  const browser = await playwright.chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    page.on('console', (msg) => {
      const t = msg.text();
      consoleLines.push(t);
      if (/err:|warn:|seh|exception|Unhandled|Library|not found|EXIT|STATUS|OpenGL|WGL|Failed|trace:seh/i.test(t)) {
        console.log('>>', t.slice(0, 400));
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(waitMs);

    let guestReads = [];
    try {
      guestReads = await page.evaluate(() => {
        const FS = window.FS || window.Module?.FS;
        if (!FS) return [{ err: 'no FS' }];
        const p = '/root/home/username/.wine/drive_c/files/runlog.txt';
        try {
          return [{ path: p, text: FS.readFile(p, { encoding: 'utf8' }) }];
        } catch (e) {
          return [{ path: p, err: String(e.message || e) }];
        }
      });
    } catch (e) {
      guestReads = [{ err: String(e) }];
    }

    const interesting = consoleLines.filter((l) =>
      /err:|warn:|seh|exception|Unhandled|Library|not found|module:|STATUS|fix:|abort|trace:seh/i.test(l),
    );

    await page.screenshot({ path: join(scratch, `${tag}.png`), fullPage: true });
    const report = {
      app: appName,
      program,
      wineDebug,
      waitMs,
      guestReads,
      interesting: interesting.slice(-400),
      mips: consoleLines.filter((l) => /\[MIPS\]/.test(l)).slice(-30),
      consoleTail: consoleLines.slice(-100),
      consoleCount: consoleLines.length,
    };
    writeFileSync(join(scratch, `${tag}.json`), JSON.stringify(report, null, 2));
    writeFileSync(join(scratch, `${tag}.log`), consoleLines.join('\n'));
    console.log('wrote', join(scratch, `${tag}.json`));
    if (guestReads[0]?.text) console.log('runlog:\n', guestReads[0].text);
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
