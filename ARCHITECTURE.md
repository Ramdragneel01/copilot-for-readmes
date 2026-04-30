# Architecture

## Goal

Provide deterministic README generation that is reproducible in CI and usable through CLI, API, and VS Code.

## Components

- analyze.ts
  - walks the repository, detects ecosystem and operational signals
  - returns normalized RepoSignals
- template.ts
  - renders markdown from RepoSignals and optional title/tagline overrides
- generate.ts
  - orchestrates analyze + template and optional file write
- cli.ts
  - commands: analyze, generate, serve
- server.ts
  - Fastify surface: /health, /ready, /v1/analyze, /v1/generate
- extension.ts
  - VS Code command integration and file write/open flow

## Data Flow

1) Input path enters through CLI, API, or VS Code command.
2) analyzeRepo() extracts project signals from files and manifests.
3) renderReadme() maps signals into a sectioned markdown template.
4) Output is returned or written to README.md/README.generated.md.

## Design Decisions

- Deterministic first pass
  - no LLM call required for baseline quality and repeatability.
- Single core library
  - CLI/API/extension reuse the same generator to avoid drift.
- Safe default write behavior
  - do not overwrite existing README.md by default.

## Extension Points

- Add repository scoring pipeline (README quality score).
- Add pluggable template variants (library, SaaS, ML service).
- Add optional LLM rewrite post-processor for tone/style.
