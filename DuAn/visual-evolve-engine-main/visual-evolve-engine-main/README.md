# DuAnBackup

The project is split into two independently installable applications:

| Area | Location | Responsibilities |
| --- | --- | --- |
| Frontend | [`frontend/`](./frontend/) | React storefront, login/checkout/admin UI, route tree, styles, logos, banners, posters, category and product images, Vite/Cloudflare Pages build |
| Backend | [`backend/`](./backend/) | Cloudflare Worker REST API, admin/public endpoints, CORS and Cloudflare D1 persistence |

The UI source in `src/routes/`, `src/components/`, `src/hooks/` and browser-only
`src/lib/` now lives in `frontend/src/`. Product/banner/poster assets and the
Vite, TypeScript, ESLint and frontend package configuration moved into
`frontend/` with it. The prior `src/server/admin-api.ts` and
`src/server/admin-store.ts` moved to `backend/src/`; the Worker entrypoint is
`backend/src/index.ts`. The JSON fixture was retained at `backend/data/db.json`;
the Worker reads and writes live data through its D1 binding.

## Local development

Run the backend and frontend in separate terminals:

```powershell
cd backend
npm install
Copy-Item .dev.vars.example .dev.vars
npm run db:apply:local
npm run db:seed:local
npm run dev
```

```powershell
cd frontend
npm install
npm run dev
```

The frontend calls `/api` through the Vite proxy to the local Worker at
`http://127.0.0.1:8787`. Set `VITE_API_PROXY_TARGET` if the backend runs
elsewhere. Local development uses Wrangler's local D1 database, separate from
the XAMPP MySQL database.

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `CORS_ORIGINS` in `backend/.dev.vars`
for local development. Configure the production password as a Worker secret.

The development `.dev.vars` file is intentionally ignored by Git. Keep production
credentials in the deployment platform's secret-variable settings rather
than committing a populated `.dev.vars` file.

## Cloudflare Pages frontend

Set the Pages project root directory to `frontend`, the build command to
`npm run build`, and the output directory to `dist`. Configure
`VITE_API_BASE_URL=https://<your-api-host>/api` as a Pages build environment
variable. If it is not set, the frontend defaults to
`https://duanbackup-api.havandungismeo.workers.dev/api`. For reliable
admin-cookie authentication, use a custom frontend domain and an API hostname
under the same site (for example,
`shop.example.com` and `api.example.com`); browsers may block session cookies
between unrelated third-party domains.

## Backend deployment

Create the D1 database, replace the placeholder `database_id` in
`backend/wrangler.jsonc`, configure the exact production `CORS_ORIGINS`, apply
the remote migrations and deploy the Worker. Full commands and secret setup
are documented in [`backend/README.md`](./backend/README.md).

## API responsibilities

Public JSON endpoints are `GET /api/products`, `GET /api/products/:slug`,
`GET /api/categories`, `GET /api/search?q=...`, and `POST /api/orders`.
Admin endpoints under `/api/admin` retain cookie-based login, dashboard,
orders, notifications/SSE, product, category, coupon, key and banner
management.
