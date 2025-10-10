import { Declaration, DeclarationType } from '$types/analysis';
import { DetectorConfig } from '$types/config';
import {
  isDeprecatedDeclaration,
  shouldIgnoreFile,
} from '@annotation/annotation-analyzer';
import { createDeclaration } from '@utils/declaration-utils';
import { isInString } from '@utils/string-utils';

/**
 * Détecte toutes les déclarations marquées @deprecated dans les lignes de code
 */
export const detectDeprecated = (
  filePath: string,
  lines: string[],
  config?: DetectorConfig,
): Declaration[] => {
  const declarations: Declaration[] = [];

  // Vérifier si le fichier entier doit être ignoré
  if (config?.ignoreAnnotations && shouldIgnoreFile(lines)) {
    return declarations;
  }

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

    // Ignorer les imports
    if (line.trim().startsWith('import ')) {
      continue;
    }

    const lineNumber = lineIndex + 1;

    // Vérifier si cette ligne contient une déclaration @deprecated
    if (!isDeprecatedDeclaration(lines, lineNumber)) {
      continue;
    }

    // Détecter les fonctions: function foo() ou const foo = () =>
    const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    const arrowRegex =
      /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>/g;

    let match: RegExpExecArray | null;

    // Fonctions classiques
    functionRegex.lastIndex = 0;
    while ((match = functionRegex.exec(line)) !== null) {
      const matchPosition = match.index;
      const name = match[1];

      if (name && !isInString(line, matchPosition)) {
        const column = line.indexOf(name) + 1;
        declarations.push(
          createDeclaration(
            name,
            DeclarationType.FUNCTION,
            filePath,
            lineNumber,
            column,
            undefined,
            true,
          ),
        );
      }
    }

    // Fonctions fléchées
    arrowRegex.lastIndex = 0;
    while ((match = arrowRegex.exec(line)) !== null) {
      const matchPosition = match.index;
      const name = match[1];

      if (name && !isInString(line, matchPosition)) {
        const column = line.indexOf(name) + 1;
        declarations.push(
          createDeclaration(
            name,
            DeclarationType.FUNCTION,
            filePath,
            lineNumber,
            column,
            undefined,
            true,
          ),
        );
      }
    }

    // Détecter les classes
    const classRegex = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    classRegex.lastIndex = 0;
    while ((match = classRegex.exec(line)) !== null) {
      const matchPosition = match.index;
      const name = match[1];

      if (name && !isInString(line, matchPosition)) {
        const column = line.indexOf(name) + 1;
        declarations.push(
          createDeclaration(
            name,
            DeclarationType.CLASS,
            filePath,
            lineNumber,
            column,
            undefined,
            true,
          ),
        );
      }
    }

    // Détecter les constantes: const FOO =
    const constantRegex = /\b(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    constantRegex.lastIndex = 0;
    while ((match = constantRegex.exec(line)) !== null) {
      const matchPosition = match.index;
      const name = match[2];

      // Ne pas détecter les fonctions fléchées (déjà gérées)
      if (name && !isInString(line, matchPosition) && !line.includes('=>')) {
        const column = line.indexOf(name, matchPosition) + 1;
        declarations.push(
          createDeclaration(
            name,
            DeclarationType.CONSTANT,
            filePath,
            lineNumber,
            column,
            undefined,
            true,
          ),
        );
      }
    }

    // Détecter les types et interfaces
    const typeRegex = /\btype\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    const interfaceRegex = /\binterface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;

    typeRegex.lastIndex = 0;
    while ((match = typeRegex.exec(line)) !== null) {
      const matchPosition = match.index;
      const name = match[1];

      if (name && !isInString(line, matchPosition)) {
        const column = line.indexOf(name, matchPosition) + 1;
        declarations.push(
          createDeclaration(
            name,
            DeclarationType.DEFINITION,
            filePath,
            lineNumber,
            column,
            'type',
            true,
          ),
        );
      }
    }

    interfaceRegex.lastIndex = 0;
    while ((match = interfaceRegex.exec(line)) !== null) {
      const matchPosition = match.index;
      const name = match[1];

      if (name && !isInString(line, matchPosition)) {
        const column = line.indexOf(name, matchPosition) + 1;
        declarations.push(
          createDeclaration(
            name,
            DeclarationType.DEFINITION,
            filePath,
            lineNumber,
            column,
            'interface',
            true,
          ),
        );
      }
    }

    // Détecter les props dans interfaces/types (une ligne après)
    const propRegex = /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[?:]?\s*:/;
    const propMatch = propRegex.exec(line);
    if (propMatch && propMatch[1]) {
      const name = propMatch[1];
      const column = line.indexOf(name) + 1;
      declarations.push(
        createDeclaration(
          name,
          DeclarationType.PROP,
          filePath,
          lineNumber,
          column,
          undefined,
          true,
        ),
      );
    }
  }

  return declarations;
};
