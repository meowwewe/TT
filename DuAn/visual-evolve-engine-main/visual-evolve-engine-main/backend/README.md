# Backend

Express REST API and MySQL persistence service.

## Local development

1. Copy `.env.example` to `.env`.
2. Set the MySQL connection and admin credentials for your environment.
3. Ensure the configured MySQL database exists and the application user can
   create tables on first startup.
4. Run `npm install` and `npm run dev`.

The API listens on `PORT` and exposes `/health` and `/api/*` endpoints.
Restrict `CORS_ORIGINS` to the exact frontend origins you deploy. Production
deployments must use HTTPS and override the example admin password.

The API preserves existing routes and response shapes; product and category
catalogue, checkout, admin management, and notification endpoints use MySQL.
