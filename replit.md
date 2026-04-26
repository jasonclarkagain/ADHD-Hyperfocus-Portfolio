# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Portfolio site for a developer with ADHD hyperfocus energy — sharp, dry, professional.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, TailwindCSS, Framer Motion, Wouter

## Artifacts

- **portfolio** (`/`) — Full-stack developer portfolio site with all projects, skills, stats, and contact form
- **api-server** (`/api`) — Express backend serving projects, skills, stats, and contact endpoints

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

- `projects` — all portfolio projects with title, slug, description, status, tags, techStack, links, featured flag
- `skill_categories` — skill groupings (Languages, Frontend, Backend, etc.)
- `skills` — individual skills with level and years of experience

## API Endpoints

- `GET /api/projects` — list projects (filter by status/tag)
- `GET /api/projects/:id` — single project
- `GET /api/projects/stats` — aggregated stats
- `GET /api/projects/featured` — featured/pinned projects
- `GET /api/skills` — skills grouped by category
- `POST /api/contact` — submit contact form

## Design System

- **Theme**: Dark only. Deep space ink (#040311 area) + electric lime primary + electric purple secondary + electric cyan accent
- **Font**: Space Grotesk (sans) + JetBrains Mono (mono)
- **Radius**: 0 — sharp edges, no rounding
- **Personality**: Dry humor, monospace labels, terminal-style UI elements

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
