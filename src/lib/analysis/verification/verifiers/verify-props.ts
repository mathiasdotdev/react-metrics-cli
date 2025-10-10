/**
 * Vérificateur d'utilisation des props
 */

import {
  isComment,
  isCompleteIdentifier,
  isInStringWithName,
} from '@utils/string-utils';
import { Declaration, DeclarationType, isUsed } from '$types/analysis';

/**
 * Vérifie si une utilisation de prop est dans une interpolation de template literal
 */
const isInTemplateInterpolation = (line: string, name: string): boolean => {
  // Chercher les interpolations ${...}
  const interpolationRegex = /\$\{[^}]*\}/g;
  let match;
  while ((match = interpolationRegex.exec(line)) !== null) {
    const interpolationContent = match[0];
    if (interpolationContent.includes(name)) {
      // Vérifier que c'est un identifiant complet dans l'interpolation
      const nameIndex = interpolationContent.indexOf(name);
      const charBefore = interpolationContent[nameIndex - 1];
      const charAfter = interpolationContent[nameIndex + name.length];
      const isIdentifierBefore = charBefore && /[a-zA-Z0-9_$]/.test(charBefore);
      const isIdentifierAfter = charAfter && /[a-zA-Z0-9_$]/.test(charAfter);
      if (!isIdentifierBefore && !isIdentifierAfter) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Vérifie si une utilisation de prop est valide
 */
const isValidUsage = (line: string, name: string): boolean => {
  // Ignorer commentaires
  if (isComment(line)) {
    return false;
  }

  // Accepter si dans une interpolation de template literal
  if (isInTemplateInterpolation(line, name)) {
    return true;
  }

  // Ignorer dans strings (guillemets simples, doubles, ou backticks)
  if (isInStringWithName(line, name)) {
    return false;
  }

  // Vérifier identifiant complet
  if (!isCompleteIdentifier(line, name)) {
    return false;
  }

  return true;
};

/**
 * Vérifie si une prop est utilisée
 */
const isPropUsed = (lines: string[], declaration: Declaration): boolean => {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Ignorer la ligne de déclaration
    if (i + 1 === declaration.location.line) {
      continue;
    }

    // Vérifier si le nom de la prop apparaît
    if (line.includes(declaration.name)) {
      if (isValidUsage(line, declaration.name)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Vérifie les utilisations des props
 */
export const verifyProps = (
  content: string,
  declarations: Map<string, Declaration>,
): void => {
  const lines = content.split('\n');

  for (const [_key, declaration] of declarations) {
    if (declaration.type !== DeclarationType.PROP || isUsed(declaration)) {
      continue;
    }

    if (isPropUsed(lines, declaration)) {
      declaration.isUsedLocally = true;
    }
  }
};
