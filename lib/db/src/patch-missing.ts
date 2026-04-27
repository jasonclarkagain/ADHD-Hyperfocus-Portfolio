import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

const patches: Array<{ slug: string; liveUrl?: string; addTags?: string[]; status?: "published" | "in-progress" | "archived" }> = [
  {
    slug: "next-js-supabase",
    liveUrl: "https://nextjs-with-supabase-29h8.vercel.app",
    addTags: ["vercel", "supabase"],
    status: "published",
  },
  {
    slug: "next-js-contentlayer",
    liveUrl: "https://nextjs-contentlayer-alpha-gules.vercel.app",
    addTags: ["vercel"],
    status: "published",
  },
];

async function main() {
  for (const p of patches) {
    const [existing] = await db.select().from(schema.projectsTable).where(eq(schema.projectsTable.slug, p.slug));
    if (!existing) { console.log(`SKIP: ${p.slug}`); continue; }
    const newTags = p.addTags ? Array.from(new Set([...existing.tags, ...p.addTags])) : existing.tags;
    await db.update(schema.projectsTable).set({
      ...(p.liveUrl ? { liveUrl: p.liveUrl } : {}),
      ...(p.status ? { status: p.status } : {}),
      tags: newTags,
      updatedAt: new Date(),
    }).where(eq(schema.projectsTable.slug, p.slug));
    console.log(`UPDATED: ${p.slug} => ${p.liveUrl}`);
  }
  await pool.end();
}
main().catch(console.error);
