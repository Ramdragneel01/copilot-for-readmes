import { promises as fs } from "node:fs";
import path from "node:path";

import { RepoSignals } from "./types";

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".venv",
  "venv",
  "__pycache__",
  ".next",
  "storybook-static"
]);

const LANGUAGE_BY_EXT: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".py": "Python",
  ".go": "Go",
  ".rs": "Rust",
  ".java": "Java",
  ".kt": "Kotlin",
  ".swift": "Swift",
  ".rb": "Ruby",
  ".php": "PHP",
  ".cs": "C#",
  ".cpp": "C++",
  ".c": "C",
  ".md": "Markdown",
  ".yml": "YAML",
  ".yaml": "YAML",
  ".json": "JSON"
};

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function readJson(target: string): Promise<Record<string, unknown> | null> {
  try {
    const raw = await fs.readFile(target, "utf8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function walkFiles(root: string, maxFiles = 3000): Promise<string[]> {
  const out: string[] = [];

  async function visit(dir: string): Promise<void> {
    if (out.length >= maxFiles) {
      return;
    }
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (out.length >= maxFiles) {
        return;
      }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name)) {
          await visit(full);
        }
        continue;
      }
      out.push(full);
    }
  }

  await visit(root);
  return out;
}

function detectPackageManager(repoPath: string, hasPackageJson: boolean, hasPyproject: boolean): RepoSignals["packageManager"] {
  const hasPnpm = require("node:fs").existsSync(path.join(repoPath, "pnpm-lock.yaml"));
  const hasYarn = require("node:fs").existsSync(path.join(repoPath, "yarn.lock"));
  const hasNpm = require("node:fs").existsSync(path.join(repoPath, "package-lock.json"));

  if (hasPackageJson && hasPyproject) {
    return "mixed";
  }
  if (hasPnpm) {
    return "pnpm";
  }
  if (hasYarn) {
    return "yarn";
  }
  if (hasNpm || hasPackageJson) {
    return "npm";
  }
  if (hasPyproject) {
    return "python";
  }
  return "unknown";
}

function detectFrameworks(pkg: Record<string, unknown> | null, files: string[]): string[] {
  const deps = {
    ...(((pkg?.dependencies as Record<string, string> | undefined) ?? {})),
    ...(((pkg?.devDependencies as Record<string, string> | undefined) ?? {}))
  };

  const frameworks = new Set<string>();
  const keys = Object.keys(deps);
  const has = (name: string) => keys.includes(name);

  if (has("react")) frameworks.add("React");
  if (has("next")) frameworks.add("Next.js");
  if (has("fastify")) frameworks.add("Fastify");
  if (has("express")) frameworks.add("Express");
  if (has("fastapi")) frameworks.add("FastAPI");
  if (has("langchain") || has("@langchain/core")) frameworks.add("LangChain");
  if (has("vitest")) frameworks.add("Vitest");
  if (has("pytest")) frameworks.add("Pytest");

  if (files.some((f) => f.endsWith("pyproject.toml"))) frameworks.add("Python Packaging");
  if (files.some((f) => f.endsWith("Dockerfile"))) frameworks.add("Docker");

  return [...frameworks].sort();
}

function detectLanguages(files: string[]): string[] {
  const langs = new Set<string>();
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const lang = LANGUAGE_BY_EXT[ext];
    if (lang) {
      langs.add(lang);
    }
  }
  return [...langs].sort();
}

function defaultDescription(projectName: string): string {
  return `Production-ready README generation toolkit for ${projectName}.`;
}

export async function analyzeRepo(repoPathInput: string): Promise<RepoSignals> {
  const repoPath = path.resolve(repoPathInput || process.cwd());
  const stat = await fs.stat(repoPath).catch(() => null);
  if (!stat || !stat.isDirectory()) {
    throw new Error(`Repository path does not exist or is not a directory: ${repoPath}`);
  }

  const packageJsonPath = path.join(repoPath, "package.json");
  const pyprojectPath = path.join(repoPath, "pyproject.toml");
  const reqPath = path.join(repoPath, "requirements.txt");

  const [pkg, hasPyproject, hasRequirements, hasReadme, hasDockerfile, hasCompose, hasCI] = await Promise.all([
    readJson(packageJsonPath),
    pathExists(pyprojectPath),
    pathExists(reqPath),
    pathExists(path.join(repoPath, "README.md")),
    pathExists(path.join(repoPath, "Dockerfile")),
    pathExists(path.join(repoPath, "docker-compose.yml")),
    pathExists(path.join(repoPath, ".github", "workflows"))
  ]);

  const allFiles = await walkFiles(repoPath);
  const relFiles = allFiles.map((f) => path.relative(repoPath, f));

  const topLevelEntries = (await fs.readdir(repoPath)).sort();
  const scripts = ((pkg?.scripts as Record<string, string> | undefined) ?? {});

  const hasTests =
    topLevelEntries.includes("tests") ||
    topLevelEntries.includes("__tests__") ||
    Object.keys(scripts).some((s) => s.includes("test")) ||
    relFiles.some((f) => f.includes("test_") || f.endsWith(".test.ts") || f.endsWith(".spec.ts"));

  const projectName =
    (typeof pkg?.name === "string" && pkg.name.trim()) ||
    path.basename(repoPath);

  const description =
    (typeof pkg?.description === "string" && pkg.description.trim()) ||
    defaultDescription(projectName);

  const quickstartCommands: string[] = [];
  const packageManager = detectPackageManager(repoPath, !!pkg, hasPyproject || hasRequirements);
  if (packageManager === "npm") quickstartCommands.push("npm install", "npm run build", "npm test");
  if (packageManager === "pnpm") quickstartCommands.push("pnpm install", "pnpm build", "pnpm test");
  if (packageManager === "yarn") quickstartCommands.push("yarn", "yarn build", "yarn test");
  if (packageManager === "python") quickstartCommands.push("pip install -r requirements.txt", "python -m pytest");
  if (packageManager === "mixed") quickstartCommands.push("npm install", "pip install -r requirements.txt");
  if (quickstartCommands.length === 0) quickstartCommands.push("<add build + test commands>");

  const licenseFile = topLevelEntries.find((e) => e.toLowerCase() === "license") ?? null;

  const securityHints: string[] = [];
  if (hasDockerfile) securityHints.push("Containerized runtime with reproducible environment");
  if (hasCI) securityHints.push("Automated CI workflows present under .github/workflows");
  if (hasTests) securityHints.push("Test suite detected");
  if (topLevelEntries.includes("SECURITY.md")) securityHints.push("Security policy documented");

  return {
    repoPath,
    projectName,
    description,
    packageManager,
    languages: detectLanguages(relFiles),
    frameworks: detectFrameworks(pkg, relFiles),
    scripts,
    hasDockerfile,
    hasCompose,
    hasCI,
    hasTests,
    readmeExists: hasReadme,
    licenseFile,
    topLevelEntries: topLevelEntries.slice(0, 30),
    sampleFiles: relFiles.slice(0, 80),
    quickstartCommands,
    securityHints
  };
}
