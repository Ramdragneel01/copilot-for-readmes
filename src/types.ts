export interface RepoSignals {
    repoPath: string;
    projectName: string;
    description: string;
    packageManager: "npm" | "pnpm" | "yarn" | "bun" | "python" | "mixed" | "unknown";
    languages: string[];
    frameworks: string[];
    scripts: Record<string, string>;
    hasDockerfile: boolean;
    hasCompose: boolean;
    hasCI: boolean;
    hasTests: boolean;
    readmeExists: boolean;
    licenseFile: string | null;
    topLevelEntries: string[];
    sampleFiles: string[];
    quickstartCommands: string[];
    securityHints: string[];
}

export interface GenerateOptions {
    projectName?: string;
    tagline?: string;
}

export interface GenerateResult {
    signals: RepoSignals;
    markdown: string;
}
