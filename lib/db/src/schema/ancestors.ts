import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const ancestorsTable = pgTable("ancestors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  relationship: text("relationship").notNull(),
  gender: text("gender").notNull().default("Male"),
  photoUrl: text("photo_url"),
  dateOfBirth: text("date_of_birth"),
  dateOfDeath: text("date_of_death").notNull(),
  placeOfDeath: text("place_of_death"),
  tithi: text("tithi"),
  nakshatram: text("nakshatram"),
  masam: text("masam"),
  paksham: text("paksham"),
  samvatsaram: text("samvatsaram"),
  teluguYearName: text("telugu_year_name"),
  timeOfDeath: text("time_of_death"),
  familySide: text("family_side"),
  gotram: text("gotram"),
  reminderDaysBefore: integer("reminder_days_before").notNull().default(7),
  ritualNotes: text("ritual_notes"),
  traditions: text("traditions"),
  favoriteMemories: text("favorite_memories"),
  prasadamDetails: text("prasadam_details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAncestorSchema = createInsertSchema(ancestorsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAncestor = z.infer<typeof insertAncestorSchema>;
export type Ancestor = typeof ancestorsTable.$inferSelect;
