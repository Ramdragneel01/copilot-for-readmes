import { describe, expect, it } from "vitest";

import { renderReadme } from "../src/template";
import { RepoSignals } from "../src/types";

const baseSignals: RepoSignals = {
    repoPath: "/tmp/repo",
    projectName: "demo-project",
    description: "Demo description",
    packageManager: "npm",
    languages: ["TypeScript", "Markdown"],
    frameworks: ["Fastify", "Vitest"],
    scripts: { build: "tsc", test: "vitest" },
    hasDockerfile: true,
    hasCompose: false,
    hasCI: true,
    hasTests: true,
    readmeExists: false,
    licenseFile: "LICENSE",
    topLevelEntries: ["src", "tests", "package.json"],
    sampleFiles: ["src/index.ts"],
    quickstartCommands: ["npm install", "npm run build", "npm test"],
    securityHints: ["CI present", "Test suite detected"]
};

describe("renderReadme", () => {
    it("renders required sections", () => {
        const md = renderReadme(baseSignals);
        expect(md).toContain("# demo-project");
        expect(md).toContain("## Overview");
        expect(md).toContain("## Quick Start");
        expect(md).toContain("## Project Structure");
        expect(md).toContain("## Scripts");
        expect(md).toContain("## Security Notes");
    });

    it("respects title and tagline overrides", () => {
        const md = renderReadme(baseSignals, {
            projectName: "overridden",
            tagline: "Custom tagline"
        });
        expect(md).toContain("# overridden");
        expect(md).toContain("> Custom tagline");
    });

    it("includes scripts table rows", () => {
        const md = renderReadme(baseSignals);
        expect(md).toContain("| `build` | `tsc` |");
        expect(md).toContain("| `test` | `vitest` |");
    });

    it("handles missing scripts", () => {
        const md = renderReadme({ ...baseSignals, scripts: {} });
        expect(md).toContain("No package scripts detected.");
    });

    it("handles missing license", () => {
        const md = renderReadme({ ...baseSignals, licenseFile: null });
        expect(md).toContain("Add a LICENSE file.");
    });
});
