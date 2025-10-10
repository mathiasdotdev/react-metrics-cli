/**
 * Vérificateur d'utilisation des types et interfaces
 */

import { isComment, isInStringWithName } from '@utils/string-utils';
import { Declaration, DeclarationType, isUsed } from '$types/analysis';

/**
 * Vérifie si une utilisation de définition est valide
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

  // Patterns d'utilisation de types
  // Note: We check patterns before isCompleteIdentifier because the name might
  // appear as a substring elsewhere in the line (e.g., "getResult" contains "Result")
  // : TypeName
  if (line.includes(`: ${name}`)) {
    return true;
  }

  // <TypeName>
  if (line.includes(`<${name}>`)) {
    return true;
  }

  // extends TypeName
  if (line.includes(`extends ${name}`)) {
    return true;
  }

  // implements TypeName
  if (line.includes(`implements ${name}`)) {
    return true;
  }

  // as TypeName (type cast)
  if (line.includes(` as ${name}`)) {
    return true;
  }

  // is TypeName (type guard)
  if (line.includes(` is ${name}`)) {
    return true;
  }

  // keyof TypeName
  if (line.includes(`keyof ${name}`)) {
    return true;
  }

  // typeof TypeName
  if (line.includes(`typeof ${name}`)) {
    return true;
  }

  // | TypeName (union type)
  if (line.includes(`| ${name}`)) {
    return true;
  }

  // & TypeName (intersection type)
  if (line.includes(`& ${name}`)) {
    return true;
  }

  // = TypeName (type alias)
  if (line.includes(`= ${name}`)) {
    return true;
  }

  return false;
};

/**
 * Vérifie si une définition est utilisée
 */
const isDefinitionUsed = (
  lines: string[],
  declaration: Declaration,
): boolean => {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Ignorer la ligne de déclaration
    if (i + 1 === declaration.location.line) {
      continue;
    }

    // Vérifier si le nom du type apparaît
    if (line.includes(declaration.name)) {
      if (isValidUsage(line, declaration.name)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Vérifie les utilisations des définitions (types et interfaces)
 */
export const verifyDefinitions = (
  content: string,
  declarations: Map<string, Declaration>,
): void => {
  const lines = content.split('\n');

  for (const [_key, declaration] of declarations) {
    if (
      declaration.type !== DeclarationType.DEFINITION ||
      isUsed(declaration)
    ) {
      continue;
    }

    if (isDefinitionUsed(lines, declaration)) {
      declaration.isUsedLocally = true;
    }
  }
};
