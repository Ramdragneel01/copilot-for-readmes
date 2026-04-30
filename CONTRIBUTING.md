# Contributing

## Setup

```bash
npm install
npm run build
npm run check-types
npm run test
```

## Standards

- Keep generator logic deterministic unless feature requires model usage.
- Add tests for new analyzer signals and template changes.
- Keep CLI/API/extension behavior aligned by reusing core library modules.

## Pull Requests

- one coherent feature/fix per PR
- include tests and docs updates
- use conventional commit style when possible
