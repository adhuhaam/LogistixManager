import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertVehicleSchema,
  insertDriverSchema,
  insertVehicleAssignmentSchema,
  insertMaintenanceRecordSchema,
  insertFuelRecordSchema,
  insertSystemSettingsSchema,
  loginSchema,
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import session from "express-session";

// Extend session types
declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: string;
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Simple session-based authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Role-based authorization middleware
const requireRole = (allowedRoles: string[]) => {
  return async (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    req.user = user;
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(
    session({
      secret: "focar-vehicle-management-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
    }),
  );

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({
            error: "Invalid login data",
            details: fromZodError(result.error),
          });
      }

      const user = await storage.authenticateUser(
        result.data.username,
        result.data.password,
      );
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // User management routes (super admin only)
  app.get("/api/users", requireRole(["super_admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(
        users.map((u) => ({
          id: u.id,
          username: u.username,
          name: u.name,
          email: u.email,
          role: u.role,
        })),
      );
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireRole(["super_admin"]), async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({
            error: "Invalid user data",
            details: fromZodError(result.error),
          });
      }
      const user = await storage.createUser(result.data);
      res.status(201).json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", requireRole(["super_admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertUserSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({
            error: "Invalid user data",
            details: fromZodError(result.error),
          });
      }
      const user = await storage.updateUser(id, result.data);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete(
    "/api/users/:id",
    requireRole(["super_admin"]),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const users = await storage.getAllUsers();
        const userToDelete = users.find((u) => u.id === id);

        if (!userToDelete) {
          return res.status(404).json({ error: "User not found" });
        }

        // Prevent deleting the last super admin
        if (userToDelete.role === "super_admin") {
          const superAdmins = users.filter((u) => u.role === "super_admin");
          if (superAdmins.length <= 1) {
            return res
              .status(400)
              .json({ error: "Cannot delete the last super admin" });
          }
        }

        // In a real implementation, you'd have a deleteUser method
        // For now, we'll update the user to inactive status
        await storage.updateUser(id, { role: "inactive" });
        res.json({ message: "User deactivated successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
      }
    },
  );

  // Vehicle routes
  app.get("/api/vehicles", requireAuth, async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/available", requireAuth, async (req, res) => {
    try {
      const vehicles = await storage.getAvailableVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch available vehicles" });
    }
  });

  app.get("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  app.post(
    "/api/vehicles",
    requireRole(["super_admin", "admin"]),
    async (req, res) => {
      try {
        const result = insertVehicleSchema.safeParse(req.body);
        if (!result.success) {
          return res
            .status(400)
            .json({
              error: "Invalid vehicle data",
              details: fromZodError(result.error),
            });
        }
        const vehicle = await storage.createVehicle(result.data);
        res.status(201).json(vehicle);
      } catch (error) {
        res.status(500).json({ error: "Failed to create vehicle" });
      }
    },
  );

  app.put(
    "/api/vehicles/:id",
    requireRole(["super_admin", "admin", "user"]),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const result = insertVehicleSchema.partial().safeParse(req.body);
        if (!result.success) {
          return res
            .status(400)
            .json({
              error: "Invalid vehicle data",
              details: fromZodError(result.error),
            });
        }
        const vehicle = await storage.updateVehicle(id, result.data);
        if (!vehicle) {
          return res.status(404).json({ error: "Vehicle not found" });
        }
        res.json(vehicle);
      } catch (error) {
        res.status(500).json({ error: "Failed to update vehicle" });
      }
    },
  );

  app.delete(
    "/api/vehicles/:id",
    requireRole(["super_admin"]),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const success = await storage.deleteVehicle(id);
        if (!success) {
          return res.status(404).json({ error: "Vehicle not found" });
        }
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: "Failed to delete vehicle" });
      }
    },
  );

  // Driver routes
  app.get("/api/drivers", requireAuth, async (req, res) => {
    try {
      const drivers = await storage.getAllDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch drivers" });
    }
  });

  app.get("/api/drivers/available", requireAuth, async (req, res) => {
    try {
      const drivers = await storage.getAvailableDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch available drivers" });
    }
  });

  app.get("/api/drivers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const driver = await storage.getDriver(id);
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch driver" });
    }
  });

  app.post(
    "/api/drivers",
    requireRole(["super_admin", "admin"]),
    async (req, res) => {
      try {
        const result = insertDriverSchema.safeParse(req.body);
        if (!result.success) {
          return res
            .status(400)
            .json({
              error: "Invalid driver data",
              details: fromZodError(result.error),
            });
        }
        const driver = await storage.createDriver(result.data);
        res.status(201).json(driver);
      } catch (error) {
        res.status(500).json({ error: "Failed to create driver" });
      }
    },
  );

  app.put(
    "/api/drivers/:id",
    requireRole(["super_admin", "admin", "user"]),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const result = insertDriverSchema.partial().safeParse(req.body);
        if (!result.success) {
          return res
            .status(400)
            .json({
              error: "Invalid driver data",
              details: fromZodError(result.error),
            });
        }
        const driver = await storage.updateDriver(id, result.data);
        if (!driver) {
          return res.status(404).json({ error: "Driver not found" });
        }
        res.json(driver);
      } catch (error) {
        res.status(500).json({ error: "Failed to update driver" });
      }
    },
  );

  app.delete(
    "/api/drivers/:id",
    requireRole(["super_admin"]),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const success = await storage.deleteDriver(id);
        if (!success) {
          return res.status(404).json({ error: "Driver not found" });
        }
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: "Failed to delete driver" });
      }
    },
  );

  // Vehicle assignment routes
  app.get("/api/assignments", requireAuth, async (req, res) => {
    try {
      const assignments =
        req.query.active === "true"
          ? await storage.getActiveAssignments()
          : await storage.getVehicleAssignments();
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  app.post(
    "/api/assignments",
    requireRole(["super_admin", "admin"]),
    async (req, res) => {
      try {
        const result = insertVehicleAssignmentSchema.safeParse(req.body);
        if (!result.success) {
          return res
            .status(400)
            .json({
              error: "Invalid assignment data",
              details: fromZodError(result.error),
            });
        }
        const assignment = await storage.assignVehicleToDriver(result.data);
        res.status(201).json(assignment);
      } catch (error) {
        res.status(500).json({ error: "Failed to create assignment" });
      }
    },
  );

  app.delete(
    "/api/assignments/vehicle/:vehicleId",
    requireRole(["super_admin", "admin"]),
    async (req, res) => {
      try {
        const vehicleId = parseInt(req.params.vehicleId);
        const reason = req.body.reason || "Unassigned by admin";
        const success = await storage.unassignVehicle(vehicleId, reason);
        if (!success) {
          return res.status(404).json({ error: "Assignment not found" });
        }
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: "Failed to unassign vehicle" });
      }
    },
  );

  // Maintenance records routes
  app.get("/api/maintenance", requireAuth, async (req, res) => {
    try {
      const vehicleId = req.query.vehicleId
        ? parseInt(req.query.vehicleId as string)
        : undefined;
      const records = await storage.getMaintenanceRecords(vehicleId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch maintenance records" });
    }
  });

  app.post("/api/maintenance", requireAuth, async (req, res) => {
    try {
      const result = insertMaintenanceRecordSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({
            error: "Invalid maintenance data",
            details: fromZodError(result.error),
          });
      }
      const record = await storage.addMaintenanceRecord(result.data);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: "Failed to create maintenance record" });
    }
  });

  // Fuel records routes
  app.get("/api/fuel", requireAuth, async (req, res) => {
    try {
      const vehicleId = req.query.vehicleId
        ? parseInt(req.query.vehicleId as string)
        : undefined;
      const records = await storage.getFuelRecords(vehicleId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fuel records" });
    }
  });

  app.post("/api/fuel", requireAuth, async (req, res) => {
    try {
      const result = insertFuelRecordSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({
            error: "Invalid fuel data",
            details: fromZodError(result.error),
          });
      }
      const record = await storage.addFuelRecord(result.data);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: "Failed to create fuel record" });
    }
  });

  // System settings routes (Super Admin only)
  app.get("/api/settings", requireRole(["super_admin"]), async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get(
    "/api/settings/:key",
    requireRole(["super_admin"]),
    async (req, res) => {
      try {
        const setting = await storage.getSystemSetting(req.params.key);
        if (!setting) {
          return res.status(404).json({ error: "Setting not found" });
        }
        res.json(setting);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch setting" });
      }
    },
  );

  app.put(
    "/api/settings/:key",
    requireRole(["super_admin"]),
    async (req, res) => {
      try {
        const { value } = req.body;
        if (!value) {
          return res.status(400).json({ error: "Value is required" });
        }
        const setting = await storage.updateSystemSetting(
          req.params.key,
          value,
          (req as any).user.id,
        );
        res.json(setting);
      } catch (error) {
        res.status(500).json({ error: "Failed to update setting" });
      }
    },
  );

  const httpServer = createServer(app);
  return httpServer;
}
