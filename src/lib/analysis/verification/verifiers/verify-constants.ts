/**
 * Vérificateur d'utilisation des constantes
 */

import {
  isComment,
  isCompleteIdentifier,
  isInStringWithName,
} from '@utils/string-utils';
import { Declaration, DeclarationType, isUsed } from '$types/analysis';

/**
 * Vérifie si une utilisation de constante est valide
 */
const isValidUsage = (line: string, name: string): boolean => {
  // Ignorer les commentaires
  if (isComment(line)) {
    return false;
  }

  // Ignorer si dans une chaîne de caractères
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
    const exportPattern = new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`);
    if (exportPattern.test(trimmed)) {
      return false;
    }
  }

  // Vérifier que c'est un identifiant complet
  if (!isCompleteIdentifier(line, name)) {
    return false;
  }

  return true;
};

/**
 * Vérifie si une constante est utilisée
 */
const isConstantUsed = (lines: string[], declaration: Declaration): boolean => {
  let usageCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Ignorer la ligne de déclaration
    if (i + 1 === declaration.location.line) {
      continue;
    }

    // Vérifier si le nom de la constante apparaît dans la ligne
    if (line.includes(declaration.name)) {
      if (isValidUsage(line, declaration.name)) {
        usageCount++;
      }
    }
  }

  return usageCount > 0;
};

/**
 * Vérifie les utilisations des constantes
 */
export const verifyConstants = (
  content: string,
  declarations: Map<string, Declaration>,
): void => {
  const lines = content.split('\n');

  for (const [_key, declaration] of declarations) {
    if (declaration.type !== DeclarationType.CONSTANT || isUsed(declaration)) {
      continue;
    }

    if (isConstantUsed(lines, declaration)) {
      declaration.isUsedLocally = true;
    }
  }
};
