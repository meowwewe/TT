/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  STORAGE?: R2Bucket;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  CORS_ORIGINS?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
}
