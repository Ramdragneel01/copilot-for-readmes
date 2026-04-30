# copilot-for-readmes

Generate production-grade README files directly from repository signals.

This project ships three operator surfaces:
- CLI: analyze a repo and generate markdown in one command.
- API: Fastify service for health/readiness and generation endpoints.
- VS Code command: generate README from the current workspace.

[![CI](https://github.com/Ramdragneel01/copilot-for-readmes/actions/workflows/ci.yml/badge.svg)](https://github.com/Ramdragneel01/copilot-for-readmes/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why

Most README generators produce shallow boilerplate because they only use prompts. This one starts with deterministic repository analysis:
- package manager and scripts
- languages and framework hints
- CI, Docker, tests, and security signal detection
- top-level structure and quickstart command synthesis

Then it renders a structured README template designed for production repos.

## Quick Start

```bash
npm install
npm run build
```

Analyze your repo:

```bash
npx tsx src/cli.ts analyze . --json
```

Generate markdown to stdout:

```bash
npx tsx src/cli.ts generate .
```

Write file output:

```bash
npx tsx src/cli.ts generate . --write --out README.generated.md
```

Run API server:

```bash
npx tsx src/cli.ts serve --host 0.0.0.0 --port 8092
```

Run tests:

```bash
npm run test
npm run test:coverage
```

## VS Code Command

After building, the extension command is available:
- Command: Copilot for READMEs: Generate README
- Command ID: copilotForReadmes.generateReadme

Behavior:
- If README.md exists, writes README.generated.md
- If README.md is missing, writes README.md

## API Endpoints

- GET /health
- GET /ready
- POST /v1/analyze
- POST /v1/generate

Example request:

```bash
curl -X POST http://localhost:8092/v1/generate \
  -H "content-type: application/json" \
  -d '{"repoPath":"/workspace/your-repo","projectName":"Custom Name"}'
```

## Docker

```bash
docker build -t copilot-for-readmes .
docker run --rm -p 8092:8092 copilot-for-readmes
```

Or:

```bash
docker compose up --build
```

## Example Output

See examples/generated-readme-sample.md.

## Security and Ops

- Security policy: SECURITY.md
- Architecture details: ARCHITECTURE.md
- Production runbook: docs/RUNBOOK.md

## Roadmap

- Add model-backed section rewriting with style presets.
- Add diagram extraction from code and infra manifests.
- Add docs lint scoring and README quality gates.

## License

MIT
