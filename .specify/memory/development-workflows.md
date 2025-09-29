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

## Local Development and Testing

### Docker/Nexus Local Testing
For testing against local Nexus instances:

```bash
# Enable local Nexus testing
export NEXUS_LOCAL=true
react-metrics analyze --local

# Alternative using environment variables
NEXUS_LOCAL=true react-metrics analyze
```

### Development Environment Variables
For local development setup:

```bash
# Nexus local configuration
NEXUS_LOCAL=true
NEXUS_URL=http://localhost:8081
NEXUS_REPOSITORY=react-metrics-artefacts
```