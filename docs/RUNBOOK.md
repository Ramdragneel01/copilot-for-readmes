# Runbook

## Service

- Port: 8092
- Health: GET /health
- Readiness: GET /ready

## Startup

```bash
npm install
npm run build
node dist/cli.js serve --host 0.0.0.0 --port 8092
```

## Docker

```bash
docker build -t copilot-for-readmes .
docker run --rm -p 8092:8092 copilot-for-readmes
```

## Operational Checks

- GET /health returns status=ok
- GET /ready returns status=ready
- POST /v1/analyze on a known repo returns projectName and script map
- POST /v1/generate returns markdown containing expected headings

## Failure Modes

- invalid path: API returns 400
- unreadable repo: API returns 400 with error message

## Recovery

1) Restart container/process.
2) Verify /health and /ready.
3) Replay a known-good /v1/generate request.

## Release

- tag format: vX.Y.Z
- CI publishes GHCR image on tag
