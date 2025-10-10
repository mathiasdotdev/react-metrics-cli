/**
 * Vérificateur d'utilisation des exports
 */

import { Declaration, DeclarationType, isUsed } from '$types/analysis';

/**
 * Vérifie si un export est importé dans un fichier
 */
const isImportedInFile = (
  content: string,
  exportName: string,
  sourceFilePath: string,
  importingFilePath: string,
): boolean => {
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

    // Vérifier les imports et re-exports
    if (
      (line.includes('import') || line.includes('export')) &&
      line.includes(exportName)
    ) {
      // Nettoyer les espaces multiples et les trailing commas
      const cleanedLine = line.replace(/\s+/g, ' ').replace(/,\s*}/g, ' }');

      // Créer une regex pour matcher le nom d'export avec espaces optionnels
      const escapedName = exportName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // import { exportName } from ... ou export { exportName } from ...
      const singleImportRegex = new RegExp(`[{,]\\s*${escapedName}\\s*[},]`);
      if (singleImportRegex.test(cleanedLine)) {
        // Vérifier que l'import provient du bon fichier source
        const fromMatch = line.match(/from\s+['"]([^'"]+)['"]/);
        if (!fromMatch) {
          return false;
        }

        const importPath = fromMatch[1];
        if (!importPath) {
          return false;
        }

        const normalizedSource = sourceFilePath.replace(/\\/g, '/');
        const normalizedImporting = importingFilePath.replace(/\\/g, '/');

        // Si c'est un chemin relatif
        if (importPath.startsWith('.')) {
          const importingDir = normalizedImporting.substring(
            0,
            normalizedImporting.lastIndexOf('/'),
          );
          let resolvedPath: string = importPath;
          if (importPath.startsWith('./')) {
            resolvedPath = importingDir + importPath.substring(1);
          } else if (importPath.startsWith('../')) {
            const parts = importPath.split('/');
            let currentDir = importingDir;
            for (const part of parts) {
              if (part === '..') {
                currentDir = currentDir.substring(
                  0,
                  currentDir.lastIndexOf('/'),
                );
              } else if (part !== '.') {
                currentDir += '/' + part;
              }
            }
            resolvedPath = currentDir;
          }

          const sourceWithoutExt = normalizedSource.replace(
            /\.(ts|tsx|js|jsx)$/,
            '',
          );
          const resolvedWithoutExt = resolvedPath.replace(
            /\.(ts|tsx|js|jsx)$/,
            '',
          );

          if (sourceWithoutExt === resolvedWithoutExt) {
            return true;
          }
        }
      }
    }
  }

  return false;
};

/**
 * Vérifie si un export est utilisé localement dans le même fichier où il est déclaré
 */
const isUsedLocallyInFile = (content: string, exportName: string): boolean => {
  const lines = content.split('\n');
  const escapedName = exportName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Regex pour matcher le nom comme identifiant (pas dans une string)
  // \b pour les limites de mots, évite de matcher dans des noms plus longs
  const usageRegex = new RegExp(`\\b${escapedName}\\b`, 'g');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const trimmed = line.trim();

    // Ignorer les commentaires
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*')
    ) {
      continue;
    }

    // Ignorer les lignes d'export (déclaration de l'export lui-même)
    if (trimmed.startsWith('export ')) {
      continue;
    }

    // Ignorer les lignes d'import (fichier qui s'importe lui-même)
    if (trimmed.startsWith('import ')) {
      continue;
    }

    // Retirer les strings pour éviter les faux positifs
    const lineWithoutStrings = line
      .replace(/'[^']*'/g, "''")
      .replace(/"[^"]*"/g, '""')
      .replace(/`[^`]*`/g, '``');

    // Chercher des utilisations du nom
    const matches = lineWithoutStrings.match(usageRegex);
    if (matches && matches.length > 0) {
      return true;
    }
  }

  return false;
};

/**
 * Vérifie si un export est importé dans d'autres fichiers
 */
const isExportedAndImported = (
  declaration: Declaration,
  fileContents: Map<string, string>,
): boolean => {
  // Parcourir tous les autres fichiers
  for (const [filePath, content] of fileContents) {
    // Ignorer le fichier où l'export est déclaré
    if (filePath === declaration.location.filePath) {
      continue;
    }

    // Chercher des imports de cet export depuis le fichier source
    if (
      isImportedInFile(
        content,
        declaration.name,
        declaration.location.filePath,
        filePath,
      )
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Phase 1: Vérifie l'utilisation locale des exports dans le même fichier
 */
export const verifyLocalUsage = (
  _content: string,
  declarations: Map<string, Declaration>,
  fileContents: Map<string, string>,
): void => {
  for (const [_key, declaration] of declarations) {
    if (declaration.type !== DeclarationType.EXPORT || isUsed(declaration)) {
      continue;
    }

    // Export default est toujours considéré comme utilisé
    if (declaration.context === 'default export') {
      declaration.isUsedLocally = true;
      declaration.isImportedExternally = true;
      continue;
    }

    // Vérifier si l'export est utilisé localement dans le même fichier
    const sourceFileContent = fileContents.get(declaration.location.filePath);
    if (
      sourceFileContent &&
      isUsedLocallyInFile(sourceFileContent, declaration.name)
    ) {
      declaration.isUsedLocally = true;
    }
  }
};

/**
 * Phase 2: Vérifie si les exports sont importés dans d'autres fichiers
 */
export const verifyExternalImports = (
  _content: string,
  declarations: Map<string, Declaration>,
  fileContents: Map<string, string>,
): void => {
  for (const [_key, declaration] of declarations) {
    if (declaration.type !== DeclarationType.EXPORT || isUsed(declaration)) {
      continue;
    }

    // Vérifier si l'export est importé dans d'autres fichiers
    if (isExportedAndImported(declaration, fileContents)) {
      declaration.isImportedExternally = true;
    }
  }
};
