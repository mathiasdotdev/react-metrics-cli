# Project Context

## Project Overview

React-Metrics CLI is a TypeScript-based command-line tool for analyzing dead code in React/TypeScript projects. The CLI uses a **native TypeScript parser** compiled with tsgo (TypeScript v7/Corsa) to perform dead code analysis directly.

It's imperative to build BEFORE running any analysis. It prevents errors and ensures the CLI is up to date. Always update the CHANGELOG.md file and the package.json version when you make changes, and don't forget to check the previous version to see what has changed, so that you don't repeat yourself.

In Added, you only put new features that don't exist in the previous version. In Changed, you only put changes that exist in the previous version. In Fixed, you only put fixes that exist in the previous version. In Technical, you only put technical changes that don't exist in the previous version. On each version, I want you to be brief and to the point (don't add too many details).

## Development Notes

- The project uses Node.js 22+ and TypeScript compiled with **tsgo** (TypeScript v7/Corsa)
- Compilation ultra-rapide (jusqu'à 10x plus rapide) grâce au compilateur natif Go
- Package `@typescript/native-preview` utilisé pour la compilation avec tsgo
- Analysis is performed using a native TypeScript implementation with 2-pass AST analysis
- User configuration is stored in `$HOME/.react-metrics/config.json`
- The `config` command allows users to enable/disable specific analysis types and customize settings
