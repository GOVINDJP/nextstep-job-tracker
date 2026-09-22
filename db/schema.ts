import { sqliteTable, text } from "drizzle-orm/sqlite-core";
export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(), company: text("company").notNull(), role: text("role").notNull(),
  stage: text("stage").notNull(), interview: text("interview").notNull().default(""),
  notes: text("notes").notNull().default(""), created: text("created").notNull(),
});

