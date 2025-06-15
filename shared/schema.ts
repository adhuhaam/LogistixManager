import { pgTable, text, serial, integer, decimal, boolean, timestamp, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table with role-based access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // "admin", "user"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Drivers table for managing driver information
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  licenseNumber: text("license_number").notNull().unique(),
  licenseExpiryDate: date("license_expiry_date").notNull(),
  medicalCertificateNumber: text("medical_certificate_number"),
  medicalCertificateExpiry: date("medical_certificate_expiry"),
  permits: text("permits").array().default([]), // Array of permit types
  experience: integer("experience"), // Years of experience
  status: text("status").notNull().default("active"), // "active", "inactive", "suspended"
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// Enhanced vehicles table
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  chassisNumber: text("chassis_number").notNull().unique(),
  engineNumber: text("engine_number").notNull(),
  fuelType: text("fuel_type").notNull(), // "hybrid", "electric", "gasoline", "diesel"
  horsepower: integer("horsepower").notNull(),
  kilowatts: integer("kilowatts"),
  seats: integer("seats").notNull().default(4),
  color: text("color").notNull(),
  imageUrl: text("image_url").notNull(),
  thumbnails: text("thumbnails").array().default([]),
  features: text("features").array().default([]),
  description: text("description"),
  // Registration and compliance
  registrationDate: date("registration_date").notNull(),
  registrationExpiry: date("registration_expiry").notNull(),
  insuranceNumber: text("insurance_number").notNull(),
  insuranceExpiry: date("insurance_expiry").notNull(),
  lastServiceDate: date("last_service_date"),
  nextServiceDue: date("next_service_due"),
  mileage: integer("mileage").default(0),
  // Assignment and status
  assignedDriverId: integer("assigned_driver_id").references(() => drivers.id),
  status: text("status").notNull().default("available"), // "available", "assigned", "maintenance", "retired"
  location: text("location"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// Vehicle assignments tracking
export const vehicleAssignments = pgTable("vehicle_assignments", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  assignedDate: timestamp("assigned_date").notNull().defaultNow(),
  unassignedDate: timestamp("unassigned_date"),
  reason: text("reason"), // Reason for assignment/unassignment
  assignedBy: integer("assigned_by").notNull().references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
});

// Maintenance records
export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id),
  type: text("type").notNull(), // "routine", "repair", "inspection"
  description: text("description").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  serviceDate: date("service_date").notNull(),
  nextServiceDue: date("next_service_due"),
  serviceProvider: text("service_provider"),
  mileageAtService: integer("mileage_at_service"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// Fuel consumption tracking
export const fuelRecords = pgTable("fuel_records", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id),
  driverId: integer("driver_id").references(() => drivers.id),
  fuelType: text("fuel_type").notNull(),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  odometer: integer("odometer").notNull(),
  fuelDate: timestamp("fuel_date").notNull().defaultNow(),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  vehicles: many(vehicles),
  drivers: many(drivers),
  assignments: many(vehicleAssignments),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [drivers.createdBy],
    references: [users.id],
  }),
  vehicles: many(vehicles),
  assignments: many(vehicleAssignments),
  fuelRecords: many(fuelRecords),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  assignedDriver: one(drivers, {
    fields: [vehicles.assignedDriverId],
    references: [drivers.id],
  }),
  createdBy: one(users, {
    fields: [vehicles.createdBy],
    references: [users.id],
  }),
  assignments: many(vehicleAssignments),
  maintenanceRecords: many(maintenanceRecords),
  fuelRecords: many(fuelRecords),
}));

export const vehicleAssignmentsRelations = relations(vehicleAssignments, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleAssignments.vehicleId],
    references: [vehicles.id],
  }),
  driver: one(drivers, {
    fields: [vehicleAssignments.driverId],
    references: [drivers.id],
  }),
  assignedBy: one(users, {
    fields: [vehicleAssignments.assignedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVehicleAssignmentSchema = createInsertSchema(vehicleAssignments).omit({
  id: true,
  assignedDate: true,
});

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({
  id: true,
  createdAt: true,
});

export const insertFuelRecordSchema = createInsertSchema(fuelRecords).omit({
  id: true,
  createdAt: true,
  fuelDate: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type VehicleAssignment = typeof vehicleAssignments.$inferSelect;
export type InsertVehicleAssignment = z.infer<typeof insertVehicleAssignmentSchema>;
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;
export type FuelRecord = typeof fuelRecords.$inferSelect;
export type InsertFuelRecord = z.infer<typeof insertFuelRecordSchema>;
export type LoginData = z.infer<typeof loginSchema>;
