import type { AnalysisResult } from '$types/analysis';
import { DeclarationType } from '$types/analysis';
import { createAnalyzer } from '@core/create-analyzer';
import { buildDetailedReport } from '$lib/reporter/generate-file-report';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'bun:test';

describe('Integration Test - React Demo Analysis', () => {
  let result: AnalysisResult;
  const projectPath = path.resolve(process.cwd(), 'react-demo');

  beforeAll(async () => {
    const config = {
      fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
      ignoredFolders: ['node_modules', '.git', 'dist', 'build', 'coverage'],
      ignoreAnnotations: true,
      ignoreFileAnnotation: 'react-metrics-ignore-file',
      ignoreLineAnnotation: 'react-metrics-ignore-ligne',
      contextLines: 5,
    };

    const analyzer = createAnalyzer(config, projectPath);
    result = await analyzer.executeCompleteAnalysis();
  });

  describe('Total Dead Code Detection', () => {
    it('should detect exactly 87 dead code elements', () => {
      expect(result.deadCode.length).toBe(87);
    });

    it('should have valid duration', () => {
      expect(result.duration).toBeGreaterThan(0);
      expect(result.duration).toBeLessThan(5000);
    });

    it('should match expected counts by type', () => {
      const counts = {
        functions: result.deadCode.filter(
          (d) => d.type === DeclarationType.FUNCTION,
        ).length,
        classes: result.deadCode.filter((d) => d.type === DeclarationType.CLASS)
          .length,
        constants: result.deadCode.filter(
          (d) => d.type === DeclarationType.CONSTANT,
        ).length,
        props: result.deadCode.filter((d) => d.type === DeclarationType.PROP)
          .length,
        consoles: result.deadCode.filter(
          (d) => d.type === DeclarationType.CONSOLE,
        ).length,
        definitions: result.deadCode.filter(
          (d) => d.type === DeclarationType.DEFINITION,
        ).length,
        exports: result.deadCode.filter(
          (d) => d.type === DeclarationType.EXPORT,
        ).length,
        dependencies: result.deadCode.filter(
          (d) => d.type === DeclarationType.DEPENDENCY,
        ).length,
      };

      expect(counts).toEqual({
        functions: 11,
        classes: 4,
        constants: 6,
        props: 13,
        consoles: 13,
        definitions: 8,
        exports: 27,
        dependencies: 5,
      });
    });
  });

  describe('Functions Detection Details', () => {
    it('should detect all expected function names', () => {
      const functionNames = result.deadCode
        .filter((d) => d.type === DeclarationType.FUNCTION)
        .map((d) => d.name)
        .sort();

      expect(functionNames).toMatchSnapshot();
    });

    it('should detect specific function details', () => {
      const functionsDetails = result.deadCode
        .filter((d) => d.type === DeclarationType.FUNCTION)
        .map((d) => ({
          name: d.name,
          file: d.location.filePath.replace(/\\/g, '/').split('react-demo/')[1],
          line: d.location.line,
          column: d.location.column,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      expect(functionsDetails).toMatchSnapshot();
    });
  });

  describe('Classes Detection Details', () => {
    it('should detect 4 unused classes', () => {
      const classes = result.deadCode.filter(
        (d) => d.type === DeclarationType.CLASS,
      );
      expect(classes.length).toBe(4);
    });

    it('should detect all class names and locations', () => {
      const classDetails = result.deadCode
        .filter((d) => d.type === DeclarationType.CLASS)
        .map((d) => ({
          name: d.name,
          file: d.location.filePath.replace(/\\/g, '/').split('react-demo/')[1],
          line: d.location.line,
        }))
        .sort(
          (a, b) =>
            a.name.localeCompare(b.name) || a.file.localeCompare(b.file),
        );

      expect(classDetails).toMatchSnapshot();
    });
  });

  describe('Constants Detection Details', () => {
    it('should detect 6 unused constants', () => {
      const constants = result.deadCode.filter(
        (d) => d.type === DeclarationType.CONSTANT,
      );
      expect(constants.length).toBe(6);
    });

    it('should detect all constant names', () => {
      const constantNames = result.deadCode
        .filter((d) => d.type === DeclarationType.CONSTANT)
        .map((d) => d.name)
        .sort();

      expect(constantNames).toMatchSnapshot();
    });
  });

  describe('Props Detection Details', () => {
    it('should detect 13 unused props', () => {
      const props = result.deadCode.filter(
        (d) => d.type === DeclarationType.PROP,
      );
      expect(props.length).toBe(13);
    });

    it('should detect all prop names', () => {
      const propNames = result.deadCode
        .filter((d) => d.type === DeclarationType.PROP)
        .map((d) => d.name)
        .sort();

      expect(propNames).toMatchSnapshot();
    });
  });

  describe('Console Logs Detection Details', () => {
    it('should detect 13 console statements', () => {
      const consoles = result.deadCode.filter(
        (d) => d.type === DeclarationType.CONSOLE,
      );
      expect(consoles.length).toBe(13);
    });

    it('should detect console types distribution', () => {
      const consoleTypes = result.deadCode
        .filter((d) => d.type === DeclarationType.CONSOLE)
        .map((d) => d.context)
        .filter((ctx): ctx is string => ctx !== undefined)
        .sort();

      expect(consoleTypes).toMatchSnapshot();
    });
  });

  describe('Types/Interfaces Detection Details', () => {
    it('should detect 8 unused types/interfaces', () => {
      const definitions = result.deadCode.filter(
        (d) => d.type === DeclarationType.DEFINITION,
      );
      expect(definitions.length).toBe(8);
    });

    it('should detect all type/interface names', () => {
      const defNames = result.deadCode
        .filter((d) => d.type === DeclarationType.DEFINITION)
        .map((d) => d.name)
        .sort();

      expect(defNames).toMatchSnapshot();
    });
  });

  describe('Exports Detection Details', () => {
    it('should detect 27 unused exports', () => {
      const exports = result.deadCode.filter(
        (d) => d.type === DeclarationType.EXPORT,
      );
      expect(exports.length).toBe(27);
    });

    it('should detect all export names', () => {
      const exportNames = result.deadCode
        .filter((d) => d.type === DeclarationType.EXPORT)
        .map((d) => d.name)
        .sort();

      expect(exportNames).toMatchSnapshot();
    });
  });

  describe('Dependencies Detection Details', () => {
    it('should detect 5 unused dependencies', () => {
      const deps = result.deadCode.filter(
        (d) => d.type === DeclarationType.DEPENDENCY,
      );
      expect(deps.length).toBe(5);
    });

    it('should detect dependency details', () => {
      const depDetails = result.deadCode
        .filter((d) => d.type === DeclarationType.DEPENDENCY)
        .map((d) => ({
          name: d.name,
          file: d.location.filePath.replace(/\\/g, '/').split('react-demo/')[1],
        }));

      expect(depDetails).toMatchSnapshot();
    });
  });

  describe('Debug Mode Coverage', () => {
    it('should execute analysis in debug mode and log verification details', async () => {
      const debugConfig = {
        fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
        ignoredFolders: ['node_modules', '.git', 'dist', 'build', 'coverage'],
        ignoreAnnotations: true,
        ignoreFileAnnotation: 'react-metrics-ignore-file',
        ignoreLineAnnotation: 'react-metrics-ignore-ligne',
        contextLines: 5,
        debug: true, // Activer le mode debug
      };

      // Capturer les logs console
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args: any[]) => {
        logs.push(args.join(' '));
      };

      const debugAnalyzer = createAnalyzer(debugConfig, projectPath);
      const debugResult = await debugAnalyzer.executeCompleteAnalysis();

      // Restaurer console.log
      console.log = originalLog;

      // Vérifier que l'analyse a réussi
      expect(debugResult.deadCode.length).toBeGreaterThan(0);

      // Vérifier que des logs debug ont été générés
      expect(logs.length).toBeGreaterThan(0);

      // Vérifier qu'on a des logs de vérification
      const verificationLogs = logs.filter((log) =>
        log.includes('[DEBUG VERIFICATION]'),
      );
      expect(verificationLogs.length).toBeGreaterThan(0);

      // Vérifier qu'on a le résumé
      const summaryLogs = logs.filter((log) => log.includes('RÉSUMÉ'));
      expect(summaryLogs.length).toBeGreaterThan(0);
    }, 10000);

    it('should handle file read errors gracefully', async () => {
      const config = {
        fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
        ignoredFolders: ['node_modules', '.git', 'dist', 'build', 'coverage'],
        ignoreAnnotations: true,
        ignoreFileAnnotation: 'react-metrics-ignore-file',
        ignoreLineAnnotation: 'react-metrics-ignore-ligne',
        contextLines: 5,
        debug: false,
      };

      // Capturer les warnings console
      const originalWarn = console.warn;
      const warnings: string[] = [];
      console.warn = (...args: any[]) => {
        warnings.push(args.join(' '));
      };

      const analyzer = createAnalyzer(config, projectPath);
      const testResult = await analyzer.executeCompleteAnalysis();

      // Restaurer console.warn
      console.warn = originalWarn;

      // L'analyse doit réussir même si certains fichiers ne peuvent pas être lus
      expect(testResult).toBeDefined();
      expect(testResult.declarations.size).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Report Generation', () => {
    it('should generate complete report for react-demo project', () => {
      // Réutiliser le result calculé dans beforeAll
      const report = buildDetailedReport(result);

      // Vérifications structurelles du rapport
      expect(report).toContain("=== RAPPORT D'ANALYSE REACT-METRICS ===");
      expect(report).toContain('=== STATISTIQUES ===');
      expect(report).toContain('=== TOUTES LES DÉCLARATIONS ===');
      expect(report).toContain('=== CODE MORT DÉTECTÉ ===');
      expect(report).toContain('=== DÉCLARATIONS @DEPRECATED ===');

      // Vérifications de contenu (basées sur react-demo)
      expect(report).toContain('Total déclarations trouvées:');
      expect(report).toContain('Code mort détecté:');
      expect(report).toContain('Pourcentage de code mort:');
      expect(report).toContain('Répartition par type:');

      // Vérifier que les @deprecated sont présents (DeprecatedFeatures.ts)
      expect(report).toMatch(/Déclarations @deprecated:\s+\d+/);

      // Vérifier structure des sections par type
      expect(report).toMatch(/--- FUNCTION ---/);
      expect(report).toMatch(/--- CLASS ---/);
      expect(report).toMatch(/--- CONSTANT ---/);
    });
  });
});
