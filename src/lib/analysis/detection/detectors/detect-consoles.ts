/**
 * Détecteur de console.log et autres méthodes console
 */

import { shouldIgnoreFile } from '@annotation/annotation-analyzer';
import { Declaration, DeclarationType } from '$types/analysis';
import { DetectorConfig } from '$types/config';
import { createDeclaration } from '@utils/declaration-utils';
import { isInString } from '@utils/string-utils';

/**
 * Détecte les appels console
 */
export const detectConsoles = (
  filePath: string,
  lines: string[],
  config?: DetectorConfig,
): Declaration[] => {
  // Vérifier si le fichier entier doit être ignoré
  if (config?.ignoreAnnotations && shouldIgnoreFile(lines)) {
    return [];
  }

  const declarations: Declaration[] = [];
  const consoleRegex =
    /\b(console\.(log|warn|error|info|debug|table|trace|dir|dirxml|group|groupEnd|time|timeEnd|assert|count|countReset))\s*\(/g;

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

    const lineNumber = lineIndex + 1;

    consoleRegex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = consoleRegex.exec(line)) !== null) {
      const matchPosition = match.index;
      const fullMatch = match[1];

      if (fullMatch && !isInString(line, matchPosition)) {
        const column = matchPosition + 1;
        const declaration = createDeclaration(
          fullMatch,
          DeclarationType.CONSOLE,
          filePath,
          lineNumber,
          column,
        );
        declaration.context = fullMatch;
        declarations.push(declaration);
      }
    }
  }

  return declarations;
};
