# Frontend

Static React/TanStack Router storefront, ready for Cloudflare Pages.

## Local development

1. Start the API in `../backend` with `npm run dev`.
2. Copy `.env.example` to `.env.local` when the API is not running on `http://127.0.0.1:8787`.
3. Run `npm install` and `npm run dev`.

The Vite development server proxies `/api` requests to the backend. For Pages,
set `VITE_API_BASE_URL` to the deployed API's base URL, such as
`https://api.example.com/api`, before building.

Build with `npm run build`; Cloudflare Pages serves the generated `dist/`
directory. Pages' SPA fallback handles direct visits to application routes.
