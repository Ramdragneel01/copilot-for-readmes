import { promises as fs } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { generateReadme, writeGeneratedReadme } from "../src/generate";
import { makeTempRepo, removeTempRepo } from "./test-utils";

describe("generateReadme", () => {
    it("generates markdown from repo", async () => {
        const repo = await makeTempRepo({
            "package.json": JSON.stringify({ name: "gen-demo", scripts: { test: "vitest" } }),
            "src/index.ts": "export {};\n"
        });
        try {
            const result = await generateReadme(repo);
            expect(result.signals.projectName).toBe("gen-demo");
            expect(result.markdown).toContain("# gen-demo");
            expect(result.markdown).toContain("## Quick Start");
        } finally {
            await removeTempRepo(repo);
        }
    });

    it("applies option overrides", async () => {
        const repo = await makeTempRepo({
            "package.json": JSON.stringify({ name: "gen-demo" })
        });
        try {
            const result = await generateReadme(repo, { projectName: "Custom Name", tagline: "Custom Tagline" });
            expect(result.markdown).toContain("# Custom Name");
            expect(result.markdown).toContain("> Custom Tagline");
        } finally {
            await removeTempRepo(repo);
        }
    });

    it("writes generated markdown to file", async () => {
        const repo = await makeTempRepo({ "package.json": JSON.stringify({ name: "writer" }) });
        try {
            const { markdown } = await generateReadme(repo);
            const file = await writeGeneratedReadme(repo, markdown, "README.generated.md");
            expect(path.basename(file)).toBe("README.generated.md");
            const written = await fs.readFile(file, "utf8");
            expect(written).toContain("# writer");
        } finally {
            await removeTempRepo(repo);
        }
    });

    it("throws on invalid repo path", async () => {
        await expect(generateReadme("/invalid/repo/path")).rejects.toThrow();
    });
});
