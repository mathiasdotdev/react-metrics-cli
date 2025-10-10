import type { Declaration } from '$types/analysis';
import { DeclarationType, isUsed } from '$types/analysis';

/**
 * Crée une déclaration de test
 */
export function createDeclaration(
  name: string,
  type: DeclarationType,
  filePath: string = '/test/file.ts',
  line: number = 1,
  column: number = 1,
): Declaration {
  return {
    name,
    type,
    location: { filePath, line, column },
    isUsedLocally: false,
    isImportedExternally: false,
  };
}

/**
 * Crée une Map de déclarations
 */
export function createDeclarations(
  declarations: Declaration[],
): Map<string, Declaration> {
  const map = new Map<string, Declaration>();
  declarations.forEach((decl, index) => {
    map.set(`key${index}`, decl);
  });
  return map;
}

/**
 * Normalise l'état d'une déclaration pour snapshot
 */
export function normalizeDeclarationState(decl: Declaration): string {
  const type = DeclarationType[decl.type];
  const used = isUsed(decl);
  return `${type} | ${decl.name} | used: ${used}`;
}

/**
 * Exécute un vérificateur et retourne un résultat normalisé pour snapshot
 */
export function runVerificationSnapshot(
  verifierFn: (
    content: string,
    declarations: Map<string, Declaration>,
    ...args: any[]
  ) => void,
  testCases: Record<
    string,
    { declarations: Declaration[]; content: string; extraArgs?: any[] }
  >,
): string {
  const results: string[] = [];

  // Trier les cas de test par clé pour la reproductibilité
  const sortedCases = Object.keys(testCases).sort();

  for (const caseName of sortedCases) {
    const testCase = testCases[caseName];
    const declarations = createDeclarations(testCase.declarations);
    const extraArgs = testCase.extraArgs || [];

    // Exécuter le vérificateur
    verifierFn(testCase.content, declarations, ...extraArgs);

    results.push(`\n=== ${caseName} ===`);

    // Afficher l'état de chaque déclaration après vérification
    testCase.declarations.forEach((decl) => {
      results.push(normalizeDeclarationState(decl));
    });
  }

  return results.join('\n');
}

/**
 * Variante pour vérificateurs qui prennent fileContents au lieu de content
 * Supporte les signatures avec 2 ou 3 paramètres
 */
export function runVerificationSnapshotWithFiles(
  verifierFn:
    | ((
        fileContents: Map<string, string>,
        declarations: Map<string, Declaration>,
      ) => void)
    | ((
        content: string,
        declarations: Map<string, Declaration>,
        fileContents: Map<string, string>,
      ) => void),
  testCases: Record<
    string,
    { declarations: Declaration[]; fileContents: Map<string, string> }
  >,
): string {
  const results: string[] = [];

  // Trier les cas de test par clé pour la reproductibilité
  const sortedCases = Object.keys(testCases).sort();

  for (const caseName of sortedCases) {
    const testCase = testCases[caseName];
    const declarations = createDeclarations(testCase.declarations);

    // Exécuter le vérificateur (supporte 2 ou 3 paramètres)
    if (verifierFn.length === 3) {
      // Signature: (content, declarations, fileContents)
      (verifierFn as any)('', declarations, testCase.fileContents);
    } else {
      // Signature: (fileContents, declarations)
      verifierFn(testCase.fileContents, declarations);
    }

    results.push(`\n=== ${caseName} ===`);

    // Afficher l'état de chaque déclaration après vérification
    testCase.declarations.forEach((decl) => {
      results.push(normalizeDeclarationState(decl));
    });
  }

  return results.join('\n');
}
