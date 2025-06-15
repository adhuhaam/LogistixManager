import { 
  users, 
  vehicles, 
  drivers, 
  vehicleAssignments, 
  maintenanceRecords, 
  fuelRecords,
  type User, 
  type InsertUser, 
  type Vehicle, 
  type InsertVehicle, 
  type Driver, 
  type InsertDriver,
  type VehicleAssignment,
  type InsertVehicleAssignment,
  type MaintenanceRecord,
  type InsertMaintenanceRecord,
  type FuelRecord,
  type InsertFuelRecord
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Auth methods
  authenticateUser(username: string, password: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Vehicle methods
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getAllVehicles(): Promise<Vehicle[]>;
  getAvailableVehicles(): Promise<Vehicle[]>;
  getVehiclesByDriver(driverId: number): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, updates: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;
  
  // Driver methods
  getDriver(id: number): Promise<Driver | undefined>;
  getAllDrivers(): Promise<Driver[]>;
  getAvailableDrivers(): Promise<Driver[]>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: number, updates: Partial<InsertDriver>): Promise<Driver | undefined>;
  deleteDriver(id: number): Promise<boolean>;
  
  // Vehicle assignment methods
  assignVehicleToDriver(assignment: InsertVehicleAssignment): Promise<VehicleAssignment>;
  unassignVehicle(vehicleId: number, reason?: string): Promise<boolean>;
  getVehicleAssignments(): Promise<VehicleAssignment[]>;
  getActiveAssignments(): Promise<VehicleAssignment[]>;
  
  // Maintenance methods
  addMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  getMaintenanceRecords(vehicleId?: number): Promise<MaintenanceRecord[]>;
  updateMaintenanceRecord(id: number, updates: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined>;
  
  // Fuel tracking methods
  addFuelRecord(record: InsertFuelRecord): Promise<FuelRecord>;
  getFuelRecords(vehicleId?: number): Promise<FuelRecord[]>;
  updateFuelRecord(id: number, updates: Partial<InsertFuelRecord>): Promise<FuelRecord | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods
  async authenticateUser(username: string, password: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Vehicle methods
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, id));
    return vehicle;
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.isActive, true));
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    return await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.isActive, true), eq(vehicles.status, "available")));
  }

  async getVehiclesByDriver(driverId: number): Promise<Vehicle[]> {
    return await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.assignedDriverId, driverId), eq(vehicles.isActive, true)));
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db
      .insert(vehicles)
      .values(vehicle)
      .returning();
    return newVehicle;
  }

  async updateVehicle(id: number, updates: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [vehicle] = await db
      .update(vehicles)
      .set(updates)
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    const [vehicle] = await db
      .update(vehicles)
      .set({ isActive: false })
      .where(eq(vehicles.id, id))
      .returning();
    return !!vehicle;
  }

  // Driver methods
  async getDriver(id: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver;
  }

  async getAllDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers);
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    return await db
      .select()
      .from(drivers)
      .where(eq(drivers.status, "active"));
  }

  async createDriver(driver: InsertDriver): Promise<Driver> {
    const [newDriver] = await db
      .insert(drivers)
      .values(driver)
      .returning();
    return newDriver;
  }

  async updateDriver(id: number, updates: Partial<InsertDriver>): Promise<Driver | undefined> {
    const [driver] = await db
      .update(drivers)
      .set(updates)
      .where(eq(drivers.id, id))
      .returning();
    return driver;
  }

  async deleteDriver(id: number): Promise<boolean> {
    const [driver] = await db
      .update(drivers)
      .set({ status: "inactive" })
      .where(eq(drivers.id, id))
      .returning();
    return !!driver;
  }

  // Vehicle assignment methods
  async assignVehicleToDriver(assignment: InsertVehicleAssignment): Promise<VehicleAssignment> {
    // First, unassign any existing assignment for this vehicle
    await db
      .update(vehicleAssignments)
      .set({ isActive: false, unassignedDate: new Date() })
      .where(and(eq(vehicleAssignments.vehicleId, assignment.vehicleId), eq(vehicleAssignments.isActive, true)));

    // Update vehicle status and assigned driver
    await db
      .update(vehicles)
      .set({ 
        assignedDriverId: assignment.driverId, 
        status: "assigned" 
      })
      .where(eq(vehicles.id, assignment.vehicleId));

    // Create new assignment record
    const [newAssignment] = await db
      .insert(vehicleAssignments)
      .values(assignment)
      .returning();
    
    return newAssignment;
  }

  async unassignVehicle(vehicleId: number, reason?: string): Promise<boolean> {
    // Update assignment record
    await db
      .update(vehicleAssignments)
      .set({ 
        isActive: false, 
        unassignedDate: new Date(),
        reason: reason || "Unassigned" 
      })
      .where(and(eq(vehicleAssignments.vehicleId, vehicleId), eq(vehicleAssignments.isActive, true)));

    // Update vehicle status
    const [vehicle] = await db
      .update(vehicles)
      .set({ 
        assignedDriverId: null, 
        status: "available" 
      })
      .where(eq(vehicles.id, vehicleId))
      .returning();

    return !!vehicle;
  }

  async getVehicleAssignments(): Promise<VehicleAssignment[]> {
    return await db
      .select()
      .from(vehicleAssignments)
      .orderBy(desc(vehicleAssignments.assignedDate));
  }

  async getActiveAssignments(): Promise<VehicleAssignment[]> {
    return await db
      .select()
      .from(vehicleAssignments)
      .where(eq(vehicleAssignments.isActive, true))
      .orderBy(desc(vehicleAssignments.assignedDate));
  }

  // Maintenance methods
  async addMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [newRecord] = await db
      .insert(maintenanceRecords)
      .values(record)
      .returning();
    return newRecord;
  }

  async getMaintenanceRecords(vehicleId?: number): Promise<MaintenanceRecord[]> {
    if (vehicleId) {
      return await db
        .select()
        .from(maintenanceRecords)
        .where(eq(maintenanceRecords.vehicleId, vehicleId))
        .orderBy(desc(maintenanceRecords.serviceDate));
    }
    return await db
      .select()
      .from(maintenanceRecords)
      .orderBy(desc(maintenanceRecords.serviceDate));
  }

  async updateMaintenanceRecord(id: number, updates: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined> {
    const [record] = await db
      .update(maintenanceRecords)
      .set(updates)
      .where(eq(maintenanceRecords.id, id))
      .returning();
    return record;
  }

  // Fuel tracking methods
  async addFuelRecord(record: InsertFuelRecord): Promise<FuelRecord> {
    const [newRecord] = await db
      .insert(fuelRecords)
      .values(record)
      .returning();
    return newRecord;
  }

  async getFuelRecords(vehicleId?: number): Promise<FuelRecord[]> {
    if (vehicleId) {
      return await db
        .select()
        .from(fuelRecords)
        .where(eq(fuelRecords.vehicleId, vehicleId))
        .orderBy(desc(fuelRecords.fuelDate));
    }
    return await db
      .select()
      .from(fuelRecords)
      .orderBy(desc(fuelRecords.fuelDate));
  }

  async updateFuelRecord(id: number, updates: Partial<InsertFuelRecord>): Promise<FuelRecord | undefined> {
    const [record] = await db
      .update(fuelRecords)
      .set(updates)
      .where(eq(fuelRecords.id, id))
      .returning();
    return record;
  }
}

export const storage = new DatabaseStorage();