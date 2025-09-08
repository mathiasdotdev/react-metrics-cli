import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Logger au niveau du fichier
vi.mock('../../ui/logger/Logger', () => ({
  Logger: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    config: vi.fn(),
    cleanup: vi.fn(),
    credentials: vi.fn(),
    colored: vi.fn(),
    analysis: vi.fn(),
    separator: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    log: vi.fn(),
  },
}));

// Mock BinaryExecutor pour éviter l'exécution réelle
vi.mock('../../core/binary/BinaryExecutor', () => ({
  BinaryExecutor: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue({
      success: true,
      exitCode: 0,
      stdout: '',
      stderr: '',
      duration: 100,
    }),
    testBinary: vi.fn().mockResolvedValue(true),
    analyzeProject: vi.fn().mockResolvedValue({
      success: true,
      exitCode: 0,
      stdout: '',
      stderr: '',
      duration: 100,
    }),
    displayResults: vi.fn(),
  })),
}));

import {
  createMockBinaryExecutor,
  createMockBinaryManager,
} from '../../__tests__/helpers/mockBinary';
import {
  mockConsole,
  mockEnv,
  mockProcessExit,
  TEST_TIMEOUT,
} from '../../__tests__/helpers/testSetup';
import { CoverageCommand } from '../Coverage';

describe('CoverageCommand', () => {
  let coverageCommand: CoverageCommand;
  let consoleMocks: ReturnType<typeof mockConsole>;
  let processMocks: ReturnType<typeof mockProcessExit>;
  let envRestore: () => void;

  beforeEach(() => {
    consoleMocks = mockConsole();
    processMocks = mockProcessExit();
    envRestore = mockEnv({});
    vi.clearAllMocks();
    coverageCommand = new CoverageCommand();
  });

  afterEach(() => {
    consoleMocks.restore();
    processMocks.restore();
    envRestore();
    vi.restoreAllMocks();
  });

  it(
    'should execute coverage analysis successfully',
    async () => {
      const mockBinaryManager = createMockBinaryManager();
      mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/binary');
      (coverageCommand as any).binaryManager = mockBinaryManager;

      const mockExecutor = createMockBinaryExecutor('success');
      vi.doMock('../../core/binary/BinaryExecutor', () => ({
        BinaryExecutor: vi.fn(() => mockExecutor),
      }));

      await coverageCommand.execute({});

      expect(mockBinaryManager.downloadReactMetricsBinary).toHaveBeenCalled();
    },
    TEST_TIMEOUT,
  );

  it(
    'should generate custom HTML report',
    async () => {
      const customHtmlPath = '/custom/coverage-report.html';
      const mockBinaryManager = createMockBinaryManager();
      mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/binary');
      (coverageCommand as any).binaryManager = mockBinaryManager;

      const mockExecutor = createMockBinaryExecutor('success');
      vi.doMock('../../core/binary/BinaryExecutor', () => ({
        BinaryExecutor: vi.fn(() => mockExecutor),
      }));

      await coverageCommand.execute({ html: customHtmlPath });

      expect(mockBinaryManager.downloadReactMetricsBinary).toHaveBeenCalled();
    },
    TEST_TIMEOUT,
  );
});
