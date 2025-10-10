# Analyzer Quick Reference Guide

> Quick reference for dead code analyzer patterns and common fixes

## 🎯 Quick Pattern Checklist

### When Adding New Verifier Patterns

```typescript
// ✅ ALWAYS follow this order:
const isValidUsage = (line: string, name: string): boolean => {
  // 1️⃣ Exclude non-code contexts
  if (isComment(line)) return false;
  if (isInStringWithName(line, name)) return false;

  // 2️⃣ Exclude false usages
  if (trimmed.startsWith('export') && trimmed.includes('{')) {
    // Check for export { name } pattern
    return false;
  }

  // 3️⃣ Check SPECIFIC patterns first (most important!)
  if (line.includes(`: ${name}`)) return true;
  if (line.includes(`<${name}>`)) return true;
  if (line.includes(`${name}.`)) return true;
  // ... more specific patterns ...

  // 4️⃣ Return false (or use isCompleteIdentifier as LAST resort)
  return false;
};
```

## 🔍 Common Patterns by Type

### Functions

```typescript
functionName(); // Direct call
functionName.bind(); // Method chaining
callback(functionName); // Passed as argument
onClick = { functionName }; // React callback
```

### Classes

```typescript
new ClassName()                      // Instantiation
extends ClassName                    // Inheritance
implements ClassName                 // Interface implementation
class Foo implements First, ClassName  // Multiple interfaces
instanceof ClassName                 // Type checking
ClassName.staticMethod()            // Static access
Array<ClassName>                     // Generic type
const x: ClassName                   // Type annotation
register(ClassName)                  // Passed as parameter
```

### Types/Interfaces

```typescript
const x: TypeName                    // Annotation
Array<TypeName>                      // Generic
extends TypeName                     // Extends
implements TypeName                  // Implements
value as TypeName                    // Type cast
(x): x is TypeName                   // Type guard
keyof TypeName                       // Keyof operator
typeof TypeName                      // Typeof operator
string | TypeName                    // Union
BaseType & TypeName                  // Intersection
type Alias = TypeName                // Type alias
```

### Constants

```typescript
constantName              // Direct reference
${constantName}           // Template literal interpolation
// NOT: "constantName"    // String literal (excluded)
// NOT: `constantName`    // Template literal text (excluded)
```

### Exports

```typescript
import { exportName } from './path'; // Named import
export { exportName } from './path'; // Re-export

// Must verify source path matches!
```

## 🚨 Common Bugs & Fixes

### Bug #1: Early isCompleteIdentifier() Check

```typescript
// ❌ WRONG: Blocks pattern matching
if (!isCompleteIdentifier(line, name)) return false;
if (line.includes(`: ${name}`)) return true; // Never reached!

// ✅ CORRECT: Check patterns first
if (line.includes(`: ${name}`)) return true;
if (line.includes(`<${name}>`)) return true;
// ... then optionally check isCompleteIdentifier
```

**Why?** If `name = "Result"` and line is `function getResult(): Result`, the identifier check fails because "Result" appears in "getResult".

### Bug #2: Template Literal Interpolations

```typescript
// ❌ WRONG: Treats ${var} as "in string"
if (isInString(line, position)) return false;

// ✅ CORRECT: Check for interpolation context
const dollarBraces = (before.match(/\${/g) || []).length;
const closingBraces = (before.match(/}/g) || []).length;
if (dollarBraces > closingBraces) {
  return false; // In interpolation, not in string
}
```

### Bug #3: Export Path Verification

```typescript
// ❌ WRONG: Doesn't verify source path
if (line.includes(`import { ${name} }`)) return true;

// ✅ CORRECT: Verify import is from correct file
const importPath = fromMatch[1];
const normalizedSource = sourceFilePath.replace(/\\/g, '/');
const resolvedPath = resolveRelativePath(importPath, importingFilePath);
if (sourceWithoutExt === resolvedWithoutExt) return true;
```

### Bug #4: Return True at End

```typescript
// ❌ WRONG: Marks everything as used
if (line.includes(`: ${name}`)) return true;
// ... patterns ...
return true; // BUG! Should be false

// ✅ CORRECT: Return false if no pattern matched
if (line.includes(`: ${name}`)) return true;
// ... patterns ...
return false;
```

## 🧪 Testing Checklist

### Every Verifier Must Test:

- [ ] Basic usage pattern (e.g., `functionName()`)
- [ ] Edge case: Name in comments (`// functionName`)
- [ ] Edge case: Name in strings (`"functionName"`)
- [ ] Edge case: Name as substring (`myFunctionName`)
- [ ] Edge case: Export re-declaration (`export { functionName }`)
- [ ] Multiple patterns in same test file
- [ ] Integration with real code

### Test Template:

```typescript
it('should mark X as used when Y', () => {
  const declaration = createDeclaration('Name', '/test/file.ts');
  const declarations = createDeclarations([declaration]);

  const content = `type Name = string;
const value: Name = "test";`;

  verifyDefinitions(content, declarations);

  expect(declaration.used).toBe(true);
});

it('should NOT mark X as used in comments', () => {
  const declaration = createDeclaration('Name', '/test/file.ts');
  const declarations = createDeclarations([declaration]);

  const content = `type Name = string;
// TODO: use Name here`;

  verifyDefinitions(content, declarations);

  expect(declaration.used).toBe(false);
});
```

## 📋 Pre-Commit Checklist

Before committing analyzer changes:

1. [ ] All unit tests pass (`bun test`)
2. [ ] Integration tests pass
3. [ ] Updated `dead-code-analysis-rules.md` if patterns changed
4. [ ] Added JSDoc comments to new functions
5. [ ] Coverage ≥ 90% for new code
6. [ ] No `return true` bugs (verify last return statement)
7. [ ] Pattern order: exclusions → specific → generic
8. [ ] Tested with real React demo project

## 🔗 Related Files

- **Rules Documentation**: `.specify/memory/dead-code-analysis-rules.md`
- **Architecture**: `.specify/memory/architecture.md`
- **Code Standards**: `.specify/memory/code-standards.md`
- **Detectors**: `src/lib/analysis/detection/detectors/`
- **Verifiers**: `src/lib/analysis/verification/verifiers/`
- **Tests**: `src/lib/analysis/**/__tests__/`

## 🛠️ Useful Commands

```bash
# Run all tests
bun test

# Run specific analyzer tests
bun test verify-definitions.test.ts

# Watch mode
bun test --watch

# Coverage report
bun test --coverage

# Build the CLI
bun run compile

# Analyze React demo
./dist/react-metrics.exe -c ./react-demo
```

## 💡 Pro Tips

1. **Start with specific patterns**: The more specific the pattern, the higher it should be in the code
2. **Test edge cases first**: Write failing tests for edge cases before implementing
3. **Use template strings wisely**: `` `${name}` `` is interpolation (usage), `` `name` `` is literal (not usage)
4. **Path normalization matters**: Always normalize slashes and strip extensions when comparing paths
5. **Line number precision**: Use accurate line numbers for better developer experience
6. **Regex reset**: Always reset `regex.lastIndex = 0` when reusing regex in loops
7. **Comment detection**: Use `isComment()` util, don't reinvent
8. **String detection**: Use `isInStringWithName()` with interpolation handling

## 📊 Analysis Flow

```
1. File Reading
   ↓
2. Detection Phase (detectors/)
   - Scan for declarations
   - Create Declaration objects
   - Mark all as used: false
   ↓
3. Verification Phase (verifiers/)
   - Scan for usage patterns
   - Mark matching declarations as used: true
   ↓
4. Dead Code Report
   - Filter declarations with used: false
   - Generate report
```

## 🎓 Learning Resources

- Read existing verifiers: `verify-definitions.ts` (most complete)
- Study test files: See all edge cases covered
- Integration test: Shows end-to-end behavior
- JSDoc comments: Explain why patterns exist
