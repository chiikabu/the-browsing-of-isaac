(() => {
  "use strict";

  const RELEASE_ID = "__ISAAC_RELEASE_ID__";
  const CACHE_NAME = "isaac-offline-" + RELEASE_ID;
  const READY_MARKER = `./offline-ready-${RELEASE_ID}.json`;
  const status = document.getElementById("status");
  const progress = document.getElementById("progress");

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function formatBytes(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
  }

  async function loadClassicScript(path) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = path;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${path}`));
      document.body.appendChild(script);
    });
  }

  async function fetchInventory() {
    const response = await fetch("./offline-assets.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Offline inventory returned HTTP ${response.status}`);
    const inventory = await response.json();
    if (inventory.releaseId !== RELEASE_ID) throw new Error("Offline inventory release mismatch");
    return inventory;
  }

  async function controllerReleaseId() {
    const controller = navigator.serviceWorker.controller;
    if (!controller) return null;
    return await new Promise(resolve => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => resolve(null), 3000);
      channel.port1.onmessage = event => {
        clearTimeout(timer);
        resolve(event.data?.releaseId || null);
      };
      controller.postMessage({ type: "GET_RELEASE_ID" }, [channel.port2]);
    });
  }

  async function cacheRuntime(inventory) {
    const cache = await caches.open(CACHE_NAME);
    if (await cache.match(READY_MARKER)) return;

    const missing = [];
    for (const asset of inventory.runtimeAssets) {
      if (!await cache.match(asset.path, { ignoreSearch: true })) missing.push(asset);
    }
    const missingBytes = missing.reduce((total, asset) => total + asset.bytes, 0);
    if (navigator.storage?.estimate && missingBytes > 0) {
      const estimate = await navigator.storage.estimate();
      const free = Math.max(0, (estimate.quota || 0) - (estimate.usage || 0));
      if (estimate.quota && free < missingBytes * 1.05) {
        throw new Error(`Offline install needs ${formatBytes(missingBytes)}; browser storage has ${formatBytes(free)} free`);
      }
    }

    let completedBytes = inventory.runtimeAssets
      .filter(asset => !missing.includes(asset))
      .reduce((total, asset) => total + asset.bytes, 0);
    const totalBytes = inventory.runtimeAssets.reduce((total, asset) => total + asset.bytes, 0);
    if (progress) {
      progress.style.display = "block";
      progress.max = totalBytes;
      progress.value = completedBytes;
    }

    for (const asset of missing) {
      setStatus(`Installing offline data: ${asset.path} (${formatBytes(completedBytes)} / ${formatBytes(totalBytes)})`);
      const request = new Request(asset.path, {
        cache: "no-store",
        credentials: "same-origin",
        integrity: asset.integrity,
      });
      const response = await fetch(request);
      if (!response.ok || response.type === "opaque" || response.redirected) {
        throw new Error(`${asset.path} returned an invalid HTTP response`);
      }
      const contentLength = Number(response.headers.get("content-length"));
      if (Number.isFinite(contentLength) && contentLength > 0 && contentLength !== asset.bytes) {
        throw new Error(`${asset.path} has ${contentLength} bytes; expected ${asset.bytes}`);
      }
      await cache.put(asset.path, response);
      completedBytes += asset.bytes;
      if (progress) progress.value = completedBytes;
    }

    for (const asset of inventory.runtimeAssets) {
      if (!await cache.match(asset.path, { ignoreSearch: true })) {
        throw new Error(`${asset.path} was not readable after caching`);
      }
    }

    await cache.put(READY_MARKER, new Response(JSON.stringify({ releaseId: RELEASE_ID }), {
      headers: { "content-type": "application/json" },
    }));
  }

  async function start() {
    if (!globalThis.isSecureContext || !("serviceWorker" in navigator) || !("caches" in globalThis)) {
      throw new Error("Offline installation requires Chrome on an HTTPS or localhost origin");
    }

    setStatus("Preparing offline installation…");
    const registration = await navigator.serviceWorker.register("./offline-sw.js", { scope: "./" });
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise(resolve => {
        const timer = setTimeout(resolve, 5000);
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          clearTimeout(timer);
          resolve();
        }, { once: true });
      });
    }
    const controlledRelease = await controllerReleaseId();
    if (controlledRelease && controlledRelease !== RELEASE_ID) {
      throw new Error("An older offline release is still active; close its tabs and reopen this page to update");
    }

    let persistent = false;
    if (navigator.storage?.persist) {
      try {
        persistent = await navigator.storage.persist();
      } catch (error) {
        console.warn("Persistent storage request failed", error);
      }
    }

    const inventory = await fetchInventory();
    await cacheRuntime(inventory);
    setStatus(persistent
      ? "Offline data ready. Starting game…"
      : "Offline data ready. Starting game (browser may reclaim storage)…");
    if (progress) progress.style.display = "none";

    await loadClassicScript("./boxedwine-shell.js");
    await loadClassicScript("./boxedwine.js");
    void registration;
  }

  start().catch(error => {
    console.error("Offline bootstrap failed", error);
    setStatus(`Offline setup failed: ${error.message}`);
    if (progress) progress.style.display = "none";
  });
})();
