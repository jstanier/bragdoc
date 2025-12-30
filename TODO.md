# Improvements for Public Release

## High Priority

- [ ] Create `.bragdoc.config.example.json` (referenced in README but missing)
- [ ] Create `.env.example` (referenced in README but missing)
- [ ] Add `LICENSE` file (README claims MIT but file doesn't exist)

## Medium Priority

- [ ] Add missing package.json fields:
  - `author`
  - `license`: "MIT"
  - `repository`: { "type": "git", "url": "https://github.com/jstanier/bragdoc.git" }
  - `homepage`
  - `bugs`
  - `engines`: { "node": ">=18.0.0" }
- [ ] Add test framework (Vitest or Jest) with basic tests for:
  - Configuration loading (`config.ts`)
  - Markdown generation (`generateVerboseMarkdown`)
  - AI provider error handling
- [ ] Add retry logic for API calls (Linear and AI providers)
- [ ] Use async file operations (`fs/promises`) instead of `writeFileSync`

## Low Priority

- [ ] Add `CONTRIBUTING.md` with development setup and PR guidelines
- [ ] Add `CHANGELOG.md` to track versions
- [ ] Set up GitHub Actions CI (lint, typecheck, test)
- [ ] Add `--version` flag to CLI
- [ ] Add `--days` flag to make the 7-day window configurable
- [ ] Add `--dry-run` flag to preview without calling AI
- [ ] Add ESLint with TypeScript rules
