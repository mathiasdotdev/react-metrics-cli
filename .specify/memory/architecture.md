# Architecture

## Core Components

- **CLI Entry Point** (`src/index.ts`): Commander.js-based CLI with two main commands:
  - `analyze` (default): Analyzes React projects for dead code
  - `config`: Manages configuration settings

- **Command Handlers** (`src/commands/`):
  - `AnalyzeCommand`: Orchestrates the code analysis process
  - `ConfigCommand`: Handles interactive configuration management

- **Configuration** (`src/core/config/`):
  - `ConfigManager.ts`: Loads and saves user configuration
  - `system.ts`: Platform-specific paths and system constants

## Key Dependencies

- **CLI Framework**: Commander.js for command parsing and Inquirer.js for interactive prompts
- **UI**: Chalk for colored output, Ora for spinners
- **TypeScript Compilation**: tsgo (TypeScript v7/Corsa) via `@typescript/native-preview` for ultra-fast compilation

## Analysis Architecture

### Two-Pass Analysis System

The dead code analysis uses a **2-pass system**:

1. **Detection Phase** (`src/lib/analysis/detection/`):
   - Scans all TypeScript/JavaScript files
   - Identifies declarations: functions, classes, constants, types, exports, etc.
   - Creates a declaration map with metadata (name, type, location, etc.)
   - All declarations start with `used: false`

2. **Verification Phase** (`src/lib/analysis/verification/`):
   - Analyzes code to find usage patterns
   - Marks declarations as `used: true` when found
   - Applies specific rules per declaration type
   - Returns remaining `used: false` items as dead code

### Detectors (`src/lib/analysis/detection/detectors/`)

- `detect-functions.ts`: Classic, arrow, and async functions
- `detect-classes.ts`: Class declarations
- `detect-constants.ts`: const/let/var declarations, destructuring
- `detect-definitions.ts`: Types and interfaces
- `detect-props.ts`: React component props
- `detect-consoles.ts`: console.log/warn/error/info/debug
- `detect-exports.ts`: Named and default exports
- `detect-dependencies.ts`: Package imports from node_modules
- `detect-imports.ts`: Named, default, and namespace imports

### Verifiers (`src/lib/analysis/verification/verifiers/`)

- `verify-functions.ts`: Function calls, callbacks, references
- `verify-classes.ts`: Instantiation, inheritance, type usage
- `verify-constants.ts`: Variable references, template literals
- `verify-definitions.ts`: Type annotations, generics, type operations
- `verify-props.ts`: JSX usage, component logic
- `verify-consoles.ts`: (Always dead code - no verification)
- `verify-exports.ts`: Import tracking with path resolution
- `verify-dependencies.ts`: Package usage verification
- `verify-imports.ts`: Import symbol usage

**Detailed rules**: See [dead-code-analysis-rules.md](./dead-code-analysis-rules.md)

### Common Utilities (`src/lib/analysis/utils/`)

- `string-utils.ts`: Identifier validation, string/comment detection
- `declaration-utils.ts`: Declaration object creation
- `identifier-utils.ts`: Identifier name extraction

## Native TypeScript Analysis

The analysis is performed entirely in native TypeScript using tsgo compilation. No external binaries are downloaded or executed. All analysis logic is implemented in `src/lib/` using TypeScript's AST parsing capabilities.
