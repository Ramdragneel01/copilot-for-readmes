#!/usr/bin/env node
import { Command } from "commander";

import { analyzeRepo } from "./analyze";
import { generateReadme, writeGeneratedReadme } from "./generate";
import { startServer } from "./server";

export function buildProgram(): Command {
    const program = new Command();

    program
        .name("cfr")
        .description("Copilot for READMEs: generate production-grade README files from repo signals.")
        .version("0.1.0");

    program
        .command("analyze")
        .argument("[repoPath]", "Repository path", ".")
        .option("--json", "Print full JSON report", false)
        .action(async (repoPath: string, opts: { json: boolean }) => {
            const signals = await analyzeRepo(repoPath);
            if (opts.json) {
                process.stdout.write(`${JSON.stringify(signals, null, 2)}\n`);
                return;
            }
            process.stdout.write(`Project: ${signals.projectName}\n`);
            process.stdout.write(`Languages: ${signals.languages.join(", ") || "unknown"}\n`);
            process.stdout.write(`Frameworks: ${signals.frameworks.join(", ") || "none"}\n`);
            process.stdout.write(`Has CI: ${signals.hasCI}\n`);
            process.stdout.write(`Has Dockerfile: ${signals.hasDockerfile}\n`);
        });

    program
        .command("generate")
        .argument("[repoPath]", "Repository path", ".")
        .option("--write", "Write output to file", false)
        .option("--out <file>", "Output filename")
        .option("--project-name <name>", "Override project title")
        .option("--tagline <text>", "Override tagline")
        .action(
            async (
                repoPath: string,
                opts: { write: boolean; out?: string; projectName?: string; tagline?: string }
            ) => {
                const result = await generateReadme(repoPath, {
                    projectName: opts.projectName,
                    tagline: opts.tagline
                });
                if (!opts.write) {
                    process.stdout.write(result.markdown);
                    return;
                }

                const out = opts.out ?? (result.signals.readmeExists ? "README.generated.md" : "README.md");
                const target = await writeGeneratedReadme(result.signals.repoPath, result.markdown, out);
                process.stdout.write(`Generated ${target}\n`);
            }
        );

    program
        .command("serve")
        .option("--host <host>", "Bind host", process.env.CFR_HOST ?? "0.0.0.0")
        .option("--port <port>", "Bind port", process.env.CFR_PORT ?? "8092")
        .action(async (opts: { host: string; port: string }) => {
            const app = await startServer({ host: opts.host, port: Number(opts.port) });
            const address = app.server.address();
            process.stdout.write(`copilot-for-readmes API listening on ${JSON.stringify(address)}\n`);
        });

    return program;
}

export async function runCli(argv = process.argv): Promise<void> {
    const program = buildProgram();
    await program.parseAsync(argv);
}

if (require.main === module) {
    runCli().catch((error) => {
        process.stderr.write(`${(error as Error).message}\n`);
        process.exit(1);
    });
}
