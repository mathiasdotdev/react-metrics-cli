/**
 * Détecteur d'exports
 */

import { Declaration, DeclarationType } from '$types/analysis';
import { DetectorConfig } from '$types/config';
import { shouldIgnoreFile } from '@annotation/annotation-analyzer';
import { createDeclaration } from '@utils/declaration-utils';
import { isInString } from '@utils/string-utils';

/**
 * Détecte les déclarations d'exports dans les lignes de code
 */
export const detectExports = (
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

    const ligneTrimmed = line.trim();

    // Ignorer commentaires
    if (
      ligneTrimmed.startsWith('//') ||
      ligneTrimmed.startsWith('*') ||
      ligneTrimmed.startsWith('/*')
    ) {
      continue;
    }

    // Ne traiter que les lignes commençant par export
    if (!ligneTrimmed.startsWith('export ')) {
      continue;
    }

    const lineNumber = lineIndex + 1;

    // Export named: export { nom1, nom2 }
    const matchNamed = line.match(/export\s*\{\s*([^}]+)\s*\}/);
    if (matchNamed && matchNamed[1]) {
      const exportsList = matchNamed[1].trim();
      const exports = exportsList.split(',');
      for (const exp of exports) {
        let nomExport = exp.trim();
        // Gérer alias (nom as alias)
        if (nomExport.includes(' as ')) {
          const parties = nomExport.split(' as ');
          if (parties.length === 2 && parties[0]) {
            nomExport = parties[0].trim();
          }
        }

        if (nomExport && !isInString(line, line.indexOf(nomExport))) {
          const column = line.indexOf(nomExport) + 1;
          declarations.push(
            createDeclaration(
              nomExport,
              DeclarationType.EXPORT,
              filePath,
              lineNumber,
              column,
              'named export',
            ),
          );
        }
      }
      continue;
    }

    // Export default
    const matchDefault = line.match(
      /export\s+default\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
    );
    if (matchDefault && matchDefault[1]) {
      const nomExport = matchDefault[1];
      if (!isInString(line, line.indexOf(nomExport))) {
        const column = line.indexOf(nomExport) + 1;
        declarations.push(
          createDeclaration(
            nomExport,
            DeclarationType.EXPORT,
            filePath,
            lineNumber,
            column,
            'default export',
          ),
        );
      }
      continue;
    }

    // Export class
    const matchClass = line.match(
      /export\s+class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
    );
    if (matchClass && matchClass[1]) {
      const nomExport = matchClass[1];
      if (!isInString(line, line.indexOf(nomExport))) {
        const column = line.indexOf(nomExport) + 1;
        declarations.push(
          createDeclaration(
            nomExport,
            DeclarationType.EXPORT,
            filePath,
            lineNumber,
            column,
            'export class',
          ),
        );
      }
      continue;
    }

    // Export function (classique)
    const matchFunction = line.match(
      /export\s+(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
    );
    if (matchFunction && matchFunction[1]) {
      const nomExport = matchFunction[1];
      if (!isInString(line, line.indexOf(nomExport))) {
        const column = line.indexOf(nomExport) + 1;
        declarations.push(
          createDeclaration(
            nomExport,
            DeclarationType.EXPORT,
            filePath,
            lineNumber,
            column,
            'export function/const',
          ),
        );
      }
      continue;
    }

    // Export const/let/var avec destructuration: export const { a, b } = obj
    const matchDestructuring = line.match(
      /export\s+(?:const|let|var)\s*\{\s*([^}]+)\s*\}\s*=/,
    );
    if (matchDestructuring && matchDestructuring[1]) {
      const items = matchDestructuring[1].split(',');
      for (const item of items) {
        const nom = item.trim().split(/\s|:/)[0]; // Prendre le premier mot avant espace ou :
        if (nom && !isInString(line, line.indexOf(nom))) {
          const column = line.indexOf(nom) + 1;
          declarations.push(
            createDeclaration(
              nom,
              DeclarationType.EXPORT,
              filePath,
              lineNumber,
              column,
              'export const/let/var',
            ),
          );
        }
      }
      continue;
    }

    // Export const/let/var (incluant fonctions fléchées, constantes, etc.)
    const matchConst = line.match(
      /export\s+(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
    );
    if (matchConst && matchConst[1]) {
      const nomExport = matchConst[1];
      if (!isInString(line, line.indexOf(nomExport))) {
        const column = line.indexOf(nomExport) + 1;
        declarations.push(
          createDeclaration(
            nomExport,
            DeclarationType.EXPORT,
            filePath,
            lineNumber,
            column,
            'export const/let/var',
          ),
        );
      }
      continue;
    }

    // Export type/interface
    const matchType = line.match(
      /export\s+(?:type|interface)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
    );
    if (matchType && matchType[1]) {
      const nomExport = matchType[1];
      if (!isInString(line, line.indexOf(nomExport))) {
        const column = line.indexOf(nomExport) + 1;
        declarations.push(
          createDeclaration(
            nomExport,
            DeclarationType.EXPORT,
            filePath,
            lineNumber,
            column,
            'export type/interface',
          ),
        );
      }
      continue;
    }
  }

  return declarations;
};
