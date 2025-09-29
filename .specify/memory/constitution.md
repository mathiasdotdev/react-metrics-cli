<!--
Sync Impact Report:
Version change: template → 1.0.0
Modified principles: All principles derived from CLAUDE.md project documentation
Added sections: All core principles for React-Metrics CLI
Removed sections: None (first concrete version)
Templates requiring updates: ✅ checked - all templates align with constitution principles
Follow-up TODOs: None - all placeholders filled from project context
-->

# React-Metrics CLI Constitution

## Core Principles

### I. Build-First Development
Every operation MUST begin with a successful build to prevent runtime errors and ensure binary compatibility. The build command (`npm run build`) MUST complete without errors before running analysis, tests, or deployment operations.

**Rationale**: The CLI downloads and executes Go binaries that must match the TypeScript interface contracts. Compilation errors caught early prevent production failures and ensure type safety throughout the analysis pipeline.

### II. TypeScript Quality (NON-NEGOTIABLE)
All code MUST be written in TypeScript 5.3+ with strict type checking enabled. No `any` types allowed except for external library interfaces. Build pipeline MUST include linting and type checking with zero tolerance for type errors.

**Rationale**: Type safety is critical when interfacing with external Go binaries and handling user file system operations. Runtime type errors in CLI tools create poor user experience and data integrity risks.

### III. Version Management Discipline
MAJOR.MINOR.PATCH semantic versioning MUST be strictly followed. Every change MUST update both `package.json` version and `CHANGELOG.md` with categorized entries (Added/Changed/Fixed/Technical). Version bumps MUST reflect actual change impact, not development convenience.

**Rationale**: The CLI is distributed as an npm package and integrates with external Nexus repositories. Inconsistent versioning breaks dependency management and deployment pipelines for enterprise users.

### IV. Platform-Specific Binary Management
Binary downloads MUST support all target platforms (Windows/Linux/macOS, x64/ARM64) with automatic detection and secure storage in platform-appropriate directories. Nexus authentication MUST use AES-256-CBC encryption with random IV, never plaintext storage.

**Rationale**: Enterprise environments require cross-platform support and secure credential handling. Hardcoded paths or insecure token storage violates security compliance and limits deployment flexibility.

### V. CLI Interface Consistency
All commands MUST follow Commander.js patterns with consistent option naming (`--debug`, `--output`, `--no-dry-run`). Error messages MUST use stderr, success output to stdout. All operations MUST provide clear feedback via Chalk colors and Ora spinners.

**Rationale**: CLI tools are automation targets in CI/CD pipelines. Inconsistent interfaces break scripts and reduce user adoption. Clear output separation enables proper log parsing and error handling.

## Security Requirements

All credential storage MUST use AES-256-CBC encryption with scrypt key derivation. No hardcoded encryption keys in production. Token storage directory MUST be `~/.nexus-utils/` with appropriate file permissions (600). No credentials MUST ever be logged or written to debug output.

**Rationale**: The CLI handles enterprise Nexus authentication tokens that provide repository access. Credential compromise could expose sensitive artifacts and violate enterprise security policies.

## Quality Gates

Every feature MUST include comprehensive tests using Vitest framework. Contract tests MUST verify Go binary integration. Unit tests MUST cover all TypeScript modules. Integration tests MUST validate end-to-end CLI workflows. Test coverage MUST exceed 80% with no untested error paths.

**Rationale**: CLI tools are difficult to debug in production environments. Comprehensive testing prevents regressions and ensures reliable operation across diverse enterprise environments and edge cases.

## Governance

This constitution supersedes all other development practices and architectural decisions. All code reviews MUST verify constitutional compliance before approval. Any complexity that violates these principles MUST be explicitly justified in PR descriptions with simpler alternatives considered and rejected.

Amendments require documentation in this file with version bump according to semantic versioning rules. Breaking changes to core principles require MAJOR version increment. New principles or expanded guidance require MINOR version increment.

## CLI Feature Standards

The React-Metrics CLI MUST maintain five core commands following Commander.js patterns:

### Core Commands
- **`analyze` (default)**: Analyzes React projects for dead code
- **`coverage`**: Analyzes test coverage with HTML reports
- **`download`**: Downloads Nexus artifacts with custom parameters
- **`upload`**: Uploads binaries to Nexus Repository
- **`config`**: Manages configuration and tokens

All commands MUST support consistent option patterns (`--debug`, `--output`, `--no-dry-run`) and provide clear feedback via Chalk colors and Ora spinners.

## Changelog Discipline

All version changes MUST follow strict changelog categorization:

### Required Categories
- **Added**: New features that don't exist in the previous version
- **Changed**: Changes to features that exist in the previous version
- **Fixed**: Fixes for bugs that exist in the previous version
- **Technical**: Technical changes that don't exist in the previous version

### Changelog Rules
- Be brief and to the point (don't add too many details)
- Check previous version to avoid repetition
- Every change MUST update both `package.json` version and `CHANGELOG.md`
- Version bumps MUST reflect actual change impact, not development convenience

For runtime development guidance, see `.specify/memory/` files for architecture details, dependency management, and common development workflows.

**Version**: 1.1.0 | **Ratified**: 2025-09-28 | **Last Amended**: 2025-09-28