# API server for Footy-Elo (artifact)

This small server exposes lightweight JSON endpoints for the demo data used by the front-end. It is intended for local development.

Available endpoints (mounted under /api):

- GET /api/healthz  — health check (already present)
- GET /api/teams    — list of teams (demo data)
- GET /api/players  — list of players (demo data)
- GET /api/matches  — list of matches/fixtures (demo data)

Running locally

1. From the repository root, install dependencies with pnpm:

   pnpm install

2. Run the API server (choose a port):

   export PORT=3001
   cd artifacts/api-server
   pnpm install
   pnpm dev

The server build script bundles the TypeScript and starts the compiled output. The front-end (Vite) can be run separately and configured to call the API (e.g., by proxying or by using the full http://localhost:3001/api/... URLs).
