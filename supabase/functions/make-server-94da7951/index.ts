import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import * as kv from "./kv_store.tsx";
import feedbackRoutes from "./feedback.tsx";
import authRoutes from "./auth.tsx";
import dataRoutes from "./data.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
// Supabase Edge Function routes must include the function name in the path.
app.get("/make-server-94da7951/health", (c) => {
  return c.json({ status: "ok" });
});

// Mount routes
app.route("/", feedbackRoutes);
app.route("/", authRoutes);
app.route("/", dataRoutes);

Deno.serve(app.fetch);
