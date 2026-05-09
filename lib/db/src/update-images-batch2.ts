import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { projectsTable } from "./schema/projects";
import { eq } from "drizzle-orm";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const images = [
    { slug: 'notion-like-ai-editor', imageUrl: '/images/projects/notion-like-ai-editor.png' },
    { slug: 'ai-story-weaver', imageUrl: '/images/projects/ai-story-weaver.png' },
    { slug: 're-ai-assistant', imageUrl: '/images/projects/re-ai-assistant.png' },
    { slug: 'chat-sdk-liveblocks-bot', imageUrl: '/images/projects/chat-sdk-liveblocks-bot.png' },
    { slug: 'envshare', imageUrl: '/images/projects/envshare.png' },
    { slug: 'envshare-extended', imageUrl: '/images/projects/envshare-extended.png' },
    { slug: 'mcp-with-next-js', imageUrl: '/images/projects/mcp-with-next-js.png' },
    { slug: 'headless-forms', imageUrl: '/images/projects/headless-forms.png' },
    { slug: 'oninst-toolshed', imageUrl: '/images/projects/oninst-toolshed.png' },
    { slug: 'growthbook-feature-flags', imageUrl: '/images/projects/growthbook-feature-flags.png' },
    { slug: 'launchdarkly-feature-flags', imageUrl: '/images/projects/launchdarkly-feature-flags.png' },
    { slug: 'pgp-crypter', imageUrl: '/images/projects/pgp-crypter.png' },
    { slug: 'cryptovault', imageUrl: '/images/projects/cryptovault.png' },
    { slug: 'securecrypt', imageUrl: '/images/projects/securecrypt.png' },
    { slug: 'starstealer-analysis', imageUrl: '/images/projects/starstealer-analysis.png' },
    { slug: 'forensic-sentinel', imageUrl: '/images/projects/forensic-sentinel.png' },
    { slug: 'project-sentinel', imageUrl: '/images/projects/project-sentinel.png' },
    { slug: 'expensesmart', imageUrl: '/images/projects/expensesmart.png' },
    { slug: 'omni-receipt', imageUrl: '/images/projects/omni-receipt.png' },
    { slug: 'chat', imageUrl: '/images/projects/chat.png' },
    { slug: 'multi-tenant-ai-todo-nile', imageUrl: '/images/projects/multi-tenant-ai-todo-nile.png' },
    { slug: 'auth0-saas-starter', imageUrl: '/images/projects/auth0-saas-starter.png' },
    { slug: 'microfrontends-multi-zones', imageUrl: '/images/projects/microfrontends-multi-zones.png' },
    { slug: 'xata-search', imageUrl: '/images/projects/xata-search.png' },
    { slug: 'anycable-real-time', imageUrl: '/images/projects/anycable-real-time.png' },
    { slug: 'omni-propagation-system', imageUrl: '/images/projects/omni-propagation-system.png' },
    { slug: 'mothership', imageUrl: '/images/projects/mothership.png' },
    { slug: 'omnipropagation', imageUrl: '/images/projects/omnipropagation.png' },
    { slug: 'omnicommander-elite', imageUrl: '/images/projects/omnicommander-elite.png' },
    { slug: 'sovereign-core', imageUrl: '/images/projects/sovereign-core.png' },
    { slug: 'sovereign-swarm', imageUrl: '/images/projects/sovereign-swarm.png' },
    { slug: 'rumble-video-generator', imageUrl: '/images/projects/rumble-video-generator.png' },
    { slug: 'youtubego', imageUrl: '/images/projects/youtubego.png' },
    { slug: 'teton-peaks-view', imageUrl: '/images/projects/teton-peaks-view.png' },
    { slug: 'image-gallery-starter', imageUrl: '/images/projects/image-gallery-starter.png' },
    { slug: 'neversus', imageUrl: '/images/projects/neversus.png' },
    { slug: 'quantum-mutation-swarm', imageUrl: '/images/projects/quantum-mutation-swarm.png' },
  ];

  for (const { slug, imageUrl } of images) {
    const r = await db.update(projectsTable).set({ imageUrl }).where(eq(projectsTable.slug, slug)).returning({ slug: projectsTable.slug });
    if (r.length) console.log(`✓ ${slug}`);
    else console.log(`✗ NOT FOUND: ${slug}`);
  }

  await pool.end();
}

main().catch(console.error);
