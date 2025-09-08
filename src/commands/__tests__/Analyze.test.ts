import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Logger au niveau du fichier avant tous les imports
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
import { Logger } from '../../ui/logger/Logger';
import { AnalyzeCommand } from '../Analyze';

describe('AnalyzeCommand', () => {
  let analyzeCommand: AnalyzeCommand;
  let consoleMocks: ReturnType<typeof mockConsole>;
  let processMocks: ReturnType<typeof mockProcessExit>;
  let envRestore: () => void;

  beforeEach(() => {
    // Mock des dépendances
    consoleMocks = mockConsole();
    processMocks = mockProcessExit();
    envRestore = mockEnv({});

    // Reset tous les mocks Logger
    vi.clearAllMocks();

    analyzeCommand = new AnalyzeCommand();
  });

  afterEach(() => {
    consoleMocks.restore();
    processMocks.restore();
    envRestore();
    vi.restoreAllMocks();
  });

  describe('execute', () => {
    it(
      'should execute analysis successfully with default options',
      async () => {
        // Mock BinaryManager
        const mockBinaryManager = createMockBinaryManager();
        mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/binary');
        (analyzeCommand as any).binaryManager = mockBinaryManager;

        // Mock BinaryExecutor
        const mockExecutor = createMockBinaryExecutor('success');
        vi.doMock('../../core/binary/BinaryExecutor', () => ({
          BinaryExecutor: vi.fn(() => mockExecutor),
        }));

        await analyzeCommand.execute({});

        expect(mockBinaryManager.downloadReactMetricsBinary).toHaveBeenCalled();
      },
      TEST_TIMEOUT,
    );

    it(
      'should activate local mode when local option is true',
      async () => {
        const mockBinaryManager = createMockBinaryManager();
        mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/binary');
        (analyzeCommand as any).binaryManager = mockBinaryManager;

        const mockExecutor = createMockBinaryExecutor('success');
        vi.doMock('../../core/binary/BinaryExecutor', () => ({
          BinaryExecutor: vi.fn(() => mockExecutor),
        }));

        await analyzeCommand.execute({ local: true });

        expect(process.env.NEXUS_LOCAL).toBe('true');
        expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining('🏠 Mode local activé'));
      },
      TEST_TIMEOUT,
    );

    it(
      'should enable debug mode when debug option is true',
      async () => {
        const mockBinaryManager = createMockBinaryManager();
        mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/binary');
        (analyzeCommand as any).binaryManager = mockBinaryManager;

        const mockExecutor = createMockBinaryExecutor('success');
        vi.doMock('../../core/binary/BinaryExecutor', () => ({
          BinaryExecutor: vi.fn(() => mockExecutor),
        }));

        await analyzeCommand.execute({ debug: true });

        expect(Logger.debug).toHaveBeenCalledWith(expect.stringContaining('🐛 Mode debug activé'));
      },
      TEST_TIMEOUT,
    );

    it(
      'should use custom path when provided',
      async () => {
        const customPath = '/custom/project/path';
        const mockBinaryManager = createMockBinaryManager();
        mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/binary');
        (analyzeCommand as any).binaryManager = mockBinaryManager;

        const mockExecutor = createMockBinaryExecutor('success');
        vi.doMock('../../core/binary/BinaryExecutor', () => ({
          BinaryExecutor: vi.fn(() => mockExecutor),
        }));

        await analyzeCommand.execute({ path: customPath });

        expect(Logger.info).toHaveBeenCalledWith(
          expect.stringContaining(`🔍 Analyse du projet: ${customPath}`),
        );
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle binary download failure',
      async () => {
        const mockBinaryManager = createMockBinaryManager();
        mockBinaryManager.downloadReactMetricsBinary.mockRejectedValue(
          new Error('Credentials Nexus manquants'),
        );
        (analyzeCommand as any).binaryManager = mockBinaryManager;

        await analyzeCommand.execute({});

        expect(mockBinaryManager.downloadReactMetricsBinary).toHaveBeenCalled();
        expect(processMocks.mockExit).toHaveBeenCalledWith(1);
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle network connection errors',
      async () => {
        const mockBinaryManager = createMockBinaryManager();
        mockBinaryManager.downloadReactMetricsBinary.mockRejectedValue(
          new Error('ENOTFOUND nexus.example.com'),
        );
        (analyzeCommand as any).binaryManager = mockBinaryManager;

        await analyzeCommand.execute({});

        expect(Logger.error).toHaveBeenCalledWith(
          expect.stringContaining('\nÉchec du téléchargement'),
        );
        expect(Logger.warn).toHaveBeenCalledWith(
          expect.stringContaining('💡 Serveur Nexus inaccessible'),
        );
        expect(processMocks.mockExit).toHaveBeenCalledWith(1);
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle binary execution failure',
      async () => {
        const mockBinaryManager = createMockBinaryManager();
        mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/binary');
        (analyzeCommand as any).binaryManager = mockBinaryManager;

        const mockExecutor = createMockBinaryExecutor('error');
        vi.doMock('../../core/binary/BinaryExecutor', () => ({
          BinaryExecutor: vi.fn(() => mockExecutor),
        }));

        await analyzeCommand.execute({});

        expect(mockBinaryManager.downloadReactMetricsBinary).toHaveBeenCalled();
        expect(processMocks.mockExit).toHaveBeenCalledWith(1);
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle missing binary error (ENOENT)',
      async () => {
        const mockBinaryManager = createMockBinaryManager();
        mockBinaryManager.downloadReactMetricsBinary.mockRejectedValue(new Error('spawn ENOENT'));
        (analyzeCommand as any).binaryManager = mockBinaryManager;

        await analyzeCommand.execute({});

        expect(Logger.error).toHaveBeenCalledWith(
          expect.stringContaining('Erreur lors du téléchargement'),
        );
        expect(Logger.error).toHaveBeenCalledWith(
          expect.stringContaining('Binaire react-metrics non trouvé'),
        );
        expect(processMocks.mockExit).toHaveBeenCalledWith(1);
      },
      TEST_TIMEOUT,
    );
  });
});
