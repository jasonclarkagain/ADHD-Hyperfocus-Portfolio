import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

async function main() {
  const rows = await db
    .select({ slug: schema.projectsTable.slug, title: schema.projectsTable.title, liveUrl: schema.projectsTable.liveUrl })
    .from(schema.projectsTable)
    .orderBy(schema.projectsTable.sortOrder);
  rows.forEach(r => console.log(`"${r.slug}" | ${r.title} | live: ${r.liveUrl || "none"}`));
  await pool.end();
}
main().catch(console.error);
