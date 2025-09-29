# Architecture

## Core Components

- **CLI Entry Point** (`src/index.ts`): Commander.js-based CLI with five main commands:
  - `analyze` (default): Analyzes React projects for dead code
  - `coverage`: Analyzes test coverage with HTML reports
  - `download`: Downloads Nexus artifacts with custom parameters
  - `upload`: Uploads binaries to Nexus Repository
  - `config`: Manages configuration and tokens

- **Command Handlers** (`src/commands/`):
  - `AnalyzeCommand`: Orchestrates the code analysis process
  - `CoverageCommand`: Handles test coverage analysis with HTML reporting
  - `UploadCommand`: Manages binary uploads to Nexus with authentication
  - `DownloadCommand`: Downloads custom Nexus artifacts
  - `ConfigCommand`: Handles interactive configuration management

- **Utilities** (`src/utils/`):
  - `BinaryManager`: Downloads and manages Go binaries from Nexus using `@maif/nexus-utils`
  - `BinaryExecutor`: Executes the Go binary with proper argument parsing and output handling
  - `TokenManager`: Encrypts/decrypts and manages Nexus authentication tokens using AES

- **Configuration** (`src/core/config/system.ts`): Platform-specific paths and system constants

## Key Dependencies

- **External Libraries**: Uses `@maif/nexus-utils` and imports from `../../../outil-nexus/dist/lib` for Nexus operations
- **CLI Framework**: Commander.js for command parsing and Inquirer.js for interactive prompts
- **UI**: Chalk for colored output, Ora for spinners
- **Security**: AES encryption via crypto-js for token storage

## Binary Management

The CLI downloads platform-specific Go binaries (Windows/Linux/macOS, x64/ARM64) and stores them in:

- Windows: `C:\react-metrics\`
- Linux/macOS: `/usr/local/react-metrics/`