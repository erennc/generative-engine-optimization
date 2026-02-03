# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-02-03

### Added
- **New Semantic Similarity Metric** - N-gram and Jaccard-based semantic analysis
- **Comprehensive CI/CD pipeline** with GitHub Actions
- **ESLint + Prettier** code quality tools  
- **Enhanced documentation** with advanced usage examples
- **Automated testing** for all metrics (87 tests passing)

### Changed
- **Improved README** with badges, CLI usage, and advanced examples
- **Enhanced error handling** in unused parameter warnings
- **Better TypeScript support** with strict linting rules
- **Updated package metadata** for npm publishing

### Technical
- **Zero dependencies** maintained in core library
- **Monorepo structure** optimized with Turbo + pnpm
- **Type safety** improved with comprehensive type checking
- **Build optimization** with tsup and proper exports

### Performance
- **Bundle size increased** from ~26KB to ~30KB (semantic features)
- **Test coverage** expanded from 74 to 87 tests
- **Development experience** significantly improved

### Developer Experience
- **Hot reload** development with turbo dev
- **Formatted code** with Prettier automatic formatting
- **Linting** with ESLint for code quality
- **Type checking** integrated in build pipeline

## [0.1.0] - 2026-01-31

### Added
- Initial TypeScript implementation
- Core GEO metrics (Word Count, Position-Adjusted)
- Exact and Fuzzy matching algorithms  
- CLI tool with analyze, compare, quick commands
- Comprehensive test suite (74 tests)
- Zero-dependency core library
- Monorepo structure with pnpm + Turbo
- Academic foundation from Princeton GEO paper

### Features
- **Word Count Metric** - Basic visibility measurement
- **Position-Adjusted Metric** - Position bias modeling
- **Exact Matcher** - Precise text matching
- **Fuzzy Matcher** - Levenshtein-based similarity
- **CLI Interface** - Terminal-based analysis
- **Multi-source comparison** - Competitive analysis

### Technical Foundation
- TypeScript 5.3+ with strict types
- Vitest testing framework
- tsup bundling for optimal distribution
- ESM + CJS dual exports
- Professional documentation

### Migration
- Python codebase archived and replaced
- Modern JavaScript ecosystem adoption
- Enhanced developer experience
- Better performance and maintainability