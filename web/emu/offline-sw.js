const RELEASE_ID = "__ISAAC_RELEASE_ID__";
const CACHE_PREFIX = "isaac-offline-";
const CACHE_NAME = CACHE_PREFIX + RELEASE_ID;

async function fetchVerified(asset) {
  const request = new Request(asset.path, {
    cache: "no-store",
    credentials: "same-origin",
    integrity: asset.integrity,
  });
  const response = await fetch(request);
  if (!response.ok || response.type === "opaque" || response.redirected) {
    throw new Error(`Offline asset ${asset.path} returned HTTP ${response.status}`);
  }
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 0 && contentLength !== asset.bytes) {
    throw new Error(`Offline asset ${asset.path} has ${contentLength} bytes; expected ${asset.bytes}`);
  }
  return response;
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const inventoryResponse = await fetch(new Request("./offline-assets.json", { cache: "no-store" }));
    if (!inventoryResponse.ok) throw new Error("Offline asset inventory is unavailable");
    const inventory = await inventoryResponse.clone().json();
    if (inventory.releaseId !== RELEASE_ID) throw new Error("Offline asset inventory release mismatch");

    const cache = await caches.open(CACHE_NAME);
    await cache.put("./offline-assets.json", inventoryResponse);
    for (const asset of inventory.shellAssets) {
      await cache.put(asset.path, await fetchVerified(asset));
    }
    if (!self.registration.active) await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

let allowlistPromise;
async function releaseAllowlist() {
  if (!allowlistPromise) {
    allowlistPromise = (async () => {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match("./offline-assets.json");
      if (!response) return new Set();
      const inventory = await response.json();
      if (inventory.releaseId !== RELEASE_ID) return new Set();
      return new Set([
        ...inventory.shellAssets.map(asset => new URL(asset.path, self.registration.scope).href),
        ...inventory.runtimeAssets.map(asset => new URL(asset.path, self.registration.scope).href),
        new URL("./offline-assets.json", self.registration.scope).href,
      ]);
    })();
  }
  return allowlistPromise;
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const navigation = event.request.mode === "navigate";
    const allowed = await releaseAllowlist();
    if (!navigation && !allowed.has(requestUrl.href)) return fetch(event.request);
    const cached = navigation
      ? await cache.match("./index.html")
      : await cache.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    return fetch(event.request);
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "GET_RELEASE_ID" && event.ports[0]) {
    event.ports[0].postMessage({ releaseId: RELEASE_ID });
  }
});
