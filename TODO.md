# Improvements for Public Release

## Completed

- [x] Create `.bragdoc.config.example.json`
- [x] Create `.env.example`
- [x] Add `LICENSE` file (MIT)
- [x] Add missing package.json fields (author, license, repository, homepage, bugs, engines)
- [x] Add retry logic for API calls (with exponential backoff)
- [x] Use async file operations (`fs/promises`)
- [x] Add `--version` flag to CLI
- [x] Add `--days` flag to make the lookback period configurable
- [x] Add `--dry-run` flag to preview without calling AI
- [x] Update README with all new features

## Future Improvements

- [ ] Add `CONTRIBUTING.md` with development setup and PR guidelines
- [ ] Add `CHANGELOG.md` to track versions
- [ ] Set up GitHub Actions CI (lint, typecheck, test)
- [ ] Add test framework (Vitest or Jest) with basic tests
- [ ] Add ESLint with TypeScript rules
