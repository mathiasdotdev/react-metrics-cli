/**
 * Vérificateur d'utilisation des classes
 */

import { isComment, isInStringWithName } from '@utils/string-utils';
import { Declaration, DeclarationType, isUsed } from '$types/analysis';

/**
 * Vérifie si une utilisation de classe est valide
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
    const exportPattern = new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`);
    if (exportPattern.test(trimmed)) {
      return false;
    }
  }

  // Patterns d'utilisation de classe
  // Note: We check patterns before isCompleteIdentifier to handle cases where
  // the class name appears as a substring elsewhere in the line

  // new ClassName()
  if (line.includes(`new ${name}`)) {
    return true;
  }

  // extends ClassName
  if (line.includes(`extends ${name}`)) {
    return true;
  }

  // implements ClassName (single or multiple)
  if (line.includes(`implements ${name}`) || line.includes(`, ${name}`)) {
    return true;
  }

  // instanceof ClassName
  if (line.includes(`instanceof ${name}`)) {
    return true;
  }

  // ClassName.staticMethod (static method or property access)
  if (line.includes(`${name}.`)) {
    return true;
  }

  // <ClassName> (generic type)
  if (
    line.includes(`<${name}>`) ||
    line.includes(`<${name},`) ||
    line.includes(`, ${name}>`)
  ) {
    return true;
  }

  // : ClassName (type annotation)
  if (line.includes(`: ${name}`)) {
    return true;
  }

  // (ClassName) or as parameter
  if (
    line.includes(`(${name})`) ||
    line.includes(`(${name},`) ||
    line.includes(`, ${name})`)
  ) {
    return true;
  }

  return false;
};

/**
 * Vérifie si une classe est utilisée
 */
const isClassUsed = (lines: string[], declaration: Declaration): boolean => {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Ignorer la ligne de déclaration
    if (i + 1 === declaration.location.line) {
      continue;
    }

    // Vérifier si le nom de la classe apparaît
    if (line.includes(declaration.name)) {
      if (isValidUsage(line, declaration.name)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Vérifie les utilisations des classes
 */
export const verifyClasses = (
  content: string,
  declarations: Map<string, Declaration>,
): void => {
  const lines = content.split('\n');

  for (const [_key, declaration] of declarations) {
    if (declaration.type !== DeclarationType.CLASS || isUsed(declaration)) {
      continue;
    }

    if (isClassUsed(lines, declaration)) {
      declaration.isUsedLocally = true;
    }
  }
};
