/**
 * End-to-end acceptance check for the wired native frame path.
 *
 * Proves, in a real browser against the real page, that:
 *   1. the frame path selects native-wasm and never re-enters x86 PE emulation;
 *   2. the native Game::Update slice ticks every frame;
 *   3. the native Game::Render slice drives GL host bodies that actually draw
 *      (pixel readback, not a self-report);
 *   4. keyboard reaches the native menu lane and changes real slice state
 *      (menuState23a74), and the host phase follows that state.
 *
 * Each check is reported pass/fail independently so a partial wiring is visible
 * rather than hidden behind the first failure. Exit code is nonzero if any
 * REQUIRED check fails.
 *
 * Usage: node scripts/verify-native-frame-path.mjs [--url http://127.0.0.1:8765]
 *        (expects `npm run serve` already running unless --spawn is passed)
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "output", "decomp", "frame-path-verification");

const args = process.argv.slice(2);
const urlArg = args.indexOf("--url");
const baseUrl = urlArg >= 0 ? args[urlArg + 1] : "http://127.0.0.1:8765";
const spawnServer = args.includes("--spawn");
const headed = args.includes("--headed");
/* The page mounts the native-frame-path file set by default; --full-mount asks
   for all 11245 files (minutes) and is only needed for asset work. */
const url = `${baseUrl}/${args.includes("--full-mount") ? "?fullmount=1" : ""}`;

const results = [];
function check(name, required, ok, detail) {
  results.push({ name, required, ok: !!ok, detail });
  const tag = ok ? "PASS" : required ? "FAIL" : "warn";
  console.log(`[${tag}] ${name}${detail ? ` — ${detail}` : ""}`);
}

async function waitFor(page, fn, { timeout = 120000, poll = 250, label = "condition" } = {}) {
  const deadline = Date.now() + timeout;
  let last = null;
  for (;;) {
    last = await page.evaluate(fn).catch((e) => ({ __error: e.message }));
    if (last && !last.__error && last.ok) return last;
    if (Date.now() > deadline) return { ...(last || {}), timedOut: true, label };
    await new Promise((r) => setTimeout(r, poll));
  }
}

let server = null;
if (spawnServer) {
  server = spawn(process.execPath, [join(root, "scripts", "serve.mjs")], {
    cwd: root,
    stdio: "ignore",
    detached: false,
  });
  await new Promise((r) => setTimeout(r, 1500));
}

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: !headed });
const page = await browser.newPage({ viewport: { width: 1100, height: 720 } });
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});

