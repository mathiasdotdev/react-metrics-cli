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
- TypeScript compilé avec **tsgo** (TypeScript v7/Corsa) pour performance optimale
- Package `@typescript/native-preview` pour compilation native Go (10x plus rapide)
- Jenkins pipeline configured for Node.js 22 with npm

### Testing Structure

- **Tests unitaires**: `src/**/__tests__/*.test.ts`
- **Tests d'intégration**: `src/__tests__/integration/`
- **Helpers de test**: `src/__tests__/helpers/`

### Build Standards

- Build before any analysis (prevents errors)
- Ensure compatibility and up-to-date status
- Production builds optimized with tsconfig.prod.json

## Dead Code Analyzer Standards

### Detector Implementation Rules

When creating or modifying detectors (`src/lib/analysis/detection/detectors/`):

1. **Pattern Matching**:
   - Use regex for declaration patterns
   - Reset `regex.lastIndex = 0` before each line scan
   - Check for string/comment context before matching

2. **Mandatory Exclusions**:
   - Skip lines in comments: `//`, `/*`, `*/`, `*`
   - Skip content in strings: `'...'`, `"..."`, `` `...` ``
   - Skip import/export declarations (unless detector specifically handles them)

3. **Return Format**:
   - Return `Declaration[]` array
   - Use `createDeclaration()` helper for consistency
   - Include accurate line numbers and column positions

4. **Edge Cases to Handle**:
   - Multiline declarations
   - Destructuring patterns
   - Default parameters
   - Type annotations

### Verifier Implementation Rules

When creating or modifying verifiers (`src/lib/analysis/verification/verifiers/`):

1. **Usage Pattern Matching**:
   - **Check specific patterns BEFORE generic checks**
   - Specific patterns (e.g., `: TypeName`, `instanceof ClassName`) should be checked first
   - Generic `isCompleteIdentifier()` should be avoided or used as a last resort
   - **Critical**: If the name can appear as a substring elsewhere, check patterns first

2. **Pattern Order Example** (from verify-definitions.ts):

   ```typescript
   // ✅ CORRECT: Check patterns first
   if (line.includes(`: ${name}`)) return true;
   if (line.includes(`<${name}>`)) return true;
   // ... more patterns ...

   // ❌ WRONG: Early generic check blocks pattern matching
   if (!isCompleteIdentifier(line, name)) return false; // Don't do this early!
   ```

3. **Common Patterns to Check**:
   - Type annotations: `: Name`
   - Generics: `<Name>`, `<Name,`, `, Name>`
   - Operators: `extends`, `implements`, `as`, `is`, `keyof`, `typeof`
   - Union/Intersection: `| Name`, `& Name`
   - Function calls: `Name()`
   - Property access: `Name.`
   - Parameters: `(Name)`, `, Name)`

4. **Mandatory Validations**:
   - Skip comment lines via `isComment()`
   - Skip string content via `isInStringWithName()`
   - Skip export re-declarations: `export { Name }`
   - Ignore declaration line itself (compare line numbers)

5. **Template Literals**:
   - Handle interpolations: `${name}` is usage, `` `name` `` is not
   - Use special logic to count `${` and `}` to detect interpolation context

6. **Path Resolution** (for exports):
   - Normalize paths: backslashes to forward slashes
   - Resolve relative paths: `./`, `../`
   - Strip file extensions: `.ts`, `.tsx`, `.js`, `.jsx`
   - Compare normalized paths for import matching

### Testing Requirements for Analyzers

Each detector/verifier **must have**:

1. **Unit Tests** (`__tests__/` directory):
   - Basic detection/verification cases
   - Edge cases (comments, strings, multiline)
   - False positive prevention tests
   - False negative prevention tests

2. **Test Coverage**:
   - Minimum 90% coverage for analyzers
   - All usage patterns must have test cases
   - All exclusion rules must have test cases

3. **Integration Tests**:
   - Real-world React demo project analysis
   - Cross-file verification (especially for exports)
   - End-to-end validation of detection + verification

### Common Pitfalls to Avoid

1. **❌ Using `isCompleteIdentifier()` too early**:
   - Problem: Blocks pattern matching when name appears as substring
   - Example: `getResult()` contains "Result", blocking `: Result` pattern
   - Solution: Check specific patterns first, use `isCompleteIdentifier()` last or not at all

2. **❌ Not handling template literal interpolations**:
   - Problem: `` `${constant}` `` incorrectly marked as "in string"
   - Solution: Count `${` and `}` to detect interpolation context

3. **❌ Not verifying import source paths**:
   - Problem: Export `foo` in file A marked as used when file B imports different `foo`
   - Solution: Resolve and compare file paths when checking imports

4. **❌ Ignoring multiline patterns**:
   - Problem: Missing declarations/usages that span multiple lines
   - Solution: Handle line continuations, track brace depth

5. **❌ Hardcoding line numbers in tests**:
   - Problem: Tests break when source files change
   - Solution: Use relative checks or regenerate expected results

### Pattern Matching Best Practices

```typescript
// ✅ GOOD: Specific patterns checked first
const isValidUsage = (line: string, name: string): boolean => {
  // 1. Exclusions first
  if (isComment(line)) return false;
  if (isInStringWithName(line, name)) return false;

  // 2. Specific patterns (order matters!)
  if (line.includes(`: ${name}`)) return true;
  if (line.includes(`<${name}>`)) return true;
  if (line.includes(`| ${name}`)) return true;

  // 3. Generic check LAST (if needed)
  // Usually better to return false than use isCompleteIdentifier
  return false;
};

// ❌ BAD: Generic check blocks specific patterns
const isValidUsage = (line: string, name: string): boolean => {
  if (!isCompleteIdentifier(line, name)) return false; // Too early!

  if (line.includes(`: ${name}`)) return true; // Never reached if substring!
  return true; // Incorrectly marks everything as used
};
```

### Documentation Requirements

When adding/modifying analyzers:

1. Update `dead-code-analysis-rules.md` with new patterns
2. Add JSDoc comments explaining the pattern matching logic
3. Document any edge cases or limitations
4. Update integration test expectations if needed
