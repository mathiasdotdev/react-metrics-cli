# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React-Metrics CLI is a TypeScript-based command-line tool for analyzing dead code in React/TypeScript projects. The CLI downloads and executes a Go binary from Nexus Repository to perform the actual analysis.

It's imperative to build BEFORE running any analysis. It prevents errors and ensures the binary is up to date. Always update the CHANGELOG.md file and the package.json version when you make changes, and don't forget to check the previous version to see what has changed, so that you don't repeat yourself.

In Added, you only put new features that don't exist in the previous version. In Changed, you only put changes that exist in the previous version. In Fixed, you only put fixes that exist in the previous version. In Technical, you only put technical changes that don't exist in the previous version. On each version, I want you to be brief and to the point (don't add too many details).

## Architecture

### Core Components

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

### Key Dependencies

- **External Libraries**: Uses `@maif/nexus-utils` and imports from `../../../outil-nexus/dist/lib` for Nexus operations
- **CLI Framework**: Commander.js for command parsing and Inquirer.js for interactive prompts
- **UI**: Chalk for colored output, Ora for spinners
- **Security**: AES encryption via crypto-js for token storage

### Binary Management

The CLI downloads platform-specific Go binaries (Windows/Linux/macOS, x64/ARM64) and stores them in:
- Windows: `C:\react-metrics\`
- Linux/macOS: `/usr/local/react-metrics/`

## Common Development Commands

```bash
# Build TypeScript to JavaScript
npm run build

# Development with auto-reload
npm run dev

# Run compiled CLI
npm start

# Run tests
npm run test

# Prepare for publishing
npm run prepublishOnly
```

## CLI Usage Examples

```bash
# Analyze current directory (default command)
react-metrics

# Analyze specific project
react-metrics ./my-react-project

# Debug mode with output file
react-metrics --debug --output debug.log

# Test coverage analysis
react-metrics coverage
react-metrics coverage --html custom-report.html

# Upload binary to Nexus
react-metrics upload -v 1.0.0
react-metrics upload -v 1.0.0 --no-dry-run

# Download custom Nexus artifact
react-metrics download -g fr.maif.digital -a my-tool -v 1.0.0

# Configuration management
react-metrics config --info
react-metrics config --reset
```

## Development Notes

- The project uses Node.js 22+ and TypeScript 5.3+
- Jenkins pipeline configured for Node.js 22 with npm
- Binary paths and Nexus configuration are hardcoded in `system.ts` and need customization per environment
- Token encryption uses a hardcoded secret key in `system.ts` that should be changed for production
- The analyze command expects a Go binary with specific command-line arguments (`analyser --chemin --debug --sortie`)