try {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  // --- boot -----------------------------------------------------------------
  const booted = await waitFor(
    page,
    () => {
      const I = window.__ISAAC__;
      return { ok: !!I, mode: I?.framePathMode ?? null, pe: I?.usesX86Emulation ?? null };
    },
    { timeout: 180000, label: "boot" },
  );
  check("page boots and exposes __ISAAC__", true, booted.ok && !booted.timedOut,
    booted.timedOut ? "timed out" : `mode=${booted.mode}`);

  // --- 1. frame path selection ---------------------------------------------
  const sel = await page.evaluate(() => {
    const I = window.__ISAAC__;
    return {
      mode: I?.framePathMode ?? null,
      pe: I?.usesX86Emulation,
      updateAbi: I?.nativeBridge?.slice?.abiVersion ?? null,
      renderAbi: I?.nativeBridge?.renderSlice?.abiVersion ?? null,
      hasRenderTick: typeof I?.nativeBridge?.renderTick === "function",
      hasInputBridge: !!I?.inputBridge,
      hasGlHost: !!I?.glHost,
    };
  });
  check("frame path is native-wasm", true, sel.mode === "native-wasm", `mode=${sel.mode}`);
  check("no x86 PE emulation on the frame path", true, sel.pe === false, `usesX86Emulation=${sel.pe}`);
  check("native Update slice loaded", true, sel.updateAbi != null, `abi=${sel.updateAbi}`);
  check("native Render slice loaded", true, sel.renderAbi != null, `abi=${sel.renderAbi}`);
  check("render tick exposed on the bridge", true, sel.hasRenderTick);
  check("input bridge present", true, sel.hasInputBridge);
  check("GL render host present", true, sel.hasGlHost);

  // --- 2. Update ticks ------------------------------------------------------
  const ticked = await waitFor(
    page,
    () => {
      const t = window.__ISAAC__?.nativeBridge?.session?.ticks ?? 0;
      return { ok: t > 30, ticks: t };
    },
    { timeout: 60000, label: "update ticks" },
  );
  check("native Update slice ticks every frame", true, ticked.ok, `ticks=${ticked.ticks}`);

  // --- 3. Render draws ------------------------------------------------------
  const drew = await waitFor(
    page,
    () => {
      const I = window.__ISAAC__;
      const stats = I?.glHost?.stats ?? null;
      const draws = stats ? (stats.drawCalls ?? stats.draws ?? stats.totalDraws ?? 0) : 0;
      return { ok: draws > 0, draws, renderMode: I?.renderMode?.() ?? null, stats: stats ? Object.keys(stats) : null };
    },
    { timeout: 60000, label: "gl draws" },
  );
  check("native render path issues GL draws", true, drew.ok,
    `draws=${drew.draws} renderMode=${drew.renderMode} statKeys=${JSON.stringify(drew.stats)}`);

  const pixels = await page.evaluate(() => {
    const M = window.__ISAAC__?.Module;
    if (!M?._isaac_count_nonblack_samples) return { nonblack: null };
    return { nonblack: M._isaac_count_nonblack_samples(16) };
  });
  // NOT required with the menu closed: on the JS-owned zeroed Game buffer the
  // fade colour is black, so a black canvas is the CORRECT native output. The
  // colourful host paint stub is what used to fill this. Required-fill is
  // asserted below with the menu open, where real menu art must be visible.
  check("canvas filled with the menu closed (informational)", false,
    (pixels.nonblack ?? 0) > 32, `nonblack=${pixels.nonblack}/256`);

  await page.screenshot({ path: join(outDir, "frame-path-before-input.png") });

  // --- 4. Input reaches the native menu lane -------------------------------
  const autoOpen = await waitFor(
    page,
    () => {
      const I = window.__ISAAC__;
      const menuState = I?.nativeBridge?.session?.state?.menuState23a74 ?? 0;
      return { ok: menuState !== 0, menuState, phase: I?.Module?._isaac_get_phase?.() ?? null };
    },
    { timeout: 20000, label: "menu auto-open" },
  );
  check("boot latches the native menu lane (menuState23a74)", true, autoOpen.ok,
    `menuState=${autoOpen.menuState}`);
  check("host phase follows native menu state (phase 2 = main_menu)", true,
    autoOpen.phase === 2, `phase=${autoOpen.phase}`);

  await page.keyboard.press("Escape");
  const closed = await waitFor(
    page,
    () => {
      const I = window.__ISAAC__;
      const menuState = I?.nativeBridge?.session?.state?.menuState23a74 ?? 1;
      return { ok: menuState === 0, menuState, phase: I?.Module?._isaac_get_phase?.() ?? null };
    },
    { timeout: 20000, label: "menu close" },
  );
  check("Escape toggles the native menu lane closed", true, closed.ok,
    `afterEsc=${closed.menuState} phase=${closed.phase}`);

  await page.keyboard.press("Escape");
  const afterInput = await waitFor(
    page,
    () => {
      const I = window.__ISAAC__;
      const menuState = I?.nativeBridge?.session?.state?.menuState23a74 ?? 0;
      return { ok: menuState !== 0, menuState, phase: I?.Module?._isaac_get_phase?.() ?? null };
    },
    { timeout: 20000, label: "menu reopen" },
  );
  check("Escape re-opens the native menu lane (menuState23a74)", true, afterInput.ok,
    `after=${afterInput.menuState}`);

  const menuPixels = await page.evaluate(() => {
    const M = window.__ISAAC__?.Module;
    return { nonblack: M?._isaac_count_nonblack_samples?.(16) ?? null };
  });
  check("open menu puts real pixels on the canvas", true, (menuPixels.nonblack ?? 0) > 8,
    `nonblack=${menuPixels.nonblack}/256`);

  // --- 5. The menu actually renders, not just flips state -------------------
  const menuDraw = await waitFor(
    page,
    () => {
      const I = window.__ISAAC__;
      const cmds = I?.menuScene?.commands?.() ?? [];
      const s = I?.glHost?.stats ?? {};
      const sprites = cmds.filter((c) => c && (c.type === "sprite" ||
        (c.type === "text" && Array.isArray(c.glyphs) && c.glyphs.length))).length;
      return {
        ok: cmds.length > 0 && (s.submittedDrawn ?? 0) > 0,
        cmds: cmds.length,
        sprites,
        submitted: s.submitted ?? 0,
        submittedDrawn: s.submittedDrawn ?? 0,
        missingTexture: s.missingTexture ?? 0,
        unsupportedText: s.unsupportedText ?? 0,
        textureUploads: s.textureUploads ?? 0,
      };
    },
    { timeout: 20000, label: "menu draws" },
  );
  check("open menu emits draw commands from the real assets", true,
    menuDraw.cmds > 0 && menuDraw.sprites > 0,
    `commands=${menuDraw.cmds} sprite-bearing=${menuDraw.sprites} textures=${menuDraw.textureUploads}`);
  check("menu commands actually reach the GL host", true, menuDraw.submittedDrawn > 0,
    `submitted=${menuDraw.submitted} drawn=${menuDraw.submittedDrawn}`);
  check("no menu sprite is skipped for a missing texture", true,
    menuDraw.missingTexture === 0 && menuDraw.unsupportedText === 0,
    `missingTexture=${menuDraw.missingTexture} unsupportedText=${menuDraw.unsupportedText}`);

  await page.screenshot({ path: join(outDir, "frame-path-menu-open.png") });

  check("no uncaught page errors", false, consoleErrors.length === 0,
    consoleErrors.slice(0, 3).join(" | "));
} finally {
  await browser.close().catch(() => {});
  if (server) server.kill();
}

const required = results.filter((r) => r.required);
const failed = required.filter((r) => !r.ok);
const report = {
  url,
  when: new Date().toISOString(),
  passed: required.length - failed.length,
  total: required.length,
  results,
  consoleErrors,
};
writeFileSync(join(outDir, "verification.json"), JSON.stringify(report, null, 2));
console.log(`\n${report.passed}/${report.total} required checks passed. Report: ${join(outDir, "verification.json")}`);
process.exit(failed.length ? 1 : 0);
