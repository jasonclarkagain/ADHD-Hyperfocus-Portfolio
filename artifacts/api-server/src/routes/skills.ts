import { Router } from "express";
import { db, skillCategoriesTable, skillsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/skills", async (req, res) => {
  try {
    const categories = await db
      .select()
      .from(skillCategoriesTable)
      .orderBy(skillCategoriesTable.sortOrder);

    const skills = await db.select().from(skillsTable);

    const result = categories.map((cat) => ({
      ...cat,
      skills: skills.filter((s) => s.categoryId === cat.id),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get skills");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
