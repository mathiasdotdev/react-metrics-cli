# Dead Code Analysis Rules

## Overview

React-Metrics CLI uses a 2-pass analysis system:

1. **Detection Phase**: Identifies all declarations in the codebase
2. **Verification Phase**: Marks declarations as "used" based on usage patterns

Any declaration not marked as "used" after verification is reported as dead code.

---

## 1. Functions Analysis

### Detection Rules (detect-functions.ts)

- **Classic functions**: `function functionName(...)`
- **Arrow functions**: `const functionName = (...) =>`
- **Async functions**: `async function functionName(...)`
- **Exclusions**:
  - Exported functions (handled by exports detector)
  - Class methods (part of class analysis)
  - Functions in comments or strings

### Verification Rules (verify-functions.ts)

A function is considered **used** if:

- It appears in a function call: `functionName()`
- It's passed as a callback: `onClick={functionName}`
- It's used in array methods: `.map(functionName)`
- It's referenced without parentheses: `const fn = functionName`

**Patterns checked**:

- `functionName()` - direct call
- `functionName.` - property access (chaining)
- As complete identifier (not substring of another identifier)

---

## 2. Classes Analysis

### Detection Rules (detect-classes.ts)

- **Class declarations**: `class ClassName { ... }`
- **Exclusions**:
  - Exported classes (handled by exports detector)
  - Classes in comments or strings

### Verification Rules (verify-classes.ts)

A class is considered **used** if:

- Instantiated with `new`: `new ClassName()`
- Extended: `class Child extends ClassName`
- Implemented: `class Foo implements ClassName`
- Multiple interfaces: `class Foo implements First, ClassName`
- Used in instanceof: `obj instanceof ClassName`
- Static access: `ClassName.staticMethod()`
- Generic type parameter: `Array<ClassName>`, `Promise<ClassName>`
- Type annotation: `const x: ClassName`
- Passed as parameter: `register(ClassName)`

**Patterns checked**:

- `new ClassName`
- `extends ClassName`
- `implements ClassName`
- `, ClassName` (in implements/generics)
- `instanceof ClassName`
- `ClassName.` (static access)
- `<ClassName>`, `<ClassName,`, `, ClassName>` (generics)
- `: ClassName` (type annotation)
- `(ClassName)`, `(ClassName,`, `, ClassName)` (parameters)

---

## 3. Constants Analysis

### Detection Rules (detect-constants.ts)

- **Const declarations**: `const variableName = ...`
- **Let declarations**: `let variableName = ...`
- **Var declarations**: `var variableName = ...`
- **Destructuring**: `const { prop1, prop2 } = obj`
- **Array destructuring**: `const [item1, item2] = array`
- **Exclusions**:
  - Exported constants (handled by exports detector)
  - Constants in comments or strings
  - Function declarations (handled by functions detector)

### Verification Rules (verify-constants.ts)

A constant is considered **used** if:

- Referenced as complete identifier (not substring)
- Used in template literal interpolations: `` `${constantName}` ``
- **NOT counted as usage**:
  - Inside regular strings: `"constantName"`
  - Inside comments: `// constantName`

**Special handling**:

- Template literal interpolations are detected by counting `${` and `}` to distinguish from literal text

---

## 4. Types/Interfaces Analysis (Definitions)

### Detection Rules (detect-definitions.ts)

- **Type aliases**: `type TypeName = ...`
- **Interfaces**: `interface InterfaceName { ... }`
- **Type parameters**: Generic types and mapped types
- **Exclusions**:
  - Exported types (handled by exports detector)
  - Types in comments or strings

### Verification Rules (verify-definitions.ts)

A type/interface is considered **used** if:

- Type annotation: `const x: TypeName`
- Generic parameter: `Array<TypeName>`, `Promise<TypeName>`
- Extends: `interface Child extends TypeName`
- Implements: `class Foo implements TypeName`
- Type cast: `value as TypeName`
- Type guard: `function isType(x): x is TypeName`
- Keyof operator: `keyof TypeName`
- Typeof operator: `typeof TypeName`
- Union type: `string | TypeName`
- Intersection type: `BaseType & TypeName`
- Type alias: `type Alias = TypeName`

**Patterns checked**:

- `: TypeName` (annotation)
- `<TypeName>` (generic)
- `extends TypeName`
- `implements TypeName`
- ` as TypeName` (cast)
- ` is TypeName` (guard)
- `keyof TypeName`
- `typeof TypeName`
- `| TypeName` (union)
- `& TypeName` (intersection)
- `= TypeName` (alias)

**Critical note**: Patterns are checked BEFORE `isCompleteIdentifier` to handle cases where the type name appears as a substring elsewhere in the line (e.g., "getResult" contains "Result").

---

## 5. React Props Analysis

### Detection Rules (detect-props.ts)

- **Destructured props** in components:
  - `({ propName })` - Function components
  - `({ propName = default })` - Props with defaults
  - `({ propName: alias })` - Aliased props
- **Typed props**: Props with TypeScript annotations
- **Exclusions**:
  - Props in comments or strings
  - Non-component functions

### Verification Rules (verify-props.ts)

A prop is considered **used** if:

- Referenced in JSX: `{propName}`
- Used in component logic
- Spread in JSX: `{...props}` marks all props as used

**Patterns checked**:

- Direct reference as complete identifier
- Inside JSX expressions

---

## 6. Console Statements Analysis

### Detection Rules (detect-consoles.ts)

- **Console methods**:
  - `console.log(...)`
  - `console.warn(...)`
  - `console.error(...)`
  - `console.info(...)`
  - `console.debug(...)`
- **Exclusions**:
  - Consoles in comments or strings

### Verification Rules (verify-consoles.ts)

Console statements are **always marked as dead code** - they have no verification phase as they should typically be removed before production.

---

## 7. Exports Analysis

### Detection Rules (detect-exports.ts)

- **Named exports**:
  - `export const functionName = ...`
  - `export function functionName(...)`
  - `export class ClassName { ... }`
  - `export type TypeName = ...`
  - `export interface InterfaceName { ... }`
  - `export { name1, name2 }` (re-exports)
- **Default exports**: `export default ...`
- **Re-exports**: `export { name } from './module'`
- **Exclusions**:
  - Exports in comments or strings

### Verification Rules (verify-exports.ts)

An export is considered **used** if:

- **Default exports**: Always marked as used (entry points)
- **Named exports**: Imported in another file from the correct source path

**Import verification**:

- Checks `import { exportName } from '...'`
- Checks `export { exportName } from '...'` (re-exports)
- **Path resolution**:
  - Normalizes paths (backslashes to forward slashes)
  - Resolves relative paths (`./`, `../`)
  - Strips file extensions (`.ts`, `.tsx`, `.js`, `.jsx`)
  - Compares resolved import path to source file path

**Critical**: The verifier ensures the import comes from the **correct source file** to avoid false positives when multiple files export the same name.

---

## 8. Dependencies Analysis

### Detection Rules (detect-dependencies.ts)

- **Import statements**:
  - `import pkg from 'package'`
  - `import { named } from 'package'`
  - `import * as alias from 'package'`
- **Require statements**: `require('package')`
- **Dynamic imports**: `import('package')`
- **Exclusions**:
  - Imports in comments or strings
  - Relative imports (local files)

### Verification Rules (verify-dependencies.ts)

A dependency is considered **used** if:

- The imported symbol is referenced in the code
- **Special handling**:
  - Side-effect imports (`import 'package'`) are always marked as used
  - Default imports are checked for usage
  - Named imports are checked individually

---

## 9. Imports Analysis

### Detection Rules (detect-imports.ts)

- **Named imports**: `import { name1, name2 } from '...'`
- **Default imports**: `import DefaultName from '...'`
- **Namespace imports**: `import * as Name from '...'`
- **Destructured imports**: `import { name as alias } from '...'`
- **Exclusions**:
  - Imports in comments or strings
  - Side-effect imports (no symbols imported)

### Verification Rules (verify-imports.ts)

An import is considered **used** if:

- The imported symbol is referenced as a complete identifier in the code
- Used in any expression, statement, or JSX

---

## Common Exclusion Patterns (All Analyzers)

All detectors and verifiers implement these common exclusions:

1. **Comments**:
   - `// comment`
   - `/* comment */`
   - `/** JSDoc */`

2. **Strings**:
   - Single quotes: `'text'`
   - Double quotes: `"text"`
   - Template literals: `` `text` ``
   - **Exception**: Template literal interpolations `${...}` are NOT strings

3. **Export re-declarations**:
   - `export { name }` is not counted as usage of `name`

4. **Identifier completeness**:
   - `functionName` in `myFunctionName` is NOT a match (substring)
   - Must be bounded by non-identifier characters
   - Identifier chars: `[a-zA-Z0-9_$]`

---

## Analysis Configuration

Users can enable/disable specific analysis types via `react-metrics config`:

- Functions detection
- Classes detection
- Constants detection
- Types/Interfaces detection
- Props detection
- Console statements detection
- Exports detection
- Dependencies detection
- Imports detection

Each can be independently toggled on/off in the configuration file.

---

## Known Limitations

1. **Dynamic usage**: Cannot detect usage via `eval()`, dynamic imports with variables, or computed property access
2. **Reflection**: Cannot detect usage via reflection APIs
3. **String literals**: If code references identifiers as strings (e.g., for reflection), they won't be detected as used
4. **Commented code**: Code in comments is ignored (by design)
5. **External usage**: If a file exports something used by external projects not in the analysis scope, it will be marked as unused

---

## Testing Strategy

Each analyzer has comprehensive unit tests covering:

- Basic detection patterns
- Edge cases (comments, strings, etc.)
- False positive prevention
- True positive validation
- Integration tests validating the complete analysis pipeline

Tests are located in:

- `src/lib/analysis/detection/__tests__/` (detection tests)
- `src/lib/analysis/verification/__tests__/` (verification tests)
- `src/lib/analysis/__tests__/integration.test.ts` (end-to-end tests)
