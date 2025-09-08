import { vi } from 'vitest';

export function mockLogger() {
  const loggerMock = {
    setLevel: vi.fn(),
    newLine: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    credentials: vi.fn(),
    download: vi.fn(),
    config: vi.fn(),
    files: vi.fn(),
    cleanup: vi.fn(),
    settings: vi.fn(),
    analysis: vi.fn(),
    examples: vi.fn(),
    report: vi.fn(),
    list: vi.fn(),
    colored: vi.fn(),
  };

  // Mock du module Logger (maintenant basé sur Pino)
  vi.doMock('../../ui/logger/Logger', () => ({
    Logger: loggerMock,
    LogLevel: {
      DEBUG: 0,
      INFO: 1,
      SUCCESS: 2,
      WARN: 3,
      ERROR: 4,
    },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      level: 'debug',
    },
  }));

  return loggerMock;
}

export function restoreLogger() {
  vi.doUnmock('../../ui/logger/Logger');
}
