import request from "supertest";
import { describe, it, expect } from "vitest";
import { createApp } from "./app";

describe("GET /health", () => {
  it("responde 200 estatus OK", async () => {
    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
