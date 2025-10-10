import { AnalysisResult, Declaration, DeclarationType } from '$types/analysis';
import { describe, expect, it } from 'bun:test';
import {
  buildDetailedReport,
  generateFileReport,
} from '../generate-file-report';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('generateFileReport', () => {
  const createDeclaration = (
    name: string,
    type: DeclarationType,
    filePath: string,
    line: number,
    column: number,
    usedLocally: boolean = false,
    importedExternally: boolean = false,
  ): Declaration => ({
    name,
    type,
    location: { filePath, line, column },
    isUsedLocally: usedLocally,
    isImportedExternally: importedExternally,
  });

  /**
   * Normalise le rapport en remplaçant les dates et durées variables
   */
  const normalizeReport = (report: string): string => {
    return report
      .replace(
        /Généré le:\s+\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}/g,
        'Généré le: DD/MM/YYYY HH:MM:SS',
      )
      .replace(
        /Durée totale de l'analyse:\s+\d+\.\d+\s+secondes?/g,
        "Durée totale de l'analyse: X.XX secondes",
      );
  };

  it('should generate empty report', () => {
    const result: AnalysisResult = {
      declarations: new Map(),
      deadCode: [],
      deprecated: [],
      duration: 500,
    };

    const report = normalizeReport(buildDetailedReport(result));
    expect(report).toMatchSnapshot();
  });

  it('should generate report with functions only', () => {
    const declarations = new Map<string, Declaration>();
    const fn1 = createDeclaration(
      'unusedFunction',
      DeclarationType.FUNCTION,
      '/src/file.ts',
      10,
      5,
    );
    const fn2 = createDeclaration(
      'anotherUnused',
      DeclarationType.FUNCTION,
      '/src/other.ts',
      20,
      3,
    );
    declarations.set('fn1', fn1);
    declarations.set('fn2', fn2);

    const result: AnalysisResult = {
      declarations,
      deadCode: [fn1, fn2],
      duration: 1000,
    };

    const report = normalizeReport(buildDetailedReport(result));
    expect(report).toMatchSnapshot();
  });

  it('should generate report with classes only', () => {
    const declarations = new Map<string, Declaration>();
    const cls1 = createDeclaration(
      'UnusedClass',
      DeclarationType.CLASS,
      '/src/class.ts',
      15,
      7,
    );
    const cls2 = createDeclaration(
      'OldClass',
      DeclarationType.CLASS,
      '/src/legacy.ts',
      30,
      7,
    );
    declarations.set('cls1', cls1);
    declarations.set('cls2', cls2);

    const result: AnalysisResult = {
      declarations,
      deadCode: [cls1, cls2],
      duration: 1000,
    };

    const report = normalizeReport(buildDetailedReport(result));
    expect(report).toMatchSnapshot();
  });

  it('should generate report with constants and props', () => {
    const declarations = new Map<string, Declaration>();
    const c1 = createDeclaration(
      'UNUSED_CONST',
      DeclarationType.CONSTANT,
      '/src/constants.ts',
      5,
      7,
    );
    const p1 = createDeclaration(
      'unusedProp',
      DeclarationType.PROP,
      '/src/props.tsx',
      8,
      3,
    );
    declarations.set('c1', c1);
    declarations.set('p1', p1);

    const result: AnalysisResult = {
      declarations,
      deadCode: [c1, p1],
      duration: 1000,
    };

    const report = normalizeReport(buildDetailedReport(result));
    expect(report).toMatchSnapshot();
  });

  it('should generate report with mixed categories', () => {
    const declarations = new Map<string, Declaration>();
    const fn = createDeclaration('fn', DeclarationType.FUNCTION, '/f.ts', 1, 1);
    const cls = createDeclaration('cls', DeclarationType.CLASS, '/c.ts', 1, 1);
    const constant = createDeclaration(
      'const1',
      DeclarationType.CONSTANT,
      '/c.ts',
      1,
      1,
    );
    const prop = createDeclaration('prop', DeclarationType.PROP, '/p.ts', 1, 1);
    const console = createDeclaration(
      'console',
      DeclarationType.CONSOLE,
      '/c.ts',
      1,
      1,
    );
    const type = createDeclaration(
      'Type1',
      DeclarationType.DEFINITION,
      '/t.ts',
      1,
      1,
    );
    const exp = createDeclaration(
      'Export1',
      DeclarationType.EXPORT,
      '/e.ts',
      1,
      1,
    );
    const dep = createDeclaration(
      'dep',
      DeclarationType.DEPENDENCY,
      '/p.json',
      1,
      1,
    );

    declarations.set('fn', fn);
    declarations.set('cls', cls);
    declarations.set('constant', constant);
    declarations.set('prop', prop);
    declarations.set('console', console);
    declarations.set('type', type);
    declarations.set('exp', exp);
    declarations.set('dep', dep);

    const result: AnalysisResult = {
      declarations,
      deadCode: [fn, cls, constant, prop, console, type, exp, dep],
      duration: 2500,
    };

    const report = normalizeReport(buildDetailedReport(result));
    expect(report).toMatchSnapshot();
  });

  it('should generate report with real-world scenario', () => {
    const declarations = new Map<string, Declaration>();
    const deadCode: Declaration[] = [];

    // 10 Functions
    for (let i = 0; i < 10; i++) {
      const fn = createDeclaration(
        `function${i}`,
        DeclarationType.FUNCTION,
        '/f.ts',
        i + 1,
        1,
      );
      declarations.set(`fn${i}`, fn);
      deadCode.push(fn);
    }

    // 3 Classes
    for (let i = 0; i < 3; i++) {
      const cls = createDeclaration(
        `Class${i}`,
        DeclarationType.CLASS,
        '/c.ts',
        i + 1,
        1,
      );
      declarations.set(`cls${i}`, cls);
      deadCode.push(cls);
    }

    // 12 Constants
    for (let i = 0; i < 12; i++) {
      const c = createDeclaration(
        `const${i}`,
        DeclarationType.CONSTANT,
        '/c.ts',
        i + 1,
        1,
      );
      declarations.set(`const${i}`, c);
      deadCode.push(c);
    }

    // 6 Props
    for (let i = 0; i < 6; i++) {
      const p = createDeclaration(
        `prop${i}`,
        DeclarationType.PROP,
        '/p.ts',
        i + 1,
        1,
      );
      declarations.set(`prop${i}`, p);
      deadCode.push(p);
    }

    const result: AnalysisResult = {
      declarations,
      deadCode,
      duration: 2345,
    };

    const report = normalizeReport(buildDetailedReport(result));
    expect(report).toMatchSnapshot();
  });

  it('should generate report with deprecated declarations only', () => {
    const declarations = new Map<string, Declaration>();
    const fn = createDeclaration(
      'oldFunc',
      DeclarationType.FUNCTION,
      '/f.ts',
      1,
      1,
      false,
      false,
    );
    const cls = createDeclaration(
      'OldClass',
      DeclarationType.CLASS,
      '/c.ts',
      1,
      1,
      true,
      true,
    );
    declarations.set('fn', fn);
    declarations.set('cls', cls);

    const result: AnalysisResult = {
      declarations,
      deadCode: [fn],
      deprecated: [fn, cls],
      duration: 1000,
    };

    const report = normalizeReport(buildDetailedReport(result));
    expect(report).toMatchSnapshot();
  });

  it('should generate report with locally used export', () => {
    const declarations = new Map<string, Declaration>();
    const exp1 = createDeclaration(
      'myExport',
      DeclarationType.EXPORT,
      '/e.ts',
      10,
      5,
      true,
      false,
    );
    const exp2 = createDeclaration(
      'publicExport',
      DeclarationType.EXPORT,
      '/e.ts',
      20,
      5,
      true,
      true,
    );
    declarations.set('exp1', exp1);
    declarations.set('exp2', exp2);

    const result: AnalysisResult = {
      declarations,
      deadCode: [],
      duration: 1000,
    };

    const report = normalizeReport(buildDetailedReport(result));
    expect(report).toMatchSnapshot();
  });

  it('should generate report with deprecated and local exports', () => {
    const declarations = new Map<string, Declaration>();

    // Deprecated utilisée
    const depFunc = createDeclaration(
      'oldAPI',
      DeclarationType.FUNCTION,
      '/api.ts',
      5,
      1,
      true,
      true,
    );

    // Deprecated non utilisée
    const depClass = createDeclaration(
      'LegacyService',
      DeclarationType.CLASS,
      '/srv.ts',
      10,
      1,
      false,
      false,
    );

    // Export utilisé localement
    const localExp = createDeclaration(
      'internalHelper',
      DeclarationType.EXPORT,
      '/helper.ts',
      3,
      1,
      true,
      false,
    );

    // Export public
    const publicExp = createDeclaration(
      'publicAPI',
      DeclarationType.EXPORT,
      '/api.ts',
      20,
      1,
      true,
      true,
    );

    declarations.set('depFunc', depFunc);
    declarations.set('depClass', depClass);
    declarations.set('localExp', localExp);
    declarations.set('publicExp', publicExp);

    const result: AnalysisResult = {
      declarations,
      deadCode: [depClass],
      deprecated: [depFunc, depClass],
      duration: 1500,
    };

    const report = normalizeReport(buildDetailedReport(result));
    expect(report).toMatchSnapshot();
  });

  it('should write report to file successfully', async () => {
    const declarations = new Map<string, Declaration>();
    const fn = createDeclaration(
      'test',
      DeclarationType.FUNCTION,
      '/t.ts',
      1,
      1,
    );
    declarations.set('fn', fn);

    const result: AnalysisResult = {
      declarations,
      deadCode: [fn],
      duration: 500,
    };

    const tempDir = path.join(process.cwd(), 'temp-test-report');
    const tempFile = path.join(tempDir, 'nested', 'report.md');

    try {
      await generateFileReport(tempFile, result);

      // Vérifier que le fichier existe
      const exists = await fs
        .access(tempFile)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);

      // Vérifier le contenu
      const content = await fs.readFile(tempFile, 'utf-8');
      expect(content).toContain("RAPPORT D'ANALYSE REACT-METRICS");
      expect(content).toContain('test');
    } finally {
      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should throw error when file write fails', async () => {
    const result: AnalysisResult = {
      declarations: new Map(),
      deadCode: [],
      duration: 500,
    };

    // Path invalide qui devrait échouer (ex: caractères interdits sous Windows)
    const invalidPath =
      process.platform === 'win32'
        ? 'C:\\invalid<>path\\report.md'
        : '/proc/invalid/report.md';

    await expect(generateFileReport(invalidPath, result)).rejects.toThrow();
  });
});
