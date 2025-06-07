// ---
// BEST PRACTICE NOTE:
// - setupVite(app, server): Used only in development. Injects Vite dev middleware so you can use Express (port 5000) for both API and frontend if desired.
//   (But you can also use Vite's own dev server on port 5173 for HMR and fast refresh.)
// - serveStatic(app): Used only in production. Serves the built frontend from client/dist.
//
// This ensures a clean separation between dev and prod, and works on Replit and locally.
// ---

import express, { type Express } from "express";
import * as fs from "fs";
import * as path from "path";

// --- PRODUCTION ONLY ---
export function serveStatic(app: Express) {
  // Serve static files from client/dist (adjust if your build output is elsewhere)
  const distPath = path.join(process.cwd(), "../client", "dist");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}. Ensure the client is built and the 'dist' directory exists in the correct location.`,
    );
  }
  app.use(express.static(distPath));
  // SPA fallback: always serve index.html for any route not handled by API
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

export function log(message: string) {
  console.log(`[Production Log] ${message}`);
}

// --- DEVELOPMENT ONLY ---
export async function setupVite(app: Express, server: any) {
  // Only import vite when this function is called (development only)
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true, hmr: { server } },
    appType: "custom",
  });
  app.use(vite.middlewares);
  console.log("Vite development server middleware added.");
}

export function devLog(message: string) {
  console.log(`[Development Log] ${message}`);
}
