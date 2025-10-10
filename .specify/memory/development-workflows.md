# Development Workflows

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

# Configuration management
react-metrics config --info
react-metrics config --reset
react-metrics config --set "analysis.constants=false"
react-metrics config --enable dependencies
react-metrics config --disable exports
```
