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
import { createServer as createViteServer } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

// Use __dirname to always resolve from the server/ directory, then go up one level to the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const viteLogger = {
  ...console,
  error: (msg: string, options?: any) => {
    console.error(msg, options);
    process.exit(1);
  },
  warnOnce: () => {},
  clearScreen: () => {},
  hasErrorLogged: (_err: any) => false,
  hasWarned: false,
};

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as true,
  };

  const vite = await createViteServer({
    configFile: path.join(projectRoot, 'client/vite.config.ts'),
    customLogger: viteLogger,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use(/.*/, async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Use projectRoot to resolve the client index.html robustly for all environments
      const clientTemplate = path.join(projectRoot, 'client', 'index.html');

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Use process.cwd() as the project root for static serving
  const distPath = path.join(process.cwd(), 'client', 'dist');

  const staticMiddleware = express.static(distPath);

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}. Ensure the client is built and the 'dist' directory exists in the correct location.`,
    );
  }

  app.use(staticMiddleware);
  app.use(/.*/, (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
  });
}
