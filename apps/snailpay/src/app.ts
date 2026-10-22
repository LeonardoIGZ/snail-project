import express from "express";
import type { HealthResponse } from "@snail-project/contracts";

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    const body: HealthResponse = { status: "ok" };
    res.json(body);
  });
  return app;
}
