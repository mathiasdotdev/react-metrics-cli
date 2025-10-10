/**
 * Détecteur de constantes
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
 * Détecte les déclarations de constantes dans les lignes de code
 */
export const detectConstants = (
  filePath: string,
  lines: string[],
  config?: DetectorConfig,
): Declaration[] => {
  // Vérifier si le fichier entier doit être ignoré
  if (config?.ignoreAnnotations && shouldIgnoreFile(lines)) {
    return [];
  }

  const declarations: Declaration[] = [];
  const regex = /\b(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  const destructuringRegex = /\b(const|let|var)\s*\{\s*([^}]+)\s*\}\s*=/g;
  const arrayDestructuringRegex = /\b(const|let|var)\s*\[\s*([^\]]+)\s*\]\s*=/g;

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

    // Vérifier si la déclaration doit être ignorée
    if (
      config?.ignoreAnnotations &&
      shouldIgnoreDeclarationWithContext(lines, lineNumber)
    ) {
      continue;
    }

    // Détecter la destructuration d'objet: const { a, b } = ...
    destructuringRegex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = destructuringRegex.exec(line)) !== null) {
      const matchPosition = match.index;
      if (!isInString(line, matchPosition) && match[2]) {
        const props = match[2].split(',');
        // On ne détecte que le premier pour éviter la duplication
        const firstProp = props[0]?.trim().split(/\s|:/)[0];
        if (firstProp) {
          const column = line.indexOf(firstProp) + 1;
          declarations.push(
            createDeclaration(
              firstProp,
              DeclarationType.CONSTANT,
              filePath,
              lineNumber,
              column,
              undefined,
            ),
          );
        }
      }
    }

    // Si on a déjà détecté une destructuration, passer à la ligne suivante
    if (declarations.some((d) => d.location.line === lineNumber)) {
      continue;
    }

    // Détecter la destructuration de tableau: const [a, b] = ...
    arrayDestructuringRegex.lastIndex = 0;
    while ((match = arrayDestructuringRegex.exec(line)) !== null) {
      const matchPosition = match.index;
      if (!isInString(line, matchPosition) && match[2]) {
        const items = match[2].split(',');
        // On ne détecte que le premier
        const firstItem = items[0]?.trim();
        if (firstItem) {
          const column = line.indexOf(firstItem) + 1;
          declarations.push(
            createDeclaration(
              firstItem,
              DeclarationType.CONSTANT,
              filePath,
              lineNumber,
              column,
              undefined,
            ),
          );
        }
      }
    }

    // Si on a déjà détecté une destructuration, passer à la ligne suivante
    if (declarations.some((d) => d.location.line === lineNumber)) {
      continue;
    }

    // Détecter les déclarations normales: const x = ...
    // Mais exclure celles avec annotation de type (const x: Type = ...) car elles sont détectées comme PROP
    regex.lastIndex = 0;
    while ((match = regex.exec(line)) !== null) {
      const matchPosition = match.index;
      const name = match[2];

      // Vérifier que le match n'est pas dans une chaîne
      if (name && !isInString(line, matchPosition)) {
        // Vérifier si c'est une constante avec annotation de type
        const afterName = line.substring(matchPosition + match[0].length);
        if (afterName.match(/^\s*:/)) {
          // C'est une constante typée, elle sera détectée comme PROP
          continue;
        }

        // Vérifier si c'est une arrow function
        if (
          afterName.match(/^\s*=\s*(\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/)
        ) {
          // C'est une arrow function, elle sera détectée comme FUNCTION
          continue;
        }

        const column = line.indexOf(name, matchPosition) + 1;
        declarations.push(
          createDeclaration(
            name,
            DeclarationType.CONSTANT,
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
