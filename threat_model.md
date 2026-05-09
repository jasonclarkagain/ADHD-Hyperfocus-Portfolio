# Threat Model

## Project Overview

This project is a public developer portfolio built as a pnpm monorepo with a React + Vite frontend (`artifacts/portfolio`) and an Express 5 API (`artifacts/api-server`) backed by PostgreSQL via Drizzle. The production application is primarily read-only for visitors, except for a public contact form that submits to `POST /api/contact`.

Production scope for security analysis is limited to the portfolio frontend and API server. `artifacts/mockup-sandbox` is treated as dev-only unless production reachability is demonstrated. In production, `NODE_ENV` is assumed to be `production` and platform-managed TLS terminates client traffic.

## Assets

- **Visitor contact data** — names, email addresses, subjects, and message bodies submitted through the contact form. This is personal data and should only be retained, logged, and exposed for the minimum business purpose.
- **Portfolio content data** — project metadata, skill records, images, and external links stored in PostgreSQL and rendered to visitors. Integrity matters because visitors trust this site as the portfolio owner's published content.
- **Application secrets** — `DATABASE_URL`, any future outbound integration credentials, and deployment configuration. Compromise would expose the database and any connected services.
- **Service availability and operator signal** — the contact endpoint and production logs are low-volume operational surfaces for a personal portfolio, so abuse that floods logs or obscures legitimate messages has meaningful availability impact.

## Trust Boundaries

- **Browser to API** — all `/api/*` requests originate from untrusted clients. The API must validate input and treat all caller-supplied identity claims as untrusted.
- **API to PostgreSQL** — the API server has direct database access. Query safety and data minimization at this boundary prevent injection and overexposure.
- **API to logging/observability** — request handlers emit structured logs. Contact submissions and errors crossing into logs must be minimized and redacted because logs often have broader retention and access than primary application data.
- **Public to write-capable boundary** — most routes are public reads, but `POST /api/contact` allows unauthenticated writes and therefore requires abuse controls beyond schema validation.
- **Production to dev-only boundary** — `artifacts/mockup-sandbox` and one-off database maintenance scripts under `lib/db/src/*.ts` are not assumed production-reachable unless explicitly wired into runtime entry points.

## Scan Anchors

- **Production entry points:** `artifacts/portfolio/src/main.tsx`, `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`
- **Highest-risk area:** `artifacts/api-server/src/routes/contact.ts` because it is the only public unauthenticated write path
- **Read APIs:** `artifacts/api-server/src/routes/projects.ts`, `artifacts/api-server/src/routes/skills.ts`
- **Database boundary:** `lib/db/src/index.ts`, `lib/db/src/schema/**`
- **Public surfaces:** all current routes are public; there are no authenticated or admin-only routes in the present production codebase
- **Usually dev-only:** `artifacts/mockup-sandbox/**`, `scripts/**`, and maintenance/seed scripts under `lib/db/src/*` that are not imported by runtime entry points

## Threat Categories

### Spoofing

The application does not authenticate end users, so any identity-like fields submitted to the contact endpoint (`name`, `email`) are self-asserted and untrusted. The system must not treat contact form fields as verified identity, and any future automation that forwards or stores these submissions must preserve that distinction.

### Tampering

All API inputs arrive from untrusted clients. Request bodies and query parameters must be validated server-side before use, and database access must remain parameterized through Drizzle rather than string-built SQL. Portfolio content rendered into links or image sources should remain curated server-side content, not user-generated content.

### Information Disclosure

The main disclosure risk is exposure of visitor-submitted contact data or operational secrets through logs, API responses, or error handling. Error responses should stay generic, logs should avoid storing unnecessary personal data, and secrets must remain outside source control and client bundles.

### Denial of Service

Because the site has a single unauthenticated write endpoint, abuse of `POST /api/contact` is the primary availability concern. Public write endpoints must bound payload size, rate, and automation abuse so they cannot be used to flood logs, overwhelm future downstream integrations, or bury legitimate visitor messages.

### Elevation of Privilege

There are currently no authenticated or admin privilege tiers. The main elevation risk is indirect: injection or unsafe server-side processing at the API or database boundary could grant broader data access or server-side capabilities than intended. Database queries must remain parameterized and server-side code must not execute user-controlled input as code, file paths, or commands.
