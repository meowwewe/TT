import "dotenv/config";

import cors from "cors";
import express, { type Request, type Response } from "express";
import { handleAdminApi, handlePublicApi } from "./admin-api.js";
import { initializeStore } from "./admin-store.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const host =
  process.env.HOST ||
  (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
if (process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
  throw new Error("ADMIN_PASSWORD must be configured in production");
}
const allowedOrigins = new Set(
  (
    process.env.CORS_ORIGINS ||
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGINS) {
  throw new Error("CORS_ORIGINS must be configured in production");
}

app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api", async (request: Request, response: Response, next) => {
  try {
    const url = `http://${request.headers.host || "localhost"}${request.originalUrl}`;
    const body = ["GET", "HEAD"].includes(request.method)
      ? undefined
      : JSON.stringify(request.body ?? {});
    const headers = new Headers();
    for (const [name, value] of Object.entries(request.headers)) {
      if (Array.isArray(value)) {
        headers.set(name, value.join(", "));
      } else if (value !== undefined) {
        headers.set(name, value);
      }
    }
    const apiRequest = new Request(url, {
      method: request.method,
      headers,
      ...(body === undefined ? {} : { body }),
    });
    const apiResponse = request.path.startsWith("/admin/")
      ? await handleAdminApi(apiRequest)
      : await handlePublicApi(apiRequest);

    response.status(apiResponse.status);
    apiResponse.headers.forEach((value, name) =>
      response.setHeader(name, value),
    );

    if (!apiResponse.body) {
      response.end();
      return;
    }

    const reader = apiResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      response.write(Buffer.from(value));
    }
    response.end();
  } catch (error) {
    next(error);
  }
});

app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);
    response.status(500).json({ error: "Internal server error" });
  },
);

await initializeStore();

app.listen(port, host, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
