import { vi } from 'vitest';

export function mockLogger() {
  const loggerMock = {
    debug: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    credentials: vi.fn(),
    download: vi.fn(),
    config: vi.fn(),
    binary: vi.fn(),
    cleanup: vi.fn(),
    colored: vi.fn()
  };

  // Mock du module Logger
  vi.doMock('../../ui/logger/Logger', () => ({
    Logger: loggerMock,
    LogLevel: {
      DEBUG: 0,
      INFO: 1,
      SUCCESS: 2,
      WARN: 3,
      ERROR: 4
    }
  }));

  return loggerMock;
}

export function restoreLogger() {
  vi.doUnmock('../../ui/logger/Logger');
}