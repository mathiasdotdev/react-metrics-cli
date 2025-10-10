# Configuration

## Configuration File

React-Metrics CLI uses a JSON configuration file stored at `$HOME/.react-metrics/config.json` to manage user preferences and analysis settings.

## Configuration Structure

```json
{
  "fileExtensions": [".js", ".jsx", ".ts", ".tsx"],
  "maxGoroutines": 20,
  "ignoredFolders": ["node_modules", ".git", "dist", "build", "coverage"],
  "otherIgnoredFolders": [],
  "ignoreAnnotations": true,
  "modeDebug": false,
  "reports": {
    "terminal": true,
    "html": false,
    "json": false
  },
  "analysis": {
    "constants": true,
    "functions": true,
    "classes": true,
    "props": true,
    "consoles": true,
    "definitions": true,
    "imports": true,
    "exports": true,
    "dependencies": false
  }
}
```

## Configuration Management

### Config Command

The `config` command provides comprehensive configuration management:

```bash
# Initialize configuration file with default values
react-metrics config --init

# Display current configuration
react-metrics config --info

# Reset configuration (delete file)
react-metrics config --reset

# Modify a specific value
react-metrics config --set "maxGoroutines=50"
react-metrics config --set "analysis.constants=false"

# Enable a specific analysis type
react-metrics config --enable constants
react-metrics config --enable dependencies

# Disable a specific analysis type
react-metrics config --disable dependencies
react-metrics config --disable exports
```

### Configuration Options

#### File Processing

- `fileExtensions`: Array of file extensions to analyze (default: `.js`, `.jsx`, `.ts`, `.tsx`)
- `maxGoroutines`: Maximum number of concurrent goroutines (default: 20)
- `ignoredFolders`: Standard folders to ignore (default: `node_modules`, `.git`, `dist`, `build`, `coverage`)
- `otherIgnoredFolders`: Additional custom folders to ignore
- `ignoreAnnotations`: Enable/disable annotation support (`// react-metrics-ignore-ligne`, `// react-metrics-ignore-file`)
- `modeDebug`: Enable debug mode with detailed logs

#### Reports

- `terminal`: Display results in terminal (default: true)
- `html`: Generate HTML report (default: false)
- `json`: Generate JSON report (default: false)

#### Analysis Types

Control which types of dead code to detect:

- `constants`: Unused constants and variables
- `functions`: Unused functions (classical and arrow)
- `classes`: Unused classes
- `props`: Unused React props
- `consoles`: Console statements (`console.log`, `console.warn`, etc.)
- `definitions`: Unused TypeScript types and interfaces
- `imports`: Unused imports
- `exports`: Unused exports
- `dependencies`: Unused package.json dependencies (default: false)

## Implementation Details

### ConfigManager (`src/core/config/ConfigManager.ts`)

The `ConfigManager` class handles all configuration operations:

- `loadConfig()`: Loads configuration from file, falls back to defaults if file doesn't exist
- `saveConfig(config)`: Saves configuration to file, creates directory if needed
- `initConfig()`: Initializes configuration file with default values
- `resetConfig()`: Deletes the configuration file
- `getConfigPath()`: Returns the absolute path to the configuration file
- `configExists()`: Checks if configuration file exists
- `getDefaultConfig()`: Returns default configuration object

### Config Command (`src/commands/Config.ts`)

The `ConfigCommand` class implements the CLI command with the following features:

- Display current configuration with color-coded output
- Initialize/reset configuration
- Modify configuration values with type conversion (boolean, number, array, string)
- Toggle specific analysis types on/off
- Navigate nested configuration keys using dot notation

### Type Conversion

The `--set` command automatically converts values based on the current type:

- Boolean: `"true"` or `"false"` strings
- Number: Parsed as integer
- Array: Comma-separated values split and trimmed
- String: Used as-is

## Default Behavior

If no configuration file exists, the CLI will use the default configuration automatically. Users don't need to initialize the configuration unless they want to customize it.

## Configuration Location

The configuration file is stored at:

- **Linux/macOS**: `~/.react-metrics/config.json`
- **Windows**: `%USERPROFILE%\.react-metrics\config.json`
