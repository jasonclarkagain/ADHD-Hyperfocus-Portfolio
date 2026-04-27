import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { eq, sql } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// slug -> { liveUrl, addTags, status }
const updates: Array<{
  slug: string;
  liveUrl?: string;
  addTags?: string[];
  status?: "published" | "in-progress" | "archived";
}> = [
  // ─── Vercel-deployed confirmed live ──────────────────────────────────
  {
    slug: "coding-agent-platform",
    liveUrl: "https://coding-agent-platform-one-jet.vercel.app",
    addTags: ["vercel"],
    status: "published",
  },
  {
    slug: "odyssey",
    liveUrl: "https://odyssey-lilac-theta.vercel.app",
    addTags: ["vercel"],
    status: "published",
  },
  {
    slug: "magic-portfolio",
    liveUrl: "https://magic-portfolio-for-next-js-5fmb.vercel.app",
    addTags: ["vercel"],
    status: "published",
  },
  {
    slug: "astrozen",
    liveUrl: "https://astrozen-inky-xi.vercel.app",
    addTags: ["vercel"],
    status: "published",
  },
  {
    slug: "envshare-extended",
    liveUrl: "https://envsharej.vercel.app",
    addTags: ["vercel"],
    status: "published",
  },
  {
    slug: "nuxt-ai-chatbot",
    liveUrl: "https://nuxt-ai-chatbot-mu-lilac.vercel.app",
    addTags: ["vercel"],
    status: "published",
  },
  {
    slug: "screwfast",
    liveUrl: "https://screwfast-three-jet.vercel.app",
    addTags: ["vercel"],
    status: "published",
  },
  {
    slug: "nextjs-contentlayer",
    liveUrl: "https://nextjs-contentlayer-alpha-gules.vercel.app",
    addTags: ["vercel"],
    status: "published",
  },
  {
    slug: "portfolio-starter-kit",
    liveUrl: "https://portfolio-starter-kit-gamma-lac-76.vercel.app",
    addTags: ["vercel"],
    status: "published",
  },
  {
    slug: "app-directory",
    liveUrl: "https://app-directory-orcin-delta.vercel.app",
    addTags: ["vercel"],
    status: "published",
  },
  {
    slug: "blog-with-comments",
    liveUrl: "https://blog-with-comments-iota-rosy.vercel.app",
    addTags: ["vercel", "supabase"],
    status: "published",
  },
  {
    slug: "vibe-coding-platform",
    liveUrl: "https://vibe-coding-platform-beige-tau.vercel.app",
    addTags: ["vercel"],
    status: "published",
  },
  {
    slug: "view-transitions-demo",
    liveUrl: "https://view-transitions-42pp.vercel.app",
    addTags: ["vercel"],
    status: "published",
  },
  {
    slug: "nextjs-supabase",
    liveUrl: "https://nextjs-with-supabase-29h8.vercel.app",
    addTags: ["vercel", "supabase"],
    status: "published",
  },
  {
    slug: "obscure-chronicles",
    liveUrl: "https://obscure-chronicles.vercel.app",
    addTags: ["vercel"],
    status: "published",
  },

  // ─── Supabase-backed projects (tag only) ─────────────────────────────
  {
    slug: "multi-tenant-ai-todo-nile",
    addTags: ["supabase"],
  },
  {
    slug: "blog-with-comments",
    addTags: ["supabase"],
  },
  {
    slug: "xata-search",
    addTags: ["supabase"],
  },

  // ─── Gemini / DeepSeek / AI model-specific tags ──────────────────────
  {
    slug: "ai-chatbot",
    addTags: ["vercel", "gemini", "openai"],
  },
  {
    slug: "morphic-generative-ui-answer-engine",
    addTags: ["gemini", "openai", "vercel"],
  },
  {
    slug: "parallelai",
    addTags: ["gemini", "openai", "deepseek"],
  },
  {
    slug: "llm-swarm",
    addTags: ["gemini", "deepseek", "ollama"],
  },
  {
    slug: "notion-like-ai-editor",
    addTags: ["openai"],
  },
  {
    slug: "ai-story-weaver",
    addTags: ["openai"],
  },
  {
    slug: "nuxt-ai-chatbot",
    addTags: ["gemini"],
  },
  {
    slug: "x402-ai-starter",
    addTags: ["openai", "x402"],
  },
];

async function applyUpdates() {
  let updated = 0;
  let skipped = 0;

  for (const upd of updates) {
    // Find the project by slug
    const [existing] = await db
      .select()
      .from(schema.projectsTable)
      .where(eq(schema.projectsTable.slug, upd.slug));

    if (!existing) {
      console.log(`  SKIP (not found): ${upd.slug}`);
      skipped++;
      continue;
    }

    // Merge tags without duplicates
    const newTags = upd.addTags
      ? Array.from(new Set([...existing.tags, ...upd.addTags]))
      : existing.tags;

    await db
      .update(schema.projectsTable)
      .set({
        ...(upd.liveUrl ? { liveUrl: upd.liveUrl } : {}),
        ...(upd.status ? { status: upd.status } : {}),
        tags: newTags,
        updatedAt: new Date(),
      })
      .where(eq(schema.projectsTable.slug, upd.slug));

    console.log(`  UPDATED: ${upd.slug}${upd.liveUrl ? ` => ${upd.liveUrl}` : ""}${upd.addTags ? ` [+${upd.addTags.join(", ")}]` : ""}`);
    updated++;
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped.`);

  // Print summary of all projects with live URLs
  const withUrls = await db
    .select({ slug: schema.projectsTable.slug, liveUrl: schema.projectsTable.liveUrl, status: schema.projectsTable.status })
    .from(schema.projectsTable)
    .where(sql`live_url IS NOT NULL`);

  console.log(`\nProjects with live URLs (${withUrls.length}):`);
  withUrls.forEach(p => console.log(`  [${p.status}] ${p.slug} => ${p.liveUrl}`));

  await pool.end();
}

applyUpdates().catch(console.error);
