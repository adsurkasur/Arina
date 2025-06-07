import * as dotenv from "dotenv";
dotenv.config(); // Ensures .env variables are loaded

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { migrate } from './migrations.js';

// Add logging for startup
console.log("[Server] Loading environment and dependencies...");

async function main() {
  console.log("[Server] Running migrations...");
  try {
    await migrate();
    console.log("[Server] Migrations completed.");
  } catch (err) {
    console.error("[Server] Migration error:", err);
  }

  const app = express();
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Logging middleware
  let appLog: (message: string) => void;

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        appLog(logLine); // Use the conditionally assigned log function
      }
    });
    next();
  });

  console.log("[Server] Registering routes...");
  const server = await registerRoutes(app);
  console.log("[Server] Routes registered.");

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("[Server] Error middleware:", err);
    res.status(status).json({ message });
    throw err;
  });

  // Conditional import for Vite-related functions
  if (process.env.NODE_ENV === "development") {
    console.log("[Server] Setting up Vite for development...");
    const { setupVite, devLog } = await import("./vite.js");
    appLog = devLog;
    await setupVite(app, server);
    console.log("[Server] Vite setup complete.");
  } else {
    const { serveStatic, log } = await import("./vite.js");
    appLog = log;
    console.log("[Server] Serving static files for production...");
    serveStatic(app);
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
  console.log(`[Server] Starting server on port ${port}...`);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: process.platform === "win32" ? false : true,
  }, () => {
    appLog(`serving on port ${port}`);
    console.log(`[Server] Server is listening on http://localhost:${port}`);
  });
  server.on("error", (err) => {
    console.error("[Server] Server error:", err);
  });
}

main();

// ---
// BEST PRACTICE NOTE:
// In development, use Vite dev server (port 5173) for the frontend and Express (port 5000) for the API.
// In production, Express serves the built frontend from client/dist/public on port 5000.
//
// On Replit:
//   - For development, expose port 5173 for the frontend (Vite) and port 5000 for the API (Express).
//   - For production, run the client build and expose port 5000 only.
//
// This setup works for both local and Replit deployments.
// ---
// Remove all top-level code, only export functions and types from this file
