import { vi } from 'vitest';
import { ExecutionResult } from '../../core/binary/BinaryExecutor';

// Mock d'un binaire qui simule différents comportements
export class MockBinary {
  private mockPath: string;
  private mockBehavior: 'success' | 'error' | 'timeout' | 'not-found';

  constructor(path: string, behavior: 'success' | 'error' | 'timeout' | 'not-found' = 'success') {
    this.mockPath = path;
    this.mockBehavior = behavior;
  }

  // Crée un fichier mock pour simquer un binaire
  create(): void {
    const fs = require('fs');
    const path = require('path');

    const dir = path.dirname(this.mockPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.mockPath, '#!/bin/bash\necho "Mock binary"', { mode: 0o755 });
  }

  // Supprime le fichier mock
  cleanup(): void {
    const fs = require('fs');
    if (fs.existsSync(this.mockPath)) {
      fs.unlinkSync(this.mockPath);
    }
  }

  // Mock l'exécution du binaire avec différents résultats
  static mockExecution(behavior: 'success' | 'error' | 'timeout' = 'success'): ExecutionResult {
    switch (behavior) {
      case 'success':
        return {
          success: true,
          exitCode: 0,
          stdout: 'Analysis completed successfully\nFound 3 dead code instances',
          stderr: '',
          duration: 1500,
        };
      case 'error':
        return {
          success: false,
          exitCode: 1,
          stdout: '',
          stderr: 'Error: Project not found',
          duration: 500,
        };
      case 'timeout':
        return {
          success: false,
          exitCode: 124,
          stdout: '',
          stderr: 'Process timed out',
          duration: 30000,
        };
      default:
        throw new Error(`Unknown behavior: ${behavior}`);
    }
  }
}

// Mock du BinaryManager pour les tests
export const createMockBinaryManager = () => {
  return {
    downloadReactMetricsBinary: vi.fn(),
    downloadArtifact: vi.fn(),
    getLatestReactMetricsVersion: vi.fn(),
    listNexusArtifactsByGA: vi.fn(),
    getLatestArtifactVersion: vi.fn(),
  };
};

// Mock du BinaryExecutor pour les tests
export const createMockBinaryExecutor = (behavior: 'success' | 'error' | 'timeout' = 'success') => {
  return {
    execute: vi.fn().mockResolvedValue(MockBinary.mockExecution(behavior)),
    showHelp: vi.fn().mockResolvedValue(undefined),
    testBinary: vi.fn().mockResolvedValue(behavior === 'success'),
    analyzeProject: vi.fn().mockResolvedValue(MockBinary.mockExecution(behavior)),
    displayResults: vi.fn(),
  };
};
