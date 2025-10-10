/**
 * Détecteur de classes
 */

import { Declaration, DeclarationType } from '$types/analysis';
import { DetectorConfig } from '$types/config';
import { shouldIgnoreFile } from '@annotation/annotation-analyzer';
import { createDeclaration } from '@utils/declaration-utils';
import { isImportOrExport, isInString } from '@utils/string-utils';

/**
 * Détecte les déclarations de classes dans les lignes de code
 */
export const detectClasses = (
  filePath: string,
  lines: string[],
  config?: DetectorConfig,
): Declaration[] => {
  // Vérifier si le fichier entier doit être ignoré
  if (config?.ignoreAnnotations && shouldIgnoreFile(lines)) {
    return [];
  }

  const declarations: Declaration[] = [];
  const regex = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    if (!line) continue;

    // Ignorer les commentaires
    const trimmed = line.trim();
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*')
    ) {
      continue;
    }

    // Ignorer les imports/exports
    if (isImportOrExport(line)) {
      continue;
    }

    regex.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(line)) !== null) {
      const matchPosition = match.index;
      const name = match[1];

      if (name && !isInString(line, matchPosition)) {
        const column = line.indexOf(name) + 1;
        const lineNumber = lineIndex + 1;
        declarations.push(
          createDeclaration(
            name,
            DeclarationType.CLASS,
            filePath,
            lineNumber,
            column,
            undefined,
          ),
        );
      }
    }
  }

  return declarations;
};
