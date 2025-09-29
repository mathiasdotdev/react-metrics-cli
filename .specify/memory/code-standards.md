# Code Standards

## TypeScript Standards

### Strict Mode Requirements
- TypeScript strict mode enabled
- No `any` types except for external library interfaces
- Zero tolerance for type errors in build pipeline
- ESLint + Prettier configuration enforced

### Code Quality
- Coverage minimum 80%
- All new features require comprehensive tests
- Vitest framework for all testing

## Version Management Standards

### File Updates Required
When incrementing version, update **3 files**:
- `package.json` - Version principale
- `CHANGELOG.md` - Nouvelle entrée avec modifications
- `src/__tests__/integration/cli-basic.test.ts` - Test d'expectation de version

### Semantic Versioning
- MAJOR.MINOR.PATCH format strictly followed
- Version bumps must reflect actual change impact
- Not development convenience

## Development Standards

### Project Requirements
- Node.js 22+ minimum
- TypeScript 5.3+ required
- Jenkins pipeline configured for Node.js 22 with npm

### Testing Structure
- **Tests unitaires**: `src/**/__tests__/*.test.ts`
- **Tests d'intégration**: `src/__tests__/integration/`
- **Helpers de test**: `src/__tests__/helpers/`

### Build Standards
- Build before any analysis (prevents errors)
- Ensure binary compatibility and up-to-date status
- Production builds optimized with tsconfig.prod.json

## Environment Configuration

### Development Environment
```bash
# Fichier .env pour configuration Nexus
NEXUS_URL=https://nexus.maif.io
NEXUS_REPOSITORY=react-metrics-artefacts
```

### Security Considerations
- Token encryption with hardcoded secret key in `system.ts` (change for production)
- Binary paths and Nexus configuration hardcoded in `system.ts` (customize per environment)
- AES encryption for credential storage