import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { recommendationService } from "./services/recommendation-service.js";
import { z } from "zod";
import axios from 'axios';

// reCAPTCHA verification helper
async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) throw new Error('reCAPTCHA secret key not set');
  const url = 'https://www.google.com/recaptcha/api/siteverify';
  const params = new URLSearchParams();
  params.append('secret', secret);
  params.append('response', token);
  const res = await axios.post(url, params);
  console.log('reCAPTCHA response:', res.data); // Log for debugging
  return res.data.success && (res.data.score === undefined || res.data.score > 0.1);
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
      return res.status(400).json({ message: 'Missing fields' });
    }
    try {
      const valid = await verifyRecaptcha(recaptchaToken);
      if (!valid) return res.status(403).json({ message: 'reCAPTCHA failed' });
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
    const { name, email, password, recaptchaToken } = req.body;
    if (!name || !email || !password || !recaptchaToken) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    try {
      const valid = await verifyRecaptcha(recaptchaToken);
      if (!valid) return res.status(403).json({ message: 'reCAPTCHA failed' });
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

  const httpServer = createServer(app);

  return httpServer;
}