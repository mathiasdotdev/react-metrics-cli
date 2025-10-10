import { AnalysisResult, Declaration, DeclarationType } from '$types/analysis';
import chalk from 'chalk';
import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { displayAnalysisResults } from '../display-terminal';

describe('displayAnalysisResults', () => {
  let consoleLogSpy: ReturnType<typeof spyOn>;
  let originalChalkLevel: typeof chalk.level;

  beforeEach(() => {
    originalChalkLevel = chalk.level;
    chalk.level = 0; // Désactiver les couleurs
  });

  afterEach(() => {
    if (consoleLogSpy) {
      consoleLogSpy.mockRestore();
    }
    chalk.level = originalChalkLevel;
  });

  /**
   * Capture la sortie console et la retourne comme string pour snapshot
   */
  const captureOutput = (result: AnalysisResult): string => {
    const output: string[] = [];
    consoleLogSpy = spyOn(console, 'log').mockImplementation((...args) => {
      output.push(args.map((arg) => String(arg)).join(' '));
    });

    displayAnalysisResults(result);

    return output.join('\n').replace(/\d+\.\d+\s+secondes?/g, 'X.XX secondes');
  };

  const createDeclaration = (
    name: string,
    type: DeclarationType,
    filePath: string,
    line: number,
    column: number,
    context?: string,
  ): Declaration => ({
    name,
    type,
    location: { filePath, line, column },
    isUsedLocally: false,
    isImportedExternally: false,
    context,
  });

  it('should display empty results', () => {
    const result: AnalysisResult = {
      declarations: new Map(),
      deadCode: [],
      deprecated: [],
      duration: 1000,
    };

    const output = captureOutput(result);
    expect(output).toMatchSnapshot();
  });

  it('should display functions only', () => {
    const result: AnalysisResult = {
      declarations: new Map(),
      deadCode: [
        createDeclaration(
          'unusedFunction',
          DeclarationType.FUNCTION,
          '/test/file.ts',
          10,
          5,
        ),
        createDeclaration(
          'anotherUnused',
          DeclarationType.FUNCTION,
          '/test/other.ts',
          20,
          3,
        ),
      ],
      duration: 500,
    };

    const output = captureOutput(result);
    expect(output).toMatchSnapshot();
  });

  it('should display classes only', () => {
    const result: AnalysisResult = {
      declarations: new Map(),
      deadCode: [
        createDeclaration(
          'UnusedClass',
          DeclarationType.CLASS,
          '/test/class.ts',
          15,
          7,
        ),
        createDeclaration(
          'OldClass',
          DeclarationType.CLASS,
          '/test/legacy.ts',
          30,
          7,
        ),
      ],
      duration: 500,
    };

    const output = captureOutput(result);
    expect(output).toMatchSnapshot();
  });

  it('should display constants and props', () => {
    const result: AnalysisResult = {
      declarations: new Map(),
      deadCode: [
        createDeclaration(
          'UNUSED_CONST',
          DeclarationType.CONSTANT,
          '/test/const.ts',
          5,
          7,
        ),
        createDeclaration(
          'unusedProp',
          DeclarationType.PROP,
          '/test/props.tsx',
          8,
          3,
        ),
      ],
      duration: 500,
    };

    const output = captureOutput(result);
    expect(output).toMatchSnapshot();
  });

  it('should display console logs', () => {
    const result: AnalysisResult = {
      declarations: new Map(),
      deadCode: [
        createDeclaration(
          'console',
          DeclarationType.CONSOLE,
          '/test/console.ts',
          12,
          3,
          'console.log',
        ),
        createDeclaration(
          'console',
          DeclarationType.CONSOLE,
          '/test/console.ts',
          15,
          3,
          'console.error',
        ),
      ],
      duration: 500,
    };

    const output = captureOutput(result);
    expect(output).toMatchSnapshot();
  });

  it('should display all categories mixed', () => {
    const result: AnalysisResult = {
      declarations: new Map(),
      deadCode: [
        createDeclaration('fn', DeclarationType.FUNCTION, '/f.ts', 1, 1),
        createDeclaration('fn2', DeclarationType.FUNCTION, '/f.ts', 2, 1),
        createDeclaration('cls', DeclarationType.CLASS, '/c.ts', 1, 1),
        createDeclaration('const1', DeclarationType.CONSTANT, '/c.ts', 1, 1),
        createDeclaration('const2', DeclarationType.CONSTANT, '/c.ts', 2, 1),
        createDeclaration('const3', DeclarationType.CONSTANT, '/c.ts', 3, 1),
        createDeclaration('prop', DeclarationType.PROP, '/p.ts', 1, 1),
        createDeclaration(
          'console',
          DeclarationType.CONSOLE,
          '/c.ts',
          1,
          1,
          'console.log',
        ),
        createDeclaration('Type1', DeclarationType.DEFINITION, '/t.ts', 1, 1),
        createDeclaration('Export1', DeclarationType.EXPORT, '/e.ts', 1, 1),
        createDeclaration('dep', DeclarationType.DEPENDENCY, '/p.json', 1, 1),
      ],
      duration: 2500,
    };

    const output = captureOutput(result);
    expect(output).toMatchSnapshot();
  });

  it('should display real-world scenario with many elements', () => {
    const result: AnalysisResult = {
      declarations: new Map(),
      deadCode: [
        // 10 Functions
        ...Array.from({ length: 10 }, (_, i) =>
          createDeclaration(
            `function${i}`,
            DeclarationType.FUNCTION,
            '/f.ts',
            i + 1,
            1,
          ),
        ),
        // 3 Classes
        ...Array.from({ length: 3 }, (_, i) =>
          createDeclaration(
            `Class${i}`,
            DeclarationType.CLASS,
            '/c.ts',
            i + 1,
            1,
          ),
        ),
        // 12 Constants
        ...Array.from({ length: 12 }, (_, i) =>
          createDeclaration(
            `const${i}`,
            DeclarationType.CONSTANT,
            '/c.ts',
            i + 1,
            1,
          ),
        ),
        // 6 Props
        ...Array.from({ length: 6 }, (_, i) =>
          createDeclaration(
            `prop${i}`,
            DeclarationType.PROP,
            '/p.ts',
            i + 1,
            1,
          ),
        ),
        // 13 Consoles
        ...Array.from({ length: 13 }, (_, i) =>
          createDeclaration(
            'console',
            DeclarationType.CONSOLE,
            '/c.ts',
            i + 1,
            1,
            'console.log',
          ),
        ),
        // 5 Definitions
        ...Array.from({ length: 5 }, (_, i) =>
          createDeclaration(
            `Type${i}`,
            DeclarationType.DEFINITION,
            '/t.ts',
            i + 1,
            1,
          ),
        ),
        // 18 Exports
        ...Array.from({ length: 18 }, (_, i) =>
          createDeclaration(
            `Export${i}`,
            DeclarationType.EXPORT,
            '/e.ts',
            i + 1,
            1,
          ),
        ),
        // 1 Dependency
        createDeclaration(
          'react-dom',
          DeclarationType.DEPENDENCY,
          '/package.json',
          12,
          5,
        ),
      ],
      duration: 2345,
    };

    const output = captureOutput(result);
    expect(output).toMatchSnapshot();
  });
});
