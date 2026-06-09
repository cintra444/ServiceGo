import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "dist");
const port = Number(process.env.PORT || 8080);
const apiUrl = process.env.API_URL || process.env.VITE_API_URL || "";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function resolveStaticPath(pathname) {
  const cleanPath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = join(root, cleanPath);

  if (existsSync(requestedPath) && statSync(requestedPath).isFile()) {
    return requestedPath;
  }

  return join(root, "index.html");
}

createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (requestUrl.pathname === "/healthz") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (requestUrl.pathname === "/config.js") {
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": "text/javascript; charset=utf-8",
    });
    response.end(`window.__SERVICEGO_CONFIG__ = ${JSON.stringify({ API_URL: apiUrl })};`);
    return;
  }

  const filePath = resolveStaticPath(requestUrl.pathname);
  const extension = extname(filePath);

  response.writeHead(200, {
    "Content-Type": contentTypes[extension] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(`ServiceGOWeb listening on port ${port}`);
});
