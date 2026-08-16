# Front-end run instructions (dev)

This explains how to run the Vite front-end and the API server together for local development.

1. Install dependencies (workspace root):

   pnpm install

2. Start the API server on port 3001:

   export PORT=3001
   cd artifacts/api-server
   pnpm install
   pnpm dev

3. In another terminal, start the front-end (Vite). The Vite config includes a dev proxy so calls to /api will be forwarded to the API server:

   cd artifacts/footy-elo
   export PORT=5173
   export BASE_PATH=/  # required by the vite config
   pnpm install
   pnpm dev

Now open the Vite dev URL (usually http://localhost:5173). The front-end will call /api/teams, /api/players, /api/matches via the proxy.
