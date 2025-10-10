/**
 * Détecteur de types et interfaces TypeScript
 */

import { shouldIgnoreFile } from '@annotation/annotation-analyzer';
import { Declaration, DeclarationType } from '$types/analysis';
import { DetectorConfig } from '$types/config';
import { createDeclaration } from '@utils/declaration-utils';
import { isValidName } from '@utils/identifier-utils';
import { isInString } from '@utils/string-utils';

/**
 * Détecte les déclarations de types et interfaces dans les lignes de code
 */
export const detectDefinitions = (
  filePath: string,
  lines: string[],
  config?: DetectorConfig,
): Declaration[] => {
  // Vérifier si le fichier entier doit être ignoré
  if (config?.ignoreAnnotations && shouldIgnoreFile(lines)) {
    return [];
  }

  const declarations: Declaration[] = [];
  const regexType =
    /^export\s+type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|^type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/;
  const regexInterface =
    /^export\s+interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|^interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    if (!line) continue;

    const ligneTrimmed = line.trim();

    if (!ligneTrimmed) {
      continue;
    }

    const lineNumber = lineIndex + 1;

    // Détecter types
    const matchType = regexType.exec(ligneTrimmed);
    if (matchType) {
      const nom = matchType[1] || matchType[2];
      if (nom && isValidName(nom)) {
        const position = line.indexOf(nom);
        if (position !== -1 && !isInString(line, position)) {
          declarations.push(
            createDeclaration(
              nom,
              DeclarationType.DEFINITION,
              filePath,
              lineNumber,
              position + 1,
              'type',
            ),
          );
        }
      }
    }

    // Détecter interfaces
    const matchInterface = regexInterface.exec(ligneTrimmed);
    if (matchInterface) {
      const nom = matchInterface[1] || matchInterface[2];
      if (nom && isValidName(nom)) {
        const position = line.indexOf(nom);
        if (position !== -1 && !isInString(line, position)) {
          declarations.push(
            createDeclaration(
              nom,
              DeclarationType.DEFINITION,
              filePath,
              lineNumber,
              position + 1,
              'interface',
            ),
          );
        }
      }
    }
  }

  return declarations;
};
