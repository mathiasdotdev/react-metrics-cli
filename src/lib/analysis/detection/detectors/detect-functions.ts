/**
 * Détecteur de fonctions
 */

import { Declaration, DeclarationType } from '$types/analysis';
import { DetectorConfig } from '$types/config';
import {
  shouldIgnoreDeclarationWithContext,
  shouldIgnoreFile,
} from '@annotation/annotation-analyzer';
import { createDeclaration } from '@utils/declaration-utils';
import { isImportOrExport, isInString } from '@utils/string-utils';

/**
 * Détecte les déclarations de fonctions dans les lignes de code
 */
export const detectFunctions = (
  filePath: string,
  lines: string[],
  config?: DetectorConfig,
): Declaration[] => {
  const declarations: Declaration[] = [];

  // Vérifier si le fichier entier doit être ignoré
  if (config?.ignoreAnnotations && shouldIgnoreFile(lines)) {
    return declarations;
  }

  const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  const arrowRegex =
    /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>/g;

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

    const lineNumber = lineIndex + 1;

    // Détecter les fonctions classiques
    functionRegex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = functionRegex.exec(line)) !== null) {
      const matchPosition = match.index;
      const name = match[1];

      if (name && !isInString(line, matchPosition)) {
        // Vérifier les annotations d'ignore
        if (
          config?.ignoreAnnotations &&
          shouldIgnoreDeclarationWithContext(
            lines,
            lineNumber,
            config.contextLines || 3,
          )
        ) {
          continue;
        }

        const column = line.indexOf(name) + 1;
        declarations.push(
          createDeclaration(
            name,
            DeclarationType.FUNCTION,
            filePath,
            lineNumber,
            column,
          ),
        );
      }
    }

    // Détecter les fonctions fléchées
    arrowRegex.lastIndex = 0;
    while ((match = arrowRegex.exec(line)) !== null) {
      const matchPosition = match.index;
      const name = match[1];

      if (name && !isInString(line, matchPosition)) {
        // Vérifier les annotations d'ignore
        if (
          config?.ignoreAnnotations &&
          shouldIgnoreDeclarationWithContext(
            lines,
            lineNumber,
            config.contextLines || 3,
          )
        ) {
          continue;
        }

        const column = line.indexOf(name) + 1;
        declarations.push(
          createDeclaration(
            name,
            DeclarationType.FUNCTION,
            filePath,
            lineNumber,
            column,
          ),
        );
      }
    }

    // NE PAS détecter les méthodes de classe (constructor, render, etc.)
    // Les méthodes font partie de la classe et ne sont jamais "mortes" indépendamment
  }

  return declarations;
};
