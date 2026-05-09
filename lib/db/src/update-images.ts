import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { projectsTable } from "./schema/projects";
import { eq } from "drizzle-orm";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const images = [
    { slug: 'coding-agent-platform', imageUrl: '/images/projects/coding-agent-platform.png' },
    { slug: 'odyssey', imageUrl: '/images/projects/odyssey.png' },
    { slug: 'magic-portfolio', imageUrl: '/images/projects/magic-portfolio.png' },
    { slug: 'astrozen', imageUrl: '/images/projects/astrozen.png' },
    { slug: 'nuxt-ai-chatbot', imageUrl: '/images/projects/nuxt-ai-chatbot.png' },
    { slug: 'screwfast', imageUrl: '/images/projects/screwfast.png' },
    { slug: 'portfolio-starter-kit', imageUrl: '/images/projects/portfolio-starter-kit.png' },
    { slug: 'blog-with-comments', imageUrl: '/images/projects/blog-with-comments.png' },
    { slug: 'vibe-coding-platform', imageUrl: '/images/projects/vibe-coding-platform.png' },
    { slug: 'view-transitions-demo', imageUrl: '/images/projects/view-transitions-demo.png' },
    { slug: 'next-js-supabase', imageUrl: '/images/projects/next-js-supabase.png' },
    { slug: 'next-js-contentlayer', imageUrl: '/images/projects/next-js-contentlayer.png' },
    { slug: 'obscure-chronicles', imageUrl: '/images/projects/obscure-chronicles.png' },
    { slug: 'app-directory', imageUrl: '/images/projects/app-directory.png' },
    { slug: 'workflow-builder', imageUrl: '/images/projects/workflow-builder.png' },
    { slug: 'morphic-generative-ui-answer-engine', imageUrl: '/images/projects/morphic-generative-ui-answer-engine.png' },
    { slug: 'ai-chatbot', imageUrl: '/images/projects/ai-chatbot.png' },
    { slug: 'parallelai', imageUrl: '/images/projects/parallelai.png' },
    { slug: 'x402-ai-starter', imageUrl: '/images/projects/x402-ai-starter.png' },
    { slug: 'secure-share-hub', imageUrl: '/images/projects/secure-share-hub.png' },
    { slug: 'spacelink', imageUrl: '/images/projects/spacelink.png' },
    { slug: 'llm-swarm', imageUrl: '/images/projects/llm-swarm.png' },
    { slug: 'axiom-emitter', imageUrl: '/images/projects/axiom-emitter.png' },
    { slug: 'onion-browser', imageUrl: '/images/projects/onion-browser.png' },
  ];

  for (const { slug, imageUrl } of images) {
    const r = await db.update(projectsTable).set({ imageUrl }).where(eq(projectsTable.slug, slug)).returning({ slug: projectsTable.slug });
    if (r.length) console.log(`✓ ${slug}`);
    else console.log(`✗ NOT FOUND: ${slug}`);
  }

  await pool.end();
}

main().catch(console.error);
