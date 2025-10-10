# Build Workflows

## Version Management

When making changes, follow this strict discipline:

- Always update the CHANGELOG.md file and the package.json version
- Check the previous version to see what has changed, so that you don't repeat yourself
- Build BEFORE running any analysis - prevents errors and ensures the binary is up to date

### Changelog Categories

- **Added**: New features that don't exist in the previous version
- **Changed**: Changes to features that exist in the previous version
- **Fixed**: Fixes for bugs that exist in the previous version
- **Technical**: Technical changes that don't exist in the previous version

Keep entries brief and to the point (don't add too many details).

## Build Commands

```bash
# Build TypeScript to JavaScript (utilise tsgo - TypeScript v7/Corsa en Go)
npm run build

# Production build (optimized, utilise tsgo pour performance x10)
npm run build:prod

# Bundle analysis
npm run build:analyze

# Clean build artifacts
npm run clean

# Complete preparation for publishing
npm run prepublishOnly
```

## Compilateur TypeScript

Le projet utilise **tsgo** (TypeScript v7 / Corsa), le nouveau compilateur TypeScript réécrit en Go :

- **Package** : `@typescript/native-preview`
- **Performance** : Jusqu'à 10x plus rapide que `tsc` traditionnel
- **Commande** : `npx tsgo --project ./tsconfig.json`
- **Compatibilité** : TypeScript 5.9.2 conservé pour tooling (`tsc --init`, `ts-node`)

## Version Management Commands

```bash
# Update version in package.json, CHANGELOG.md, and test files
# Three files must be updated for each version:
# - package.json (main version)
# - CHANGELOG.md (new entry with modifications)
# - src/__tests__/integration/cli-basic.test.ts (version expectation test)
```

## CI/CD Patterns

- Jenkins pipeline configured for Node.js 22 with npm
- Node.js 22+ and TypeScript 5.3+ required
- Build verification before any deployment
- Automated testing with Vitest framework
