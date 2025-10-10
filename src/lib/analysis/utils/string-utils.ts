/**
 * Utilitaires pour le parsing de chaînes de caractères
 */

/**
 * Vérifie si un caractère peut faire partie d'un identifiant JavaScript/TypeScript
 */
export const isIdentifierChar = (char: string): boolean => {
  if (char.length !== 1) return false;
  const code = char.charCodeAt(0);
  return (
    (code >= 97 && code <= 122) || // a-z
    (code >= 65 && code <= 90) || // A-Z
    (code >= 48 && code <= 57) || // 0-9
    char === '_' ||
    char === '$'
  );
};

/**
 * Vérifie si une position dans une ligne est à l'intérieur d'une chaîne de caractères
 */
export const isInString = (line: string, position: number): boolean => {
  if (position < 0 || position >= line.length) {
    return false;
  }

  const before = line.substring(0, position);

  // Guillemets simples
  const singleQuotes = (before.match(/'/g) || []).length;
  if (singleQuotes % 2 === 1) {
    return true;
  }

  // Guillemets doubles
  const doubleQuotes = (before.match(/"/g) || []).length;
  if (doubleQuotes % 2 === 1) {
    return true;
  }

  // Backticks (template literals)
  const backticks = (before.match(/`/g) || []).length;
  if (backticks % 2 === 1) {
    return true;
  }

  return false;
};

/**
 * Vérifie si un nom apparaît dans une chaîne de caractères
 */
export const isInStringWithName = (line: string, name: string): boolean => {
  const index = line.indexOf(name);
  if (index === -1) {
    return false;
  }

  const before = line.substring(0, index);
  const after = line.substring(index + name.length);

  // Vérifier si on est entre des guillemets simples
  const singleQuotes = (before.match(/'/g) || []).length;
  if (singleQuotes % 2 === 1 && after.includes("'")) {
    return true;
  }

  // Vérifier si on est entre des guillemets doubles
  const doubleQuotes = (before.match(/"/g) || []).length;
  if (doubleQuotes % 2 === 1 && after.includes('"')) {
    return true;
  }

  // Vérifier si on est entre des backticks (template literals)
  const backticks = (before.match(/`/g) || []).length;
  if (backticks % 2 === 1 && after.includes('`')) {
    // Vérifier si on est dans une interpolation ${...}
    // Compter les ${ et } avant l'index pour voir si on est dans une interpolation
    const dollarBraces = (before.match(/\${/g) || []).length;
    const closingBraces = (before.match(/}/g) || []).length;

    // Si dollarBraces > closingBraces, on est dans une interpolation
    if (dollarBraces > closingBraces) {
      return false; // Dans une interpolation, donc pas "dans une string"
    }

    return true;
  }

  return false;
};

/**
 * Vérifie si une ligne est un commentaire
 */
export const isComment = (line: string): boolean => {
  const trimmed = line.trim();

  // Commentaire ligne simple
  if (trimmed.startsWith('//')) {
    return true;
  }

  // Commentaire multi-lignes ou JSDoc (ligne commençant par *)
  if (
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*/') ||
    trimmed.startsWith('*')
  ) {
    return true;
  }

  // Ligne contenant un bloc de commentaire
  if (trimmed.includes('/*') || trimmed.includes('*/')) {
    return true;
  }

  return false;
};

/**
 * Vérifie si un nom dans une ligne est un identifiant complet
 * (pas une sous-chaîne d'un autre identifiant)
 */
export const isCompleteIdentifier = (line: string, name: string): boolean => {
  const index = line.indexOf(name);
  if (index === -1) {
    return false;
  }

  // Vérifier les caractères avant et après
  const charBefore = line[index - 1];
  const charAfter = line[index + name.length];
  const before =
    index > 0 && charBefore !== undefined && isIdentifierChar(charBefore);
  const after =
    index + name.length < line.length &&
    charAfter !== undefined &&
    isIdentifierChar(charAfter);

  return !before && !after;
};

/**
 * Vérifie si une ligne se trouve dans une interface TypeScript
 */
export const isInInterface = (lines: string[], lineNumber: number): boolean => {
  if (lineNumber < 0 || lineNumber >= lines.length) {
    return false;
  }

  // Si la ligne courante est une fermeture d'accolade, elle n'est pas "dans" l'interface
  const lineAtIndex = lines[lineNumber];
  if (!lineAtIndex) return false;
  const currentLine = lineAtIndex.trim();
  if (currentLine === '}') {
    return false;
  }

  // Chercher en arrière pour voir si on est dans une interface
  for (let i = lineNumber - 1; i >= 0; i--) {
    const lineContent = lines[i];
    if (!lineContent) continue;
    const line = lineContent.trim();

    // Si on trouve une accolade fermante, on sort de l'interface
    if (line.includes('}')) {
      return false;
    }

    // Si on trouve une déclaration d'interface
    if (line.includes('interface') || line.includes('type')) {
      return true;
    }

    // Si on trouve une autre déclaration, on n'est pas dans une interface
    if (
      line.includes('function') ||
      line.includes('const') ||
      line.includes('class') ||
      line.includes('export')
    ) {
      return false;
    }
  }

  return false;
};

/**
 * Vérifie si une ligne est un import ou export
 */
export const isImportOrExport = (line: string): boolean => {
  const trimmed = line.trim();
  return trimmed.startsWith('import ') || trimmed.startsWith('export ');
};
