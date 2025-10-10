/**
 * Validation de patterns spécifiques dans le code
 */

/**
 * Vérifie si une ligne contient une déclaration de prop
 */
export const isPropDeclaration = (line: string): boolean => {
  const patterns = ['({', '}:', '}) =>'];

  for (const pattern of patterns) {
    if (line.includes(pattern)) {
      return true;
    }
  }

  return false;
};

/**
 * Vérifie si une ligne contient un import ou export
 */
export const isImportOrExport = (line: string): boolean => {
  const trimmed = line.trim();
  return trimmed.startsWith('import') || trimmed.startsWith('export');
};

/**
 * Vérifie si une ligne contient une déclaration de variable
 */
export const isVariableDeclaration = (line: string): boolean => {
  const trimmed = line.trim();

  // Ignorer les commentaires
  if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
    return false;
  }

  return (
    line.includes('const ') || line.includes('let ') || line.includes('var ')
  );
};

/**
 * Vérifie si une ligne contient un appel console
 */
export const isConsoleUsage = (line: string): boolean => {
  const consoleTypes = [
    'console.log',
    'console.warn',
    'console.error',
    'console.debug',
    'console.info',
  ];

  for (const consoleType of consoleTypes) {
    if (line.includes(consoleType)) {
      return true;
    }
  }

  return false;
};

/**
 * Vérifie si une ligne contient une déclaration de fonction
 */
export const isFunctionDeclaration = (line: string): boolean => {
  return (
    line.includes('function ') ||
    (line.includes('const ') && line.includes('=>')) ||
    (line.includes('let ') && line.includes('=>')) ||
    (line.includes('var ') && line.includes('=>'))
  );
};

/**
 * Vérifie si une ligne contient une déclaration de classe
 */
export const isClassDeclaration = (line: string): boolean => {
  return line.includes('class ');
};
