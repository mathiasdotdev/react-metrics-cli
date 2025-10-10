import type { Declaration } from '$types/analysis';
import { DeclarationType } from '$types/analysis';

/**
 * Normalise une déclaration pour le snapshot
 */
export function normalizeDeclaration(decl: Declaration): string {
  const type = DeclarationType[decl.type];
  const file = decl.location.filePath.replace(/\\/g, '/').replace(/^.*\//, '');
  return `${type} | ${decl.name} | ${file}:${decl.location.line}:${decl.location.column}`;
}

/**
 * Exécute un détecteur et retourne un résultat normalisé pour snapshot
 */
export function runDetectionSnapshot(
  detectorFn: (
    filePath: string,
    lines: string[],
    ...args: any[]
  ) => Declaration[],
  testCases: Record<string, { code: string; config?: any }>,
  testFilePath: string = '/test/file.ts',
): string {
  const results: string[] = [];

  // Trier les cas de test par clé pour la reproductibilité
  const sortedCases = Object.keys(testCases).sort();

  for (const caseName of sortedCases) {
    const testCase = testCases[caseName];
    const lines = testCase.code.split('\n');
    const config = testCase.config || {};

    const declarations = detectorFn(testFilePath, lines, config);

    results.push(`\n=== ${caseName} ===`);

    if (declarations.length === 0) {
      results.push('(aucune déclaration détectée)');
    } else {
      // Trier les déclarations par ligne pour la reproductibilité
      const sorted = declarations.sort(
        (a, b) => a.location.line - b.location.line,
      );
      results.push(`Count: ${declarations.length}`);
      sorted.forEach((decl) => {
        results.push(normalizeDeclaration(decl));
      });
    }
  }

  return results.join('\n');
}

/**
 * Crée un cas de test simple
 */
export function createTestCase(
  code: string,
  config?: any,
): { code: string; config?: any } {
  return { code, config };
}
