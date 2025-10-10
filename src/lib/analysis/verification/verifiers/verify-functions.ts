/**
 * Vérificateur d'utilisation des fonctions
 */

import {
  isComment,
  isCompleteIdentifier,
  isInStringWithName,
} from '@utils/string-utils';
import { Declaration, DeclarationType, isUsed } from '$types/analysis';

/**
 * Vérifie si une utilisation de fonction est valide
 */
const isValidUsage = (line: string, name: string): boolean => {
  // Ignorer commentaires
  if (isComment(line)) {
    return false;
  }

  // Ignorer dans strings
  if (isInStringWithName(line, name)) {
    return false;
  }

  // Ignorer les export { nom } car ce n'est pas une vraie utilisation
  const trimmed = line.trim();
  if (
    trimmed.startsWith('export') &&
    trimmed.includes('{') &&
    trimmed.includes(name)
  ) {
    // Vérifier si c'est bien un export { nom } et pas export const nom
    const exportPattern = new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`);
    if (exportPattern.test(trimmed)) {
      return false;
    }
  }

  // Vérifier identifiant complet
  if (!isCompleteIdentifier(line, name)) {
    return false;
  }

  return true;
};

/**
 * Vérifie si une fonction est utilisée
 */
const isFunctionUsed = (lines: string[], declaration: Declaration): boolean => {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Ignorer la ligne de déclaration
    if (i + 1 === declaration.location.line) {
      continue;
    }

    // Vérifier si le nom de la fonction apparaît
    if (line.includes(declaration.name)) {
      if (isValidUsage(line, declaration.name)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Vérifie les utilisations des fonctions
 */
export const verifyFunctions = (
  content: string,
  declarations: Map<string, Declaration>,
): void => {
  const lines = content.split('\n');

  for (const [_key, declaration] of declarations) {
    if (declaration.type !== DeclarationType.FUNCTION || isUsed(declaration)) {
      continue;
    }

    if (isFunctionUsed(lines, declaration)) {
      declaration.isUsedLocally = true;
    }
  }
};
