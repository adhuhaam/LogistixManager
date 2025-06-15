import { users, cars, salesMetrics, salesStatistics, type User, type InsertUser, type Car, type InsertCar, type SalesMetrics, type InsertSalesMetrics, type SalesStatistics, type InsertSalesStatistics } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Car methods
  getCar(id: number): Promise<Car | undefined>;
  getAllCars(): Promise<Car[]>;
  getAvailableCars(): Promise<Car[]>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: number, updates: Partial<InsertCar>): Promise<Car | undefined>;
  deleteCar(id: number): Promise<boolean>;
  
  // Sales metrics methods
  getCurrentSalesMetrics(): Promise<SalesMetrics | undefined>;
  createSalesMetrics(metrics: InsertSalesMetrics): Promise<SalesMetrics>;
  
  // Sales statistics methods
  getAllSalesStatistics(): Promise<SalesStatistics[]>;
  createSalesStatistics(stats: InsertSalesStatistics): Promise<SalesStatistics>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cars: Map<number, Car>;
  private salesMetrics: Map<number, SalesMetrics>;
  private salesStatistics: Map<number, SalesStatistics>;
  private currentUserId: number;
  private currentCarId: number;
  private currentMetricsId: number;
  private currentStatsId: number;

  constructor() {
    this.users = new Map();
    this.cars = new Map();
    this.salesMetrics = new Map();
    this.salesStatistics = new Map();
    this.currentUserId = 1;
    this.currentCarId = 1;
    this.currentMetricsId = 1;
    this.currentStatsId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize default user
    const defaultUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "password123",
      email: "dianne.russell@focar.com",
      name: "Dianne Russell",
      role: "admin"
    };
    this.users.set(defaultUser.id, defaultUser);

    // Initialize cars
    const bmwCars: Car[] = [
      {
        id: this.currentCarId++,
        make: "BMW",
        model: "XM 2024 Edition",
        year: 2024,
        price: "93899.00",
        type: "hybrid",
        horsepower: 653,
        kilowatts: 480,
        seats: 4,
        imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        thumbnails: [
          "https://pixabay.com/get/g771a35dc479351b6745067e3048cc01930027686898b69d70e4a12db73b6759fe27dbade536eec1f508b90c78a537418e8d92c2d33d6697e2d675e2cd2530376_1280.jpg",
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150"
        ],
        features: ["Hybrid Car", "Smart AC", "Smart Tracking", "Smart Control", "Advanced Gear"],
        description: "High-performance luxury SUV with advanced hybrid technology, featuring cutting-edge infotainment system and premium interior finishes.",
        isAvailable: true,
        bookingNumber: "78845",
        customerName: "Brooklyn Simmons",
        customerEmail: "debra.holt@example.com",
        orderDate: new Date("2024-01-26"),
        status: "sold"
      },
      {
        id: this.currentCarId++,
        make: "BMW",
        model: "i7 M70 xDrive",
        year: 2024,
        price: "93899.00",
        type: "electric",
        horsepower: 653,
        kilowatts: 480,
        seats: 4,
        imageUrl: "https://images.unsplash.com/photo-1563720223-b6267bd740c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        thumbnails: [],
        features: ["Electric Car", "Smart AC", "Smart Tracking", "Smart Control"],
        description: "Flagship electric sedan with unparalleled luxury and cutting-edge electric drivetrain technology.",
        isAvailable: true,
        status: "available"
      },
      {
        id: this.currentCarId++,
        make: "BMW",
        model: "i4 M50 xDrive",
        year: 2024,
        price: "75299.00",
        type: "hybrid",
        horsepower: 536,
        kilowatts: 400,
        seats: 4,
        imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        thumbnails: [],
        features: ["Hybrid Car", "Smart AC", "Smart Tracking", "Smart Control"],
        description: "Performance electric sedan combining sporty driving dynamics with zero-emission technology.",
        isAvailable: true,
        status: "available"
      },
      {
        id: this.currentCarId++,
        make: "BMW",
        model: "X5 M Competition",
        year: 2024,
        price: "108900.00",
        type: "gasoline",
        horsepower: 617,
        kilowatts: null,
        seats: 7,
        imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        thumbnails: [],
        features: ["Gasoline", "Climate Control", "Connected Drive", "Active Safety"],
        description: "Ultimate performance SUV with M-tuned engine and track-ready capabilities.",
        isAvailable: true,
        status: "available"
      },
      {
        id: this.currentCarId++,
        make: "BMW",
        model: "M3 Competition",
        year: 2024,
        price: "78800.00",
        type: "gasoline",
        horsepower: 503,
        kilowatts: null,
        seats: 4,
        imageUrl: "https://pixabay.com/get/g55bf8773c5d6556ef0787c0b0c45209a23d845446fd78bb5c78f1968894380e9cd62d3e43effa1f2f746e2b288f6761098d711e6c92fdfb0517fb32a608c3b5b_1280.jpg",
        thumbnails: [],
        features: ["M Performance", "Track Mode", "Adaptive M", "RWD"],
        description: "Pure driving machine with race-bred M performance and precision handling.",
        isAvailable: true,
        status: "available"
      },
      {
        id: this.currentCarId++,
        make: "BMW",
        model: "iX xDrive50",
        year: 2024,
        price: "87100.00",
        type: "electric",
        horsepower: 516,
        kilowatts: 385,
        seats: 5,
        imageUrl: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        thumbnails: [],
        features: ["Electric", "AI Assistant", "Fast Charging", "Digital Key"],
        description: "Revolutionary electric SUV with sustainable luxury and innovative technology integration.",
        isAvailable: true,
        status: "available"
      }
    ];

    bmwCars.forEach(car => this.cars.set(car.id, car));

    // Initialize sales metrics
    const currentMetrics: SalesMetrics = {
      id: this.currentMetricsId++,
      totalProfit: "93247.38",
      totalSales: "849752.01",
      profitGrowth: "67.00",
      salesGrowth: "8.00",
      period: "current",
      createdAt: new Date()
    };
    this.salesMetrics.set(currentMetrics.id, currentMetrics);

    // Initialize sales statistics
    const statsData: SalesStatistics[] = [
      { id: this.currentStatsId++, country: "US", percentage: "36.10", sales: "304562.15" },
      { id: this.currentStatsId++, country: "UK", percentage: "28.70", sales: "243946.83" },
      { id: this.currentStatsId++, country: "UAE", percentage: "27.40", sales: "232832.05" },
      { id: this.currentStatsId++, country: "Australia", percentage: "21.50", sales: "182696.68" },
      { id: this.currentStatsId++, country: "Germany", percentage: "18.70", sales: "158899.62" }
    ];

    statsData.forEach(stat => this.salesStatistics.set(stat.id, stat));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Car methods
  async getCar(id: number): Promise<Car | undefined> {
    return this.cars.get(id);
  }

  async getAllCars(): Promise<Car[]> {
    return Array.from(this.cars.values());
  }

  async getAvailableCars(): Promise<Car[]> {
    return Array.from(this.cars.values()).filter(car => car.isAvailable);
  }

  async createCar(insertCar: InsertCar): Promise<Car> {
    const id = this.currentCarId++;
    const car: Car = { ...insertCar, id };
    this.cars.set(id, car);
    return car;
  }

  async updateCar(id: number, updates: Partial<InsertCar>): Promise<Car | undefined> {
    const car = this.cars.get(id);
    if (!car) return undefined;
    
    const updatedCar = { ...car, ...updates };
    this.cars.set(id, updatedCar);
    return updatedCar;
  }

  async deleteCar(id: number): Promise<boolean> {
    return this.cars.delete(id);
  }

  // Sales metrics methods
  async getCurrentSalesMetrics(): Promise<SalesMetrics | undefined> {
    return Array.from(this.salesMetrics.values()).find(metrics => metrics.period === "current");
  }

  async createSalesMetrics(insertMetrics: InsertSalesMetrics): Promise<SalesMetrics> {
    const id = this.currentMetricsId++;
    const metrics: SalesMetrics = { ...insertMetrics, id, createdAt: new Date() };
    this.salesMetrics.set(id, metrics);
    return metrics;
  }

  // Sales statistics methods
  async getAllSalesStatistics(): Promise<SalesStatistics[]> {
    return Array.from(this.salesStatistics.values());
  }

  async createSalesStatistics(insertStats: InsertSalesStatistics): Promise<SalesStatistics> {
    const id = this.currentStatsId++;
    const stats: SalesStatistics = { ...insertStats, id };
    this.salesStatistics.set(id, stats);
    return stats;
  }
}

export const storage = new MemStorage();
