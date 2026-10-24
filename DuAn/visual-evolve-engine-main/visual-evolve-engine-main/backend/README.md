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

To generate 50 invalid `TEST-` placeholder keys per product from
`data/db.json`, run `npm run keys:generate`. After applying the local schema,
load them into local D1 with:

```powershell
npx wrangler d1 execute duanbackup-db --local --file=seed-keys.sql --config ./wrangler.jsonc
```

These are test placeholders, not usable licenses. Do not load them into
production D1.

Order fulfillment is handled by the authenticated
`POST /api/admin/orders/:id/confirm` endpoint. It atomically claims the number
of available keys required by each order item, completes the order, and sends
the keys with Resend when `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set.
Without a Resend key, the Worker logs the recipient and test/license keys and
marks email delivery as logged, not sent. Configure these values as Worker
secrets/variables before using real customer orders.

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
   `vars.CORS_ORIGINS`, apply migrations and deploy:

   ```powershell
   npm run db:apply:remote
   npm run deploy
   ```

   For email delivery, configure `RESEND_API_KEY` as a Worker secret and
   `RESEND_FROM_EMAIL` as a verified sender address before deployment.

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
