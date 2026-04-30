import { describe, expect, it } from "vitest";

import { createServer } from "../src/server";
import { makeTempRepo, removeTempRepo } from "./test-utils";

describe("createServer", () => {
  it("responds to health and ready", async () => {
    const app = createServer();
    try {
      const health = await app.inject({ method: "GET", url: "/health" });
      const ready = await app.inject({ method: "GET", url: "/ready" });
      expect(health.statusCode).toBe(200);
      expect(ready.statusCode).toBe(200);
      expect(health.json().status).toBe("ok");
      expect(ready.json().status).toBe("ready");
    } finally {
      await app.close();
    }
  });

  it("analyzes a repo via API", async () => {
    const repo = await makeTempRepo({
      "package.json": JSON.stringify({ name: "api-demo", scripts: { test: "vitest" } })
    });
    const app = createServer();
    try {
      const response = await app.inject({
        method: "POST",
        url: "/v1/analyze",
        payload: { repoPath: repo }
      });
      expect(response.statusCode).toBe(200);
      expect(response.json().signals.projectName).toBe("api-demo");
    } finally {
      await app.close();
      await removeTempRepo(repo);
    }
  });

  it("returns 400 for invalid analyze path", async () => {
    const app = createServer();
    try {
      const response = await app.inject({
        method: "POST",
        url: "/v1/analyze",
        payload: { repoPath: "/no/such/path" }
      });
      expect(response.statusCode).toBe(400);
      expect(response.json().error.message).toContain("does not exist");
    } finally {
      await app.close();
    }
  });

  it("generates markdown via API", async () => {
    const repo = await makeTempRepo({
      "package.json": JSON.stringify({ name: "api-generate" }),
      "src/index.ts": "export const ok = true;\n"
    });
    const app = createServer();
    try {
      const response = await app.inject({
        method: "POST",
        url: "/v1/generate",
        payload: { repoPath: repo, projectName: "Fancy" }
      });
      expect(response.statusCode).toBe(200);
      expect(response.json().markdown).toContain("# Fancy");
      expect(response.json().signals.projectName).toBe("api-generate");
    } finally {
      await app.close();
      await removeTempRepo(repo);
    }
  });

  it("returns 400 for invalid generate path", async () => {
    const app = createServer();
    try {
      const response = await app.inject({
        method: "POST",
        url: "/v1/generate",
        payload: { repoPath: "/missing/repo" }
      });
      expect(response.statusCode).toBe(400);
      expect(response.json().error.message).toContain("does not exist");
    } finally {
      await app.close();
    }
  });
});
