import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { engineersTable } from "./engineers";

export const contactRequestsTable = pgTable("contact_requests", {
  id: serial("id").primaryKey(),
  engineerId: integer("engineer_id").notNull().references(() => engineersTable.id),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertContactRequestSchema = createInsertSchema(contactRequestsTable).omit({ id: true, createdAt: true });
export type InsertContactRequest = z.infer<typeof insertContactRequestSchema>;
export type ContactRequest = typeof contactRequestsTable.$inferSelect;
