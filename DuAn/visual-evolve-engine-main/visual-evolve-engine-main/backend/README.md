# Backend API

The API runs as a Cloudflare Worker and uses the `DB` D1 binding. The browser
frontend calls this Worker over HTTP; D1 is never accessed from frontend code.

## Local development

1. Install dependencies with `npm install`.
2. Copy `.dev.vars.example` to `.dev.vars` and set a strong local admin password.
3. Apply the schema, import the fixture data, and start the Worker:

   ```powershell
   npm run db:apply:local
   npm run db:seed:local
   npm run dev
   ```

The Worker serves `/health` and the existing `/api/*` JSON endpoints at
`http://127.0.0.1:8787`. Configure `CORS_ORIGINS` as a comma-separated list of
exact frontend origins. Admin login uses the `ADMIN_EMAIL` and
`ADMIN_PASSWORD` Worker variables.

## Create and deploy D1

1. Create a D1 database and copy its ID into `wrangler.jsonc`:

   ```powershell
   npx wrangler d1 create duanbackup
   ```

2. Set the production admin password as a Worker secret:

   ```powershell
   npx wrangler secret put ADMIN_PASSWORD
   ```

3. Set the production frontend origin in `wrangler.jsonc` under
   `vars.CORS_ORIGINS`, apply the schema and deploy:

   ```powershell
   npm run db:apply:remote
   npm run deploy
   ```

The checked-in D1 ID is only a local placeholder; replace it with the ID
returned by `wrangler d1 create` before using remote commands. D1 migrations in
`migrations/` create the tables used by the API. Do not run schema creation on
every request.

The fixture import is idempotent for existing IDs and reads
`data/db.json`. Review its orders, customer details, and product keys before
choosing to import it into a remote database with `npm run db:seed:remote`.

The API preserves the existing public, admin, checkout, and notification
routes. Set the frontend build variable `VITE_API_BASE_URL` to the Worker URL
plus `/api`, for example `https://duanbackup-api.example.workers.dev/api`.
