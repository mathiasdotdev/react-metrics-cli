/**
 * Vérificateur d'utilisation des dépendances
 */

import { Declaration, DeclarationType, isUsed } from '$types/analysis';

/**
 * Vérifie si une dépendance est importée dans un fichier
 */
const isImportedInFile = (content: string, packageName: string): boolean => {
  const lines = content.split('\n');

  for (const line of lines) {
    // Ignorer les commentaires
    const trimmed = line.trim();
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*')
    ) {
      continue;
    }

    // Vérifier les imports avec 'from'
    if (line.includes('import') && line.includes('from')) {
      // import ... from 'packageName'
      if (
        line.includes(`'${packageName}'`) ||
        line.includes(`"${packageName}"`)
      ) {
        return true;
      }
      // import ... from 'packageName/submodule'
      if (
        line.includes(`'${packageName}/`) ||
        line.includes(`"${packageName}/`)
      ) {
        return true;
      }
    }

    // Side-effect imports sans 'from': import 'dotenv/config'
    if (line.includes('import') && !line.includes('from')) {
      if (
        line.includes(`'${packageName}'`) ||
        line.includes(`"${packageName}"`)
      ) {
        return true;
      }
      if (
        line.includes(`'${packageName}/`) ||
        line.includes(`"${packageName}/`)
      ) {
        return true;
      }
    }

    // export ... from 'packageName'
    if (line.includes('export') && line.includes('from')) {
      if (
        line.includes(`'${packageName}'`) ||
        line.includes(`"${packageName}"`)
      ) {
        return true;
      }
      if (
        line.includes(`'${packageName}/`) ||
        line.includes(`"${packageName}/`)
      ) {
        return true;
      }
    }

    // require('packageName')
    if (
      line.includes('require') &&
      (line.includes(`'${packageName}'`) || line.includes(`"${packageName}"`))
    ) {
      return true;
    }

    // Dynamic import: import('packageName')
    if (
      line.includes('import(') &&
      (line.includes(`'${packageName}'`) || line.includes(`"${packageName}"`))
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Vérifie si une dépendance est utilisée
 */
const isDependencyUsed = (
  declaration: Declaration,
  fileContents: Map<string, string>,
): boolean => {
  // Parcourir tous les fichiers pour voir si la dépendance est importée
  for (const [_filePath, content] of fileContents) {
    if (isImportedInFile(content, declaration.name)) {
      return true;
    }
  }

  return false;
};

/**
 * Vérifie les utilisations des dépendances
 */
export const verifyDependencies = (
  _content: string,
  declarations: Map<string, Declaration>,
  fileContents: Map<string, string>,
): void => {
  // Vérifier si la dépendance apparaît dans les imports de tous les fichiers
  for (const [_key, declaration] of declarations) {
    if (
      declaration.type !== DeclarationType.DEPENDENCY ||
      isUsed(declaration)
    ) {
      continue;
    }

    if (isDependencyUsed(declaration, fileContents)) {
      declaration.isUsedLocally = true;
    }
  }
};
