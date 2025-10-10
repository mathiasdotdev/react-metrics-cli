import { afterEach, beforeEach, describe, expect, test, spyOn } from 'bun:test';
import chalk from 'chalk';
import { Logger, LogLevel } from '../Logger';

describe('Logger - Snapshot Tests', () => {
  let consoleLogSpy: ReturnType<typeof spyOn>;
  let consoleWarnSpy: ReturnType<typeof spyOn>;
  let consoleErrorSpy: ReturnType<typeof spyOn>;
  let originalChalkLevel: typeof chalk.level;

  beforeEach(() => {
    // Désactiver les couleurs pour des tests reproductibles
    originalChalkLevel = chalk.level;
    chalk.level = 0;

    // Réinitialiser le niveau de log
    Logger.setLevel(LogLevel.DEBUG);
  });

  afterEach(() => {
    if (consoleLogSpy) consoleLogSpy.mockRestore();
    if (consoleWarnSpy) consoleWarnSpy.mockRestore();
    if (consoleErrorSpy) consoleErrorSpy.mockRestore();

    chalk.level = originalChalkLevel;
  });

  /**
   * Capture la sortie console et la normalise
   */
  const captureOutput = (fn: () => void): string => {
    const output: string[] = [];

    consoleLogSpy = spyOn(console, 'log').mockImplementation((...args) => {
      output.push(args.map((arg) => String(arg)).join(' '));
    });

    consoleWarnSpy = spyOn(console, 'warn').mockImplementation((...args) => {
      output.push(args.map((arg) => String(arg)).join(' '));
    });

    consoleErrorSpy = spyOn(console, 'error').mockImplementation((...args) => {
      output.push(args.map((arg) => String(arg)).join(' '));
    });

    fn();

    return output.join('\n');
  };

  test('debug: should display debug message at DEBUG level', () => {
    Logger.setLevel(LogLevel.DEBUG);

    const output = captureOutput(() => {
      Logger.debug('Debug message');
      Logger.debug('Debug with args', { key: 'value' });
    });

    expect(output).toMatchSnapshot();
  });

  test('debug: should not display at INFO level or higher', () => {
    Logger.setLevel(LogLevel.INFO);

    const output = captureOutput(() => {
      Logger.debug('This should not appear');
    });

    expect(output).toBe('');
    expect({ debugSuppressed: output === '' }).toMatchSnapshot();
  });

  test('info: should display info message', () => {
    const output = captureOutput(() => {
      Logger.info('Info message');
      Logger.info('Info with data', { count: 42 });
    });

    expect(output).toMatchSnapshot();
  });

  test('log: should display plain log message', () => {
    const output = captureOutput(() => {
      Logger.log('Plain log message');
      Logger.log('Log with args', 'arg1', 'arg2');
    });

    expect(output).toMatchSnapshot();
  });

  test('success: should display success message', () => {
    const output = captureOutput(() => {
      Logger.success('Operation successful');
      Logger.success('Success with result', { result: 'OK' });
    });

    expect(output).toMatchSnapshot();
  });

  test('warn: should display warning message', () => {
    const output = captureOutput(() => {
      Logger.warn('Warning message');
      Logger.warn('Warning with details', { issue: 'something' });
    });

    expect(output).toMatchSnapshot();
  });

  test('error: should display error message', () => {
    const output = captureOutput(() => {
      Logger.error('Error message');
      Logger.error('Error with details', { code: 500 });
    });

    expect(output).toMatchSnapshot();
  });

  test('config: should display config message', () => {
    const output = captureOutput(() => {
      Logger.config('Config loaded');
      Logger.config('Config path', '/path/to/config');
    });

    expect(output).toMatchSnapshot();
  });

  test('files: should display files message', () => {
    const output = captureOutput(() => {
      Logger.files('Processing file.ts');
      Logger.files('Found files', 10);
    });

    expect(output).toMatchSnapshot();
  });

  test('cleanup: should display cleanup message', () => {
    const output = captureOutput(() => {
      Logger.cleanup('Cleaning up temp files');
    });

    expect(output).toMatchSnapshot();
  });

  test('settings: should display settings message', () => {
    const output = captureOutput(() => {
      Logger.settings('Settings updated');
      Logger.settings('Setting value', 'key=value');
    });

    expect(output).toMatchSnapshot();
  });

  test('analysis: should display analysis message', () => {
    const output = captureOutput(() => {
      Logger.analysis('Analyzing code');
      Logger.analysis('Found issues', 5);
    });

    expect(output).toMatchSnapshot();
  });

  test('examples: should display examples message', () => {
    const output = captureOutput(() => {
      Logger.examples('Example command');
      Logger.examples('Usage', 'npm run test');
    });

    expect(output).toMatchSnapshot();
  });

  test('report: should display report message', () => {
    const output = captureOutput(() => {
      Logger.report('Generating report');
      Logger.report('Report stats', { total: 100 });
    });

    expect(output).toMatchSnapshot();
  });

  test('list: should display list item', () => {
    const output = captureOutput(() => {
      Logger.list('First item');
      Logger.list('Second item');
      Logger.list('Third item');
    });

    expect(output).toMatchSnapshot();
  });

  test('section: should display section header', () => {
    const output = captureOutput(() => {
      Logger.section('Section Title');
      Logger.section('Another Section', { meta: 'data' });
    });

    expect(output).toMatchSnapshot();
  });

  test('filePath: should display file path', () => {
    const output = captureOutput(() => {
      Logger.filePath('/path/to/file.ts');
      Logger.filePath('./relative/path.js');
    });

    expect(output).toMatchSnapshot();
  });

  test('label: should display label', () => {
    const output = captureOutput(() => {
      Logger.label('Label:');
      Logger.label('Status:', 'active');
    });

    expect(output).toMatchSnapshot();
  });

  test('colored: should display colored message', () => {
    const output = captureOutput(() => {
      Logger.colored('blue', 'Blue message');
      Logger.colored('red', 'Red message', { extra: 'data' });
    });

    expect(output).toMatchSnapshot();
  });

  test('newLine: should output blank line', () => {
    const output = captureOutput(() => {
      Logger.log('Before');
      Logger.newLine();
      Logger.log('After');
    });

    expect(output).toMatchSnapshot();
  });

  test('setLevel: should filter messages by log level', () => {
    // Test WARN level (should only show WARN and ERROR)
    Logger.setLevel(LogLevel.WARN);

    const output = captureOutput(() => {
      Logger.debug('Debug - should not appear');
      Logger.info('Info - should not appear');
      Logger.success('Success - should not appear');
      Logger.warn('Warning - should appear');
      Logger.error('Error - should appear');
    });

    expect(output).toMatchSnapshot();
  });

  test('all methods combined: should display all message types', () => {
    Logger.setLevel(LogLevel.DEBUG);

    const output = captureOutput(() => {
      Logger.debug('Debug message');
      Logger.info('Info message');
      Logger.success('Success message');
      Logger.warn('Warning message');
      Logger.error('Error message');
      Logger.config('Config message');
      Logger.files('Files message');
      Logger.settings('Settings message');
      Logger.analysis('Analysis message');
      Logger.report('Report message');
      Logger.list('List item');
      Logger.section('Section');
      Logger.filePath('/path');
      Logger.label('Label');
    });

    expect(output).toMatchSnapshot();
  });
});
