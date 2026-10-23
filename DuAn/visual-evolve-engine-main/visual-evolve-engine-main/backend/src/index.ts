/// <reference types="@cloudflare/workers-types" />
import { handleAdminApi, handlePublicApi } from "./admin-api.js";
import type { Env } from "./env.js";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const allowedOrigins = new Set(
      (env.CORS_ORIGINS ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    );
    const withCors = (response: Response): Response => {
      const headers = new Headers(response.headers);
      headers.append("Vary", "Origin");
      if (origin && allowedOrigins.has(origin)) {
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set("Access-Control-Allow-Credentials", "true");
        headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
        headers.set(
          "Access-Control-Allow-Headers",
          request.headers.get("Access-Control-Request-Headers") ?? "Content-Type",
        );
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    };

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    if (url.pathname === "/health") {
      return withCors(new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      }));
    }

    if (url.pathname.startsWith("/api/")) {
      if (url.pathname.startsWith("/api/admin/")) {
        return withCors(await handleAdminApi(request, env));
      }
      return withCors(await handlePublicApi(request, env));
    }

    return withCors(new Response("Not Found", { status: 404 }));
  },
};