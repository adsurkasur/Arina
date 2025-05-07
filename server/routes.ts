import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { recommendationService } from "./services/recommendation-service";
import { z } from "zod";

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
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
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
      const conversation = await storage.createConversation(req.body);
      res.status(201).json(conversation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
      const message = await storage.createMessage(req.body);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API routes for analysis results
  app.get("/api/analysis/:userId", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const results = await storage.getAnalysisResults(req.params.userId, type);
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
      res.status(500).json({ message: error.message });
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
      res.status(500).json({ message: error.message });
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

  const httpServer = createServer(app);

  return httpServer;
}
