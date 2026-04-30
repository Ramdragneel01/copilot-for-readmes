# Security Policy

## Reporting a Vulnerability

Please do not open public issues for security problems.

Report via email:
- ramprakashdhulipudi@gmail.com

Include:
- impact and severity estimate
- reproduction steps
- affected version/commit

## Threat Model (v0.1)

In scope:
- Path abuse from untrusted API callers
- Information exposure from repository traversal
- Malformed payloads sent to API endpoints

Out of scope (v0.1):
- built-in authentication and authorization
- sandboxed execution for untrusted repositories

## Security Controls

- API handlers validate and reject invalid repository paths.
- Analyzer reads files only; no command execution.
- Docker image runs as non-root base defaults from node:20-slim runtime.

## Deployment Recommendations

- Place API behind an authenticated gateway.
- Restrict accessible filesystem paths for service account.
- Do not expose generation endpoints on public internet without auth.
- Keep dependencies patched using Dependabot/Renovate.
