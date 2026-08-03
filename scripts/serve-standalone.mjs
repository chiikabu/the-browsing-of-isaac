import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";

const html = resolve(process.argv[2] || "output/isaac-repentance-standalone.html");
const port = Number(process.env.PORT || 8765);
const info = await stat(html);

const server = createServer((request, response) => {
  const pathname = new URL(request.url || "/", "http://127.0.0.1").pathname;
  if (pathname !== "/" && pathname !== "/isaac-repentance-standalone.html") {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "Content-Length": info.size,
    "Content-Type": "text/html; charset=utf-8",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
  });
  createReadStream(html).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Standalone Isaac: http://127.0.0.1:${port}/`);
});
