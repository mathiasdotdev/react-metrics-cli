import { mock } from 'bun:test';

export function mockLogger() {
  const loggerMock = {
    setLevel: mock(),
    newLine: mock(),
    debug: mock(),
    log: mock(),
    info: mock(),
    success: mock(),
    warn: mock(),
    error: mock(),
    config: mock(),
    files: mock(),
    cleanup: mock(),
    settings: mock(),
    analysis: mock(),
    examples: mock(),
    report: mock(),
    list: mock(),
    colored: mock(),
  };

  // Mock du module Logger (maintenant basé sur Pino)
  mock.module('$/ui/logger/Logger', () => ({
    Logger: loggerMock,
    LogLevel: {
      DEBUG: 0,
      INFO: 1,
      SUCCESS: 2,
      WARN: 3,
      ERROR: 4,
    },
    logger: {
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
      level: 'debug',
    },
  }));

  return loggerMock;
}

export function restoreLogger() {
  mock.restore();
}
