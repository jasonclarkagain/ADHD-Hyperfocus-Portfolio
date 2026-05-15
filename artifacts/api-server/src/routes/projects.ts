import { Router } from "express";
import { db, projectsTable, skillCategoriesTable, skillsTable } from "@workspace/db";
import { eq, sql, inArray } from "drizzle-orm";
import { GetProjectsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/projects/stats", async (req, res) => {
  try {
    const allProjects = await db.select().from(projectsTable);

    const total = allProjects.length;
    const published = allProjects.filter((p) => p.status === "published").length;
    const inProgress = allProjects.filter((p) => p.status === "in-progress").length;
    const archived = allProjects.filter((p) => p.status === "archived").length;

    const langCount: Record<string, number> = {};
    const tagCount: Record<string, number> = {};

    for (const project of allProjects) {
      for (const tech of project.techStack) {
        langCount[tech] = (langCount[tech] || 0) + 1;
      }
      for (const tag of project.tags) {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      }
    }

    const topLanguages = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    res.json({ total, published, inProgress, archived, topLanguages, topTags });
  } catch (err) {
    req.log.error({ err }, "Failed to get project stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects/featured", async (req, res) => {
  try {
    const featured = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.featured, true))
      .orderBy(projectsTable.sortOrder);

    res.json(featured.map(serializeProject));
  } catch (err) {
    req.log.error({ err }, "Failed to get featured projects");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects/:id", async (req, res) => {
  const raw = req.params.id;
  const numericId = Number(raw);
  const isNumeric = !Number.isNaN(numericId) && String(numericId) === raw;

  try {
    const [project] = isNumeric
      ? await db.select().from(projectsTable).where(eq(projectsTable.id, numericId))
      : await db.select().from(projectsTable).where(eq(projectsTable.slug, raw));

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json(serializeProject(project));
  } catch (err) {
    req.log.error({ err }, "Failed to get project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects", async (req, res) => {
  const parsed = GetProjectsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }

  try {
    let projects = await db.select().from(projectsTable).orderBy(projectsTable.sortOrder);

    const { status, tag } = parsed.data;

    if (status && status !== "all") {
      projects = projects.filter((p) => p.status === status);
    }

    if (tag) {
      projects = projects.filter((p) => p.tags.includes(tag) || p.techStack.includes(tag));
    }

    res.json(projects.map(serializeProject));
  } catch (err) {
    req.log.error({ err }, "Failed to get projects");
    res.status(500).json({ error: "Internal server error" });
  }
});

function serializeProject(p: typeof projectsTable.$inferSelect) {
  return {
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export default router;
