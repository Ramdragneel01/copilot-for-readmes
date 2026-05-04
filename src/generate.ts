import { promises as fs } from "node:fs";
import path from "node:path";

import { analyzeRepo } from "./analyze";
import { renderReadme } from "./template";
import { GenerateOptions, GenerateResult } from "./types";

export async function generateReadme(repoPath: string, options: GenerateOptions = {}): Promise<GenerateResult> {
    const signals = await analyzeRepo(repoPath);
    const markdown = renderReadme(signals, options);
    return { signals, markdown };
}

export async function writeGeneratedReadme(
    repoPath: string,
    markdown: string,
    outFile = "README.generated.md"
): Promise<string> {
    const target = path.resolve(repoPath, outFile);
    await fs.writeFile(target, markdown, "utf8");
    return target;
}
