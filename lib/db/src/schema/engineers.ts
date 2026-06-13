import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const engineersTable = pgTable("engineers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  city: text("city").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  bio: text("bio"),
  profilePhoto: text("profile_photo"),
  status: text("status").notNull().default("pending"),
  trialEndDate: date("trial_end_date", { mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEngineerSchema = createInsertSchema(engineersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEngineer = z.infer<typeof insertEngineerSchema>;
export type Engineer = typeof engineersTable.$inferSelect;
