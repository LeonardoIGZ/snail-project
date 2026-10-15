import { describe, expect, it } from "vitest";
import { healthResponseSchema } from "./index";

describe("health response schema", () => {
    it("health response responde bien", () => {
        const data = { status: "ok" };
        expect(healthResponseSchema.safeParse(data).success).toBe(true);
    });

    it("health response falla con otro dato", () => {
        const data = { status: "COOL" };
        expect(healthResponseSchema.safeParse(data).success).toBe(false);
    });
});
