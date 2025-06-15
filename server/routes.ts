import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCarSchema, insertSalesMetricsSchema, insertSalesStatisticsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Cars routes
  app.get("/api/cars", async (req, res) => {
    try {
      const cars = await storage.getAllCars();
      res.json(cars);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cars" });
    }
  });

  app.get("/api/cars/available", async (req, res) => {
    try {
      const cars = await storage.getAvailableCars();
      res.json(cars);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch available cars" });
    }
  });

  app.get("/api/cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const car = await storage.getCar(id);
      if (!car) {
        return res.status(404).json({ error: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch car" });
    }
  });

  app.post("/api/cars", async (req, res) => {
    try {
      const result = insertCarSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid car data", details: result.error });
      }
      const car = await storage.createCar(result.data);
      res.status(201).json(car);
    } catch (error) {
      res.status(500).json({ error: "Failed to create car" });
    }
  });

  app.put("/api/cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertCarSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid car data", details: result.error });
      }
      const car = await storage.updateCar(id, result.data);
      if (!car) {
        return res.status(404).json({ error: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      res.status(500).json({ error: "Failed to update car" });
    }
  });

  app.delete("/api/cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCar(id);
      if (!success) {
        return res.status(404).json({ error: "Car not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete car" });
    }
  });

  // Sales metrics routes
  app.get("/api/sales-metrics", async (req, res) => {
    try {
      const metrics = await storage.getCurrentSalesMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales metrics" });
    }
  });

  app.post("/api/sales-metrics", async (req, res) => {
    try {
      const result = insertSalesMetricsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid metrics data", details: result.error });
      }
      const metrics = await storage.createSalesMetrics(result.data);
      res.status(201).json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to create sales metrics" });
    }
  });

  // Sales statistics routes
  app.get("/api/sales-statistics", async (req, res) => {
    try {
      const statistics = await storage.getAllSalesStatistics();
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales statistics" });
    }
  });

  app.post("/api/sales-statistics", async (req, res) => {
    try {
      const result = insertSalesStatisticsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid statistics data", details: result.error });
      }
      const statistics = await storage.createSalesStatistics(result.data);
      res.status(201).json(statistics);
    } catch (error) {
      res.status(500).json({ error: "Failed to create sales statistics" });
    }
  });

  // User routes
  app.get("/api/user", async (req, res) => {
    try {
      // Return default admin user for demo
      const user = await storage.getUserByUsername("admin");
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
