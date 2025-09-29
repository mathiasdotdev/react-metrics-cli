# Project Context

## Project Overview

React-Metrics CLI is a TypeScript-based command-line tool for analyzing dead code in React/TypeScript projects. The CLI downloads and executes a Go binary from Nexus Repository to perform the actual analysis.

It's imperative to build BEFORE running any analysis. It prevents errors and ensures the binary is up to date. Always update the CHANGELOG.md file and the package.json version when you make changes, and don't forget to check the previous version to see what has changed, so that you don't repeat yourself.

In Added, you only put new features that don't exist in the previous version. In Changed, you only put changes that exist in the previous version. In Fixed, you only put fixes that exist in the previous version. In Technical, you only put technical changes that don't exist in the previous version. On each version, I want you to be brief and to the point (don't add too many details).

## Development Notes

- The project uses Node.js 22+ and TypeScript 5.3+
- Jenkins pipeline configured for Node.js 22 with npm
- Binary paths and Nexus configuration are hardcoded in `system.ts` and need customization per environment
- Token encryption uses a hardcoded secret key in `system.ts` that should be changed for production
- The analyze command expects a Go binary with specific command-line arguments (`analyser --chemin --debug --sortie`)