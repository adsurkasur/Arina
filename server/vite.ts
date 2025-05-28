import express, { type Express } from "express";
import * as fs from "fs";
import * as path from "path";
import { createServer as createViteServer } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

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
    configFile: path.join(__dirname, '../../client/vite.config.ts'), // robust relative path for monorepo
    customLogger: viteLogger,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.join(__dirname, '../../client/index.html');

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  // Serve the correct production build directory from the project root
  const distPath = path.join(__dirname, '../../client/dist/public');

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}. Ensure the client is built and the 'public' directory exists in the correct location.`,
    );
  }

  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
  });
}
