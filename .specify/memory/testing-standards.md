# Testing Standards

## Testing Framework

- **Framework**: Vitest (migrated from Jest for better ESM/CommonJS handling)
- **Coverage**: Minimum 80% coverage required
- **Test Types**: Unit tests, integration tests, contract tests

## Test Structure

### Directory Organization
- **Tests unitaires**: `src/**/__tests__/*.test.ts`
- **Tests d'intégration**: `src/__tests__/integration/`
- **Helpers de test**: `src/__tests__/helpers/`

### Test Categories

1. **Unit Tests**: Individual component and function testing
2. **Integration Tests**: End-to-end CLI workflow validation
3. **Contract Tests**: Go binary integration verification
4. **Coverage Tests**: Ensure minimum coverage thresholds

## Testing Commands

```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run integration tests
npm run test:integration
```

## Test Requirements

- All new features MUST include comprehensive tests
- Contract tests MUST verify Go binary integration
- Integration tests MUST validate end-to-end CLI workflows
- Test coverage MUST exceed 80% with no untested error paths
- Tests co-localized with source code in `__tests__` directories

## Quality Gates

- Tests must pass before any commit
- Coverage reports generated for every test run
- No failing tests allowed in main branch
- Performance tests for critical operations (<200ms requirements)