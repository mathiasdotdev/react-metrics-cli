/**
 * Détecteur de props
 * Détecte :
 * 1. Propriétés dans les définitions de types/interfaces
 * 2. Propriétés dans les littéraux d'objets
 * 3. Constantes avec annotations de type
 */

import { shouldIgnoreFile } from '@annotation/annotation-analyzer';
import { Declaration, DeclarationType } from '$types/analysis';
import { DetectorConfig } from '$types/config';
import { createDeclaration } from '@utils/declaration-utils';
import { isInString } from '@utils/string-utils';

/**
 * Détecte les props
 */
export const detectProps = (
  filePath: string,
  lines: string[],
  config?: DetectorConfig,
): Declaration[] => {
  // Vérifier si le fichier entier doit être ignoré
  if (config?.ignoreAnnotations && shouldIgnoreFile(lines)) {
    return [];
  }

  const declarations: Declaration[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
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

    const lineNumber = lineIndex + 1;

    // 1. Détecter les propriétés dans les types/interfaces: "  propName: type"
    const typePropMatch = /^\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[?:]/.exec(line);
    if (typePropMatch && typePropMatch[1] && !isInString(line, 0)) {
      const propName = typePropMatch[1];
      // Ignorer les mots-clés
      if (
        ![
          'type',
          'interface',
          'extends',
          'implements',
          'export',
          'import',
          'function',
          'class',
          'const',
          'let',
          'var',
        ].includes(propName)
      ) {
        // Vérifier si on est dans une définition de type/interface
        // Chercher en arrière pour voir si on est dans un bloc type/interface
        let inTypeOrInterface = false;
        for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 20); i--) {
          const prevLine = lines[i]?.trim() || '';
          if (prevLine.match(/^(export\s+)?(type|interface)\s+[a-zA-Z_$]/)) {
            inTypeOrInterface = true;
            break;
          }
          if (
            prevLine.includes('}') ||
            prevLine.match(/^(const|let|var|function|class)/)
          ) {
            break;
          }
        }

        if (inTypeOrInterface) {
          const column = line.indexOf(propName) + 1;
          declarations.push(
            createDeclaration(
              propName,
              DeclarationType.PROP,
              filePath,
              lineNumber,
              column,
            ),
          );
          continue;
        }
      }
    }

    // 2. Détecter les propriétés dans les objets littéraux: "  propName: value"
    // Mais exclure les annotations de type (const x: Type)
    const objPropMatch = /^\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*[^,}]+/.exec(
      line,
    );
    if (
      objPropMatch &&
      objPropMatch[1] &&
      !line.includes('const ') &&
      !line.includes('let ') &&
      !line.includes('var ') &&
      !isInString(line, 0)
    ) {
      const propName = objPropMatch[1];
      const column = line.indexOf(propName) + 1;
      declarations.push(
        createDeclaration(
          propName,
          DeclarationType.PROP,
          filePath,
          lineNumber,
          column,
        ),
      );
      continue;
    }
    // 4. Détecter les constantes avec annotations de type: const name: Type = value
    // IMPORTANT: Détecter ceci EN PREMIER pour éviter de détecter les props dans l'objet littéral
    const typedConstMatch =
      /\b(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*[^=]+=/;
    const match = typedConstMatch.exec(line);
    if (match && match[2] && !isInString(line, match.index)) {
      const constName = match[2];
      const column = line.indexOf(constName, match.index) + 1;
      declarations.push(
        createDeclaration(
          constName,
          DeclarationType.PROP,
          filePath,
          lineNumber,
          column,
        ),
      );
      continue; // Skip inline detection for this line
    }

    // 3. Détecter les propriétés inline dans les objets: ", propName:" ou "{ propName:"
    // Ne pas détecter si déjà trouvé une propriété sur cette ligne
    if (!declarations.some((d) => d.location.line === lineNumber)) {
      const inlineRegex = /[,{]\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g;
      let inlineMatch: RegExpExecArray | null;
      while ((inlineMatch = inlineRegex.exec(line)) !== null) {
        const matchPosition = inlineMatch.index;
        const propName = inlineMatch[1];
        if (propName && !isInString(line, matchPosition)) {
          // Vérifier que ce n'est pas une annotation de type (const x: Type)
          const beforeMatch = line.substring(0, matchPosition);
          if (
            !beforeMatch.match(
              /\b(const|let|var)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*$/,
            )
          ) {
            const column = line.indexOf(propName, matchPosition) + 1;
            declarations.push(
              createDeclaration(
                propName,
                DeclarationType.PROP,
                filePath,
                lineNumber,
                column,
              ),
            );
          }
        }
      }
    }
  }

  return declarations;
};
