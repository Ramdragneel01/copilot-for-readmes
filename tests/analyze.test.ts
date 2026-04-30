import { describe, expect, it } from "vitest";

import { analyzeRepo } from "../src/analyze";
import { makeTempRepo, removeTempRepo } from "./test-utils";

describe("analyzeRepo", () => {
  it("detects a TypeScript/Fastify project", async () => {
    const repo = await makeTempRepo({
      "package.json": JSON.stringify(
        {
          name: "demo-service",
          description: "Demo service",
          scripts: { build: "tsc", test: "vitest" },
          dependencies: { fastify: "^4.0.0", react: "^18.0.0" }
        },
        null,
        2
      ),
      "src/index.ts": "export const x = 1;\n",
      "tests/app.test.ts": "// test\n",
      "Dockerfile": "FROM node:20\n",
      ".github/workflows/ci.yml": "name: ci\n"
    });

    try {
      const signals = await analyzeRepo(repo);
      expect(signals.projectName).toBe("demo-service");
      expect(signals.languages).toContain("TypeScript");
      expect(signals.frameworks).toContain("Fastify");
      expect(signals.frameworks).toContain("React");
      expect(signals.hasDockerfile).toBe(true);
      expect(signals.hasCI).toBe(true);
      expect(signals.hasTests).toBe(true);
      expect(signals.packageManager).toBe("npm");
    } finally {
      await removeTempRepo(repo);
    }
  });

  it("detects python package manager", async () => {
    const repo = await makeTempRepo({
      "pyproject.toml": "[project]\nname='py-tool'\n",
      "requirements.txt": "fastapi==0.115.0\n",
      "app.py": "print('ok')\n"
    });
    try {
      const signals = await analyzeRepo(repo);
      expect(signals.packageManager).toBe("python");
      expect(signals.languages).toContain("Python");
      expect(signals.quickstartCommands.join(" ")).toContain("pytest");
    } finally {
      await removeTempRepo(repo);
    }
  });

  it("returns unknown package manager for plain repo", async () => {
    const repo = await makeTempRepo({ "main.go": "package main\n" });
    try {
      const signals = await analyzeRepo(repo);
      expect(signals.packageManager).toBe("unknown");
      expect(signals.quickstartCommands[0]).toContain("add build");
    } finally {
      await removeTempRepo(repo);
    }
  });

  it("throws on missing path", async () => {
    await expect(analyzeRepo("/definitely/missing/path")).rejects.toThrow();
  });

  it("detects readme and license when present", async () => {
    const repo = await makeTempRepo({
      "README.md": "# hello\n",
      "LICENSE": "MIT\n",
      "index.js": "console.log('x')\n"
    });
    try {
      const signals = await analyzeRepo(repo);
      expect(signals.readmeExists).toBe(true);
      expect(signals.licenseFile).toBe("LICENSE");
    } finally {
      await removeTempRepo(repo);
    }
  });

  it("records security hints based on detected files", async () => {
    const repo = await makeTempRepo({
      "SECURITY.md": "policy\n",
      "Dockerfile": "FROM node:20\n",
      ".github/workflows/ci.yml": "name: ci\n",
      "tests/a.test.ts": ""
    });
    try {
      const signals = await analyzeRepo(repo);
      expect(signals.securityHints.length).toBeGreaterThanOrEqual(3);
    } finally {
      await removeTempRepo(repo);
    }
  });
});
