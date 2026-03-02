# NewsDesk

A modern, open-source newsroom content management system — a SuperDesk alternative built entirely in SvelteKit.

## What is NewsDesk?

NewsDesk is a full-featured editorial platform for newsrooms. It covers the complete content lifecycle: writing, editing, tagging, workflow management, publishing, and archiving — all in a single unified application.

It is designed as a simpler, modern replacement for SuperDesk, swapping its microservices architecture for a monolithic SvelteKit app backed by PostgreSQL.

## Features

### Content Authoring
- Rich text editor (TipTap) with bold, italic, headers, lists, links, quotes, code blocks, and tables
- Article metadata: headline, slug, byline, excerpt, categories, and tags
- Auto-save with debounce and read-time estimation
- Status lifecycle: draft → working → submitted → published → archived

### Content Discovery
- Full-text search across headlines, excerpts, and bylines
- Filter by status, tags, and categories
- Monitoring view with a live preview pane
- Article list view for quick browsing

### Workspace
- Authoring workspace for writing and editing articles
- Monitoring workspace for tracking content across statuses
- Archive workspace for managing archived content
- Planning, assignments, search, media, and dashboard workspaces (in progress)

### User & Settings
- User registration and login (Better Auth)
- Profile and settings pages
- Category management from the Settings page

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit + Svelte 5 |
| Language | TypeScript |
| Database | PostgreSQL via Drizzle ORM |
| Authentication | Better Auth |
| UI | shadcn-svelte + Tailwind CSS 4.x |
| i18n | Paraglide |
| Package Manager | Bun |

## Getting Started

```bash
# Install dependencies
bun install

# Start the database
docker compose up -d

# Start the development server
bun dev
```

Copy `.env.example` to `.env` and fill in your database credentials before starting.

## License

Copyright © 2026 PremoWeb LLC. See [LICENSE](./LICENSE) for terms.
