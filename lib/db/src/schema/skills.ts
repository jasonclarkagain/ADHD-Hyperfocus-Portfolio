import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const skillCategoriesTable = pgTable("skill_categories", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const skillsTable = pgTable("skills", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => skillCategoriesTable.id),
  name: text("name").notNull(),
  level: text("level", { enum: ["beginner", "intermediate", "advanced", "expert"] }).notNull().default("intermediate"),
  yearsOfExperience: integer("years_of_experience"),
  icon: text("icon"),
});

export const insertSkillCategorySchema = createInsertSchema(skillCategoriesTable).omit({ id: true });
export const insertSkillSchema = createInsertSchema(skillsTable).omit({ id: true });
export type InsertSkillCategory = z.infer<typeof insertSkillCategorySchema>;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type SkillCategory = typeof skillCategoriesTable.$inferSelect;
export type Skill = typeof skillsTable.$inferSelect;
