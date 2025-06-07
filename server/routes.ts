import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { recommendationService } from "./services/recommendation-service.js";
import { z } from "zod";
import axios from 'axios';
import { log } from "./vite.js";
import { getUserSettingsService } from './services/userSettingsService.js';
import { UserSettingsSchema } from '../shared/schema.js';
import { getDb } from './db.js';

log("routes.ts module FIRST LINE EXECUTES", "routes-init");

// reCAPTCHA verification helper
interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string; // Timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
  hostname?: string;     // The hostname of the site where the reCAPTCHA was solved
  'error-codes'?: string[]; // Optional error codes
  score?: number; // For reCAPTCHA v3
}

async function verifyRecaptcha(token: string): Promise<{ success: boolean; errorCodes?: string[]; message?: string }> {
  log("verifyRecaptcha: invoked. Token (first 20 chars): " + (token ? token.substring(0, 20) : "null/undefined"), "routes");
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey || secretKey.trim() === "") {
    log("verifyRecaptcha: RECAPTCHA_SECRET_KEY is NOT SET or is EMPTY.", "routes");
    return { success: false, message: "reCAPTCHA secret key not configured on server." };
  }
  // Log more details about the key to catch potential whitespace or loading issues
  log("verifyRecaptcha: RECAPTCHA_SECRET_KEY loaded (length " + secretKey.length + "): '" + secretKey.substring(0, 5) + "..." + secretKey.slice(-5) + "'", "routes");

  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;
  const params = new URLSearchParams();
  params.append('secret', secretKey);
  params.append('response', token);

  log("verifyRecaptcha: Preparing to send request to Google: " + verificationUrl, "routes");

  try {
    log("verifyRecaptcha: >>> Attempting axios.post to Google...", "routes");
    const response = await axios.post(verificationUrl, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 10000 // Add a timeout of 10 seconds
    });
    log("verifyRecaptcha: <<< axios.post to Google completed. Status: " + response.status, "routes");
    const { data } = response;
    log("verifyRecaptcha: Google response data RAW: " + JSON.stringify(data), "routes"); // This is the crucial log

    if (data.success) {
      log("verifyRecaptcha: Google response SUCCESS.", "routes");
      return { success: true };
    } else {
      log("verifyRecaptcha: Google response FAILURE. Error codes: " + (data["error-codes"] ? data["error-codes"].join(", ") : "NOT PROVIDED BY GOOGLE"), "routes");
      let userMessage = "reCAPTCHA verification failed.";
      if (data["error-codes"]) {
        if (data["error-codes"].includes("missing-input-secret")) {
          userMessage = "The secret parameter is missing. Please contact support (Server config issue).";
        } else if (data["error-codes"].includes("invalid-input-secret")) {
          userMessage = "The secret parameter is invalid or malformed. Please contact support (Server config issue - check secret key).";
        } else if (data["error-codes"].includes("missing-input-response")) {
          userMessage = "The reCAPTCHA response token is missing. Please try again (Client-side issue or token lost).";
        } else if (data["error-codes"].includes("invalid-input-response")) {
          userMessage = "The reCAPTCHA response token is invalid or malformed. Please try again (Token might be expired or corrupted).";
        } else if (data["error-codes"].includes("bad-request")) {
          userMessage = "The request to Google was invalid or malformed. Please contact support.";
        } else if (data["error-codes"].includes("timeout-or-duplicate")) {
          userMessage = "The reCAPTCHA response has timed out or already been used. Please refresh and try again.";
        } else {
          userMessage = "reCAPTCHA verification failed with error(s): " + data["error-codes"].join(", ") + ".";
        }
      }
      return { success: false, errorCodes: data["error-codes"], message: userMessage };
    }
  } catch (error) {
    log("verifyRecaptcha: !!! Exception during axios.post or response processing !!!", "routes");
    if (axios.isAxiosError(error)) {
      log("verifyRecaptcha: AxiosError: " + error.message, "routes");
      if (error.response) {
        log("verifyRecaptcha: AxiosError response status: " + error.response.status, "routes");
        log("verifyRecaptcha: AxiosError response data: " + JSON.stringify(error.response.data), "routes");
      } else if (error.request) {
        log("verifyRecaptcha: AxiosError: No response received, request was made. " + error.request, "routes");
      } else {
        log("verifyRecaptcha: AxiosError: Error setting up request: " + error.message, "routes");
      }
      if (error.code === 'ECONNABORTED') {
        log("verifyRecaptcha: AxiosError: Request timed out.", "routes");
        return { success: false, message: "Verification request timed out. Please try again." };
      }
    } else {
      log("verifyRecaptcha: Non-Axios Exception: " + (error instanceof Error ? error.message : String(error)), "routes");
    }
    return { success: false, message: "An error occurred while verifying reCAPTCHA. Please try again." };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for user management
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      console.log('Creating user with data:', userData);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        console.log('User already exists:', existingUser);
        return res.json(existingUser);
      }

      // Create new user if doesn't exist
      const user = await storage.createUser(userData);
      console.log('Created new user:', user);
      res.json(user);
    } catch (error) {
      console.error('Error creating user:', {
        error,
        stack: (error instanceof Error) ? error.stack : undefined,
        body: req.body
      });
      res.status(500).json({ 
        message: 'Failed to create user',
        error: (error instanceof Error) ? error.message : String(error),
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      });
    }
  });

  // PATCH endpoint to update user preferences
  app.patch("/api/users/:id/preferences", async (req, res) => {
    try {
      const { dark_mode, language, email, name, photo_url } = req.body;
      let updated = await storage.updateUserPreferences(req.params.id, { dark_mode, language });
      if (!updated) {
        // Upsert: create user if missing, then update preferences
        if (!email || !name) {
          return res.status(400).json({ message: "Missing email or name for user creation" });
        }
        // Check if a user with this email already exists
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          // Update that user's id to the current id (merge accounts)
          await storage.updateUserId(existingUser.id, req.params.id);
        } else {
          // Create new user
          await storage.createUser({
            id: req.params.id,
            email,
            name,
            photo_url: photo_url ?? null,
          });
        }
        updated = await storage.updateUserPreferences(req.params.id, { dark_mode, language });
        if (!updated) {
          // Fallback: fetch and log user by id
          const userById = await storage.getUser(req.params.id);
          console.error('[PATCH /api/users/:id/preferences] Failed to upsert user preferences', {
            id: req.params.id,
            email,
            name,
            photo_url,
            dark_mode,
            language,
            userById
          });
          return res.status(500).json({ message: "Failed to upsert user preferences" });
        }
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // DELETE endpoint for user account
  app.delete("/api/users/:id/account", async (req, res) => {
    try {
      const userId = req.params.id;
      await storage.deleteUserAccount(userId);
      res.status(200).json({ message: "User account deleted successfully" });
    } catch (error: any) {
      console.error(`Error in DELETE /api/users/${req.params.id}/account:`, error);
      res.status(500).json({ message: error.message || "Failed to delete user account" });
    }
  });

  // API routes for chat conversations
  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.params.userId);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      console.log('Creating conversation with data:', req.body);
      const conversation = await storage.createConversation(req.body);
      console.log('Created conversation:', conversation);
      res.status(201).json(conversation);
    } catch (error: any) {
      console.error('Error creating conversation:', {
        error,
        stack: error.stack,
        body: req.body
      });
      res.status(500).json({ 
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  app.put("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.updateConversation(req.params.id, req.body);
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      await storage.deleteConversation(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API routes for chat messages
  app.get("/api/messages/:conversationId", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      if (!req.body || !req.body.content) {
        return res.status(400).json({
          error: 'INVALID_REQUEST',
          message: 'Message content is required'
        });
      }

      // Validate model response
      if (req.body.role === 'model' && (!req.body.content || req.body.content.trim() === '')) {
        return res.status(422).json({
          error: 'INVALID_MODEL_RESPONSE',
          message: 'Model response cannot be empty'
        });
      }

      const message = await storage.createMessage(req.body);

      if (!message) {
        return res.status(500).json({
          error: 'MESSAGE_CREATION_FAILED',
          message: 'Failed to create message in database'
        });
      }

      res.status(201).json(message);
    } catch (error: any) {
      res.status(500).json({
        error: 'SERVER_ERROR',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // API routes for analysis results
  app.get("/api/analysis", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const type = req.query.type as string | undefined;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const results = await storage.getAnalysisResults(userId, type);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/analysis", async (req, res) => {
    try {
      const result = await storage.createAnalysisResult(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/analysis/:id", async (req, res) => {
    try {
      await storage.deleteAnalysisResult(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error in DELETE /api/analysis/:id:", error);
      res.status(500).json({ message: error.message || "Failed to delete analysis result" });
    }
  });

  // API routes for recommendations
  app.get("/api/recommendations/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const recommendations = await recommendationService.getUserRecommendations(userId);
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/recommendations/set/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const recommendationSet = await recommendationService.getRecommendationSet(id);

      if (!recommendationSet) {
        return res.status(404).json({ message: "Recommendation set not found" });
      }

      res.json(recommendationSet);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate new recommendations
  const generateRecommendationsSchema = z.object({
    userId: z.string(),
    currentSeason: z.enum(['spring', 'summer', 'fall', 'winter']).optional()
  });

  app.post("/api/recommendations/generate", async (req, res) => {
    try {
      const validationResult = generateRecommendationsSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          details: validationResult.error.format() 
        });
      }

      const recommendations = await recommendationService.generateRecommendations(validationResult.data);
      res.status(201).json(recommendations);
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      const message = error.code === 'XX000' ? 
        'Database connection error - please try again later' : 
        error.message || 'Failed to generate recommendations';
      res.status(500).json({ message });
    }
  });

  app.delete("/api/recommendations/:id", async (req, res) => {
    try {
      await recommendationService.deleteRecommendationSet(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password, recaptchaToken } = req.body;
    if (!email || !password || !recaptchaToken) {
      return res.status(400).json({ message: 'Email, password, and reCAPTCHA token are required.' });
    }
    try {
      const recaptchaResult = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaResult.success) {
        return res.status(403).json({ message: recaptchaResult.message || 'reCAPTCHA verification failed.' });
      }
      // Authenticate user using Firebase Auth REST API
      const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY;
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`;
      const firebaseRes = await axios.post(url, {
        email,
        password,
        returnSecureToken: true
      });
      const { idToken, localId, email: userEmail, displayName } = firebaseRes.data;
      // Optionally, upsert user in MongoDB here
      res.json({ success: true, idToken, user: { id: localId, email: userEmail, name: displayName } });
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        return res.status(401).json({ message: error.response.data.error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    console.log('[0] SERVER LOG: /api/auth/register route HIT. Request body (keys):', Object.keys(req.body));
    const { name, email, password, recaptchaToken } = req.body;
    if (!name || !email || !password || !recaptchaToken) {
      console.log('[0] SERVER LOG: /api/auth/register - Missing fields. Responding 400.');
      return res.status(400).json({ message: 'Name, email, password, and reCAPTCHA token are required.' });
    }
    try {
      console.log('[0] SERVER LOG: /api/auth/register - Calling verifyRecaptcha.');
      const recaptchaResult = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaResult.success) {
        console.log('[0] SERVER LOG: /api/auth/register - verifyRecaptcha FAILED. Message:', recaptchaResult.message);
        return res.status(403).json({ message: recaptchaResult.message || 'reCAPTCHA verification failed.' });
      }
      console.log('[0] SERVER LOG: /api/auth/register - verifyRecaptcha SUCCESS. Proceeding to Firebase.');
      // Register user using Firebase Auth REST API
      const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY;
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseApiKey}`;
      const firebaseRes = await axios.post(url, {
        email,
        password,
        returnSecureToken: true
      });
      const { idToken, localId, email: userEmail } = firebaseRes.data;
      // Optionally, upsert user in MongoDB here
      // Set displayName
      await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${firebaseApiKey}`, {
        idToken,
        displayName: name,
        returnSecureToken: false
      });
      res.json({ success: true, idToken, user: { id: localId, email: userEmail, name } });
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        return res.status(401).json({ message: error.response.data.error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  });

  // User Settings Endpoints
  app.get('/api/user/settings', async (req, res) => {
    if (!req.session.user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    try {
      const settingsService = await getUserSettingsService();
      const settings = await settingsService.getByUserId(req.session.user.id);
      if (!settings) {
        // If no settings found, return defaults (or create them as getByUserId now does)
        const defaultSettings = await settingsService.createUserDefaultSettings(req.session.user.id);
        return res.send(defaultSettings);
      }
      res.send(settings);
    } catch (error) {
      console.error('Error fetching user settings:', error);
      res.status(500).send({ error: 'Failed to fetch user settings' });
    }
  });

  app.put('/api/user/settings', async (req, res) => {
    if (!req.session.user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    try {
      const settingsData = UserSettingsSchema.pick({ theme: true, language: true }).partial().parse(req.body);
      const settingsService = await getUserSettingsService();
      const updatedSettings = await settingsService.upsert(req.session.user.id, settingsData);
      res.send(updatedSettings);
    } catch (error) {
      console.error('Error updating user settings:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).send({ error: 'Invalid settings data', details: error.errors });
      }
      res.status(500).send({ error: 'Failed to update user settings' });
    }
  });

  // Health check endpoint for DB readiness
  app.get('/api/health', async (req, res) => {
    try {
      await getDb().command({ ping: 1 });
      res.status(200).json({ status: 'ok' });
    } catch (e) {
      res.status(500).json({ status: 'error', message: 'DB not ready' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}