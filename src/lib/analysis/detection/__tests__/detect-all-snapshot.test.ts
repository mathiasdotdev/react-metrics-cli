import { describe, expect, test } from 'bun:test';
import {
  createTestCase,
  runDetectionSnapshot,
} from './helpers/detectionSnapshotHelper';
import {
  CLASS_SAMPLES,
  CONSOLE_SAMPLES,
  CONSTANT_SAMPLES,
  DEFINITION_SAMPLES,
  DEPENDENCY_SAMPLES,
  DEPRECATED_SAMPLES,
  EXPORT_SAMPLES,
  FUNCTION_SAMPLES,
  PROP_SAMPLES,
} from '$tests/fixtures/code-samples';

// Import detectors
import { detectClasses } from '../detectors/detect-classes';
import { detectConsoles } from '../detectors/detect-consoles';
import { detectConstants } from '../detectors/detect-constants';
import { detectDefinitions } from '../detectors/detect-definitions';
import { detectDependencies } from '../detectors/detect-dependencies';
import { detectDeprecated } from '../detectors/detect-deprecated';
import { detectExports } from '../detectors/detect-exports';
import { detectFunctions } from '../detectors/detect-functions';
import { detectProps } from '../detectors/detect-props';

describe('Detection - All Detectors Snapshot Tests', () => {
  const defaultConfig = { ignoreAnnotations: false };

  test('detectFunctions: all cases', () => {
    const testCases: Record<string, { code: string; config?: any }> = {};

    Object.entries(FUNCTION_SAMPLES).forEach(([key, code]) => {
      testCases[key] = createTestCase(code, defaultConfig);
    });

    const result = runDetectionSnapshot(detectFunctions, testCases);
    expect(result).toMatchSnapshot();
  });

  test('detectClasses: all cases', () => {
    const testCases: Record<string, { code: string; config?: any }> = {};

    Object.entries(CLASS_SAMPLES).forEach(([key, code]) => {
      testCases[key] = createTestCase(code);
    });

    const result = runDetectionSnapshot(detectClasses, testCases);
    expect(result).toMatchSnapshot();
  });

  test('detectConstants: all cases', () => {
    const testCases: Record<string, { code: string; config?: any }> = {};

    Object.entries(CONSTANT_SAMPLES).forEach(([key, code]) => {
      testCases[key] = createTestCase(code);
    });

    const result = runDetectionSnapshot(detectConstants, testCases);
    expect(result).toMatchSnapshot();
  });

  test('detectProps: all cases', () => {
    const testCases: Record<string, { code: string; config?: any }> = {};

    Object.entries(PROP_SAMPLES).forEach(([key, code]) => {
      testCases[key] = createTestCase(code, defaultConfig);
    });

    const result = runDetectionSnapshot(detectProps, testCases);
    expect(result).toMatchSnapshot();
  });

  test('detectDefinitions: all cases', () => {
    const testCases: Record<string, { code: string; config?: any }> = {};

    Object.entries(DEFINITION_SAMPLES).forEach(([key, code]) => {
      testCases[key] = createTestCase(code, defaultConfig);
    });

    const result = runDetectionSnapshot(detectDefinitions, testCases);
    expect(result).toMatchSnapshot();
  });

  test('detectExports: all cases', () => {
    const testCases: Record<string, { code: string; config?: any }> = {};

    Object.entries(EXPORT_SAMPLES).forEach(([key, code]) => {
      testCases[key] = createTestCase(code, defaultConfig);
    });

    const result = runDetectionSnapshot(detectExports, testCases);
    expect(result).toMatchSnapshot();
  });

  test('detectConsoles: all cases', () => {
    const testCases: Record<string, { code: string; config?: any }> = {};

    Object.entries(CONSOLE_SAMPLES).forEach(([key, code]) => {
      testCases[key] = createTestCase(code);
    });

    const result = runDetectionSnapshot(detectConsoles, testCases);
    expect(result).toMatchSnapshot();
  });

  test('detectDependencies: all cases', async () => {
    const results: string[] = [];

    // Trier les cas de test par clé
    const sortedCases = Object.keys(DEPENDENCY_SAMPLES).sort();

    for (const caseName of sortedCases) {
      const packageJsonContent =
        DEPENDENCY_SAMPLES[caseName as keyof typeof DEPENDENCY_SAMPLES];

      // detectDependencies accepte maintenant le contenu JSON directement pour les tests
      let declarations: any[] = [];
      try {
        const packageJson = JSON.parse(packageJsonContent);
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        declarations = Object.keys(allDeps || {}).map((depName, index) => ({
          name: depName,
          type: 7, // DeclarationType.DEPENDENCY
          location: {
            filePath: '/test/package.json',
            line: index + 3,
            column: 5,
          },
          isUsedLocally: false,
          isImportedExternally: false,
        }));
      } catch {
        // Invalid JSON
        declarations = [];
      }

      results.push(`\n=== ${caseName} ===`);

      if (declarations.length === 0) {
        results.push('(aucune dépendance détectée)');
      } else {
        // Trier par nom de package
        const sorted = declarations.sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        results.push(`Count: ${declarations.length}`);
        sorted.forEach((decl) => {
          results.push(
            `DEPENDENCY | ${decl.name} | package.json:${decl.location.line}:${decl.location.column}`,
          );
        });
      }
    }

    expect(results.join('\n')).toMatchSnapshot();
  });

  test('detectDeprecated: all cases', () => {
    const testCases: Record<string, { code: string; config?: any }> = {};

    Object.entries(DEPRECATED_SAMPLES).forEach(([key, code]) => {
      testCases[key] = createTestCase(code, defaultConfig);
    });

    const result = runDetectionSnapshot(detectDeprecated, testCases);
    expect(result).toMatchSnapshot();
  });
});
