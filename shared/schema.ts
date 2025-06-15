import { pgTable, text, serial, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
});

export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // "hybrid", "electric", "gasoline"
  horsepower: integer("horsepower").notNull(),
  kilowatts: integer("kilowatts"),
  seats: integer("seats").notNull().default(4),
  imageUrl: text("image_url").notNull(),
  thumbnails: text("thumbnails").array().default([]),
  features: text("features").array().default([]),
  description: text("description"),
  isAvailable: boolean("is_available").notNull().default(true),
  bookingNumber: text("booking_number"),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  orderDate: timestamp("order_date"),
  status: text("status").default("available"), // "available", "sold", "reserved"
});

export const salesMetrics = pgTable("sales_metrics", {
  id: serial("id").primaryKey(),
  totalProfit: decimal("total_profit", { precision: 12, scale: 2 }).notNull(),
  totalSales: decimal("total_sales", { precision: 12, scale: 2 }).notNull(),
  profitGrowth: decimal("profit_growth", { precision: 5, scale: 2 }).notNull(),
  salesGrowth: decimal("sales_growth", { precision: 5, scale: 2 }).notNull(),
  period: text("period").notNull(), // "current", "previous"
  createdAt: timestamp("created_at").defaultNow(),
});

export const salesStatistics = pgTable("sales_statistics", {
  id: serial("id").primaryKey(),
  country: text("country").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  sales: decimal("sales", { precision: 12, scale: 2 }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertCarSchema = createInsertSchema(cars).omit({
  id: true,
});

export const insertSalesMetricsSchema = createInsertSchema(salesMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertSalesStatisticsSchema = createInsertSchema(salesStatistics).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;
export type SalesMetrics = typeof salesMetrics.$inferSelect;
export type InsertSalesMetrics = z.infer<typeof insertSalesMetricsSchema>;
export type SalesStatistics = typeof salesStatistics.$inferSelect;
export type InsertSalesStatistics = z.infer<typeof insertSalesStatisticsSchema>;
