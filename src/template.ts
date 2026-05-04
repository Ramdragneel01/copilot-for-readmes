import { GenerateOptions, RepoSignals } from "./types";

function h2(text: string): string {
    return `## ${text}`;
}

function code(lines: string[]): string {
    return ["```bash", ...lines, "```"].join("\n");
}

function bullets(items: string[]): string {
    if (items.length === 0) {
        return "- (none detected)";
    }
    return items.map((item) => `- ${item}`).join("\n");
}

function scriptTable(scripts: Record<string, string>): string {
    const names = Object.keys(scripts);
    if (names.length === 0) {
        return "No package scripts detected.";
    }
    const header = "| Script | Command |\n| --- | --- |";
    const rows = names
        .sort()
        .map((name) => `| \`${name}\` | \`${scripts[name]}\` |`)
        .join("\n");
    return `${header}\n${rows}`;
}

function structure(entries: string[]): string {
    if (entries.length === 0) {
        return "```text\n.\n```";
    }
    return ["```text", ".", ...entries.map((entry) => `|- ${entry}`), "```"].join("\n");
}

export function renderReadme(signals: RepoSignals, options: GenerateOptions = {}): string {
    const title = options.projectName?.trim() || signals.projectName;
    const tagline =
        options.tagline?.trim() ||
        `${signals.description}`;

    const sections = [
        `# ${title}`,
        "",
        `> ${tagline}`,
        "",
        h2("Overview"),
        "",
        bullets([
            `Primary stack: ${signals.languages.join(", ") || "Unknown"}`,
            `Detected frameworks: ${signals.frameworks.join(", ") || "None"}`,
            `CI configured: ${signals.hasCI ? "yes" : "no"}`,
            `Dockerized: ${signals.hasDockerfile ? "yes" : "no"}`,
            `Tests detected: ${signals.hasTests ? "yes" : "no"}`
        ]),
        "",
        h2("Quick Start"),
        "",
        code(signals.quickstartCommands),
        "",
        h2("Project Structure"),
        "",
        structure(signals.topLevelEntries),
        "",
        h2("Scripts"),
        "",
        scriptTable(signals.scripts),
        "",
        h2("Security Notes"),
        "",
        bullets(signals.securityHints),
        "",
        h2("Roadmap"),
        "",
        bullets([
            "Add architecture diagram and production runbook",
            "Add release automation and changelog enforcement",
            "Document SLOs and alerting thresholds"
        ]),
        "",
        h2("License"),
        "",
        signals.licenseFile ? `This project is licensed under ${signals.licenseFile}.` : "Add a LICENSE file."
    ];

    return `${sections.join("\n")}\n`;
}
