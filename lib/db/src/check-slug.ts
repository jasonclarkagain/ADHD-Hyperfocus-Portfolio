import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { projectsTable } from "./schema/projects";
import { like, or } from "drizzle-orm";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  const r = await db.select({ slug: projectsTable.slug }).from(projectsTable).where(
    or(like(projectsTable.slug, '%share%'), like(projectsTable.slug, '%secure%'))
  );
  console.log(r);
  await pool.end();
}
main().catch(console.error);
