# Machinery Safety

A web application for tracking safety risks on production lines and the actions taken to fix them with the principles of PDCA.

During an audit walk, a safety or line manager records each hazard they find: where it is, how dangerous it is, who is responsible for fixing it and by when. The responsible person works on the issue, can have the deadline postponed, and marks it resolved. Managers then verify the fix or reopen the issue. Every change is kept in the entry's history, and the statistics page shows how the plant is doing over time.

## Features

- **Dashboard** – the entries assigned to you, at a glance
- **All entries** – a searchable, sortable and filterable table (risk level, status, line, date ranges), with selectable columns and CSV export
- **New entry wizard** – a step-by-step form for recording a risk: location, danger description, risk level, responsible person, deadline, cost, MOC number and up to 5 photos
- **Short-term and long-term risks** – link a temporary measure to its permanent fix
- **Deadline postponements** – the original deadline and every postponement are kept
- **Comments and an activity timeline** on every entry
- **Statistics** – embedded Metabase dashboards (risk levels, statuses, lines, monthly trend)
- **Role-based access** – each user only sees the pages and actions their role allows
- **Drafts are kept** – an unfinished entry survives a page reload or an expired session
- **English and Hungarian** interface, light and dark theme

The app is designed for desktop browsers.

## Running it

### Local development

Requirements: [Bun](https://bun.sh) and a running backend (default address: `http://localhost:8080`).

```bash
bun install
bun run dev          # http://localhost:5173
```

Other commands:

```bash
bun run build        # production build, start it with: bun ./build/index.js
bun run check        # type check
bun run test         # unit tests
```

### Docker

```bash
docker build -t machinerysafety-frontend .
docker run -p 3000:3000 -e PUBLIC_API_URL=http://<backend-host>:8080 machinerysafety-frontend
```

### Full installation

The [`deploy/`](deploy/README.md) folder builds an offline installation bundle: the frontend, backend, PostgreSQL, Metabase and MinIO (photo storage) as Docker Compose services, for servers without internet access. Building the bundle requires the backend source. Installation and operation are described in [deploy/README.md](deploy/README.md).

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PUBLIC_API_URL` | `http://localhost:8080` | Backend address. All `/api/*` requests are forwarded to it. |
| `VITE_LOG_LEVEL` | `warn` | Browser log level in production builds: `none`, `error`, `warn`, `info` or `debug`. Set at build time. |
| `ORIGIN` | – | Only behind an HTTPS reverse proxy: the public `https://` address of the app. |

The Metabase address and dashboard for the statistics page are provided by the backend.

## Built with

[SvelteKit](https://svelte.dev) · [Svelte 5](https://svelte.dev) · [Tailwind CSS 4](https://tailwindcss.com) · [shadcn-svelte](https://shadcn-svelte.com) · [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) (translations) · [Bun](https://bun.sh)

## License

Copyright 2026 Ruben Zsédely

Licensed under the [Apache License, Version 2.0](LICENSE). You are free to use, modify and distribute this software, including commercially, provided that you keep the copyright and [NOTICE](NOTICE) attribution to the original author and mark any files you change.
