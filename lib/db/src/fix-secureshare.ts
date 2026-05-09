import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { projectsTable } from "./schema/projects";
import { eq } from "drizzle-orm";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  const r = await db.update(projectsTable)
    .set({ imageUrl: '/images/projects/secureshare-hub.png' })
    .where(eq(projectsTable.slug, 'secureshare-hub'))
    .returning({ slug: projectsTable.slug });
  console.log(r);
  await pool.end();
}
main().catch(console.error);
