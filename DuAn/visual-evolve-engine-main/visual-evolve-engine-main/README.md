# DuAnBackup

The project is split into two independently installable applications:

| Area | Location | Responsibilities |
| --- | --- | --- |
| Frontend | [`frontend/`](./frontend/) | React storefront, login/checkout/admin UI, route tree, styles, logos, banners, posters, category and product images, Vite/Cloudflare Pages build |
| Backend | [`backend/`](./backend/) | Express REST API, admin/public endpoints, CORS, environment configuration, MySQL access and schema initialization |

The UI source in `src/routes/`, `src/components/`, `src/hooks/` and browser-only
`src/lib/` now lives in `frontend/src/`. Product/banner/poster assets and the
Vite, TypeScript, ESLint and frontend package configuration moved into
`frontend/` with it. The prior `src/server/admin-api.ts` and
`src/server/admin-store.ts` moved to `backend/src/`; the Express entrypoint is
`backend/src/index.ts`. The JSON fixture was retained at `backend/data/db.json`;
live API reads and writes now use MySQL instead.

## Local development

Run the backend and frontend in separate terminals:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

```powershell
cd frontend
npm install
npm run dev
```

The frontend calls `/api` through the Vite proxy to `http://localhost:3001`.
Set `VITE_API_PROXY_TARGET` if the backend runs elsewhere. The API connection
defaults to the existing XAMPP database `duanbackup`; set `DB_HOST`, `DB_PORT`,
`DB_NAME`, `DB_USER`, and `DB_PASSWORD` in `backend/.env` to override it.

Local admin defaults are `admin@namnguyen.local` / `Admin@123`; configure
`ADMIN_EMAIL` and `ADMIN_PASSWORD` before deploying.

The development `.env` is intentionally ignored by Git. Keep production
credentials in the deployment platform's secret-variable settings rather
than committing a populated `.env` file.

## Cloudflare Pages frontend

Set the Pages project root directory to `frontend`, the build command to
`npm run build`, and the output directory to `dist`. Configure
`VITE_API_BASE_URL=https://<your-api-host>/api` as a Pages build environment
variable. For reliable admin-cookie authentication, use a custom frontend
domain and an API hostname under the same site (for example,
`shop.example.com` and `api.example.com`); browsers may block session cookies
between unrelated third-party domains.

## Backend deployment

Deploy `backend/` as a Node.js service (Node 20+), install its dependencies and
run `npm start`. Set `HOST=0.0.0.0` if the platform requires binding all
interfaces, `PORT`, `CORS_ORIGINS` (the exact Pages origin),
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, and the `DB_*` MySQL connection variables.
Create the target database and grant the application user table-creation
permissions for the initial schema setup.

## API responsibilities

Public JSON endpoints are `GET /api/products`, `GET /api/products/:slug`,
`GET /api/categories`, `GET /api/search?q=...`, and `POST /api/orders`.
Admin endpoints under `/api/admin` retain cookie-based login, dashboard,
orders, notifications/SSE, product, category, coupon, key and banner
management.
