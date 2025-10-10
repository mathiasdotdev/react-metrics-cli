/**
 * Analyseur d'annotations pour react-metrics-ignore
 */

/**
 * Patterns pour les annotations d'ignore
 */
const ANNOTATION_PATTERNS = [
  // Commentaires simple ligne
  /\/\/\s*react-metrics-ignore-ligne\s*$/,
  // Commentaires multi-lignes
  /\/\*\s*react-metrics-ignore-ligne\s*\*\//,
  // Commentaires inline avec texte avant
  /\/\/.*react-metrics-ignore-ligne/,
  /\/\*.*react-metrics-ignore-ligne.*\*\//,
];

/**
 * Patterns pour les annotations d'ignore-file
 */
const FILE_IGNORE_PATTERNS = [
  /\/\/\s*react-metrics-ignore-file/,
  /\/\*\s*react-metrics-ignore-file\s*\*\//,
  /\/\*\*\s*react-metrics-ignore-file\s*\*\//,
  /\/\/.*react-metrics-ignore-file/,
  /\/\*.*react-metrics-ignore-file.*\*\//,
  /^\s*\*.*react-metrics-ignore-file/,
];

/**
 * Vérifie si une ligne est un commentaire
 */
const isCommentLine = (line: string): boolean => {
  const trimmed = line.trim();
  return (
    trimmed.startsWith('//') ||
    (trimmed.startsWith('/*') && trimmed.endsWith('*/')) ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*') ||
    trimmed.endsWith('*/')
  );
};

/**
 * Vérifie si une ligne contient une annotation ignore
 */
export const shouldIgnoreLine = (line: string): boolean => {
  const trimmed = line.trim();
  return ANNOTATION_PATTERNS.some((pattern) => pattern.test(trimmed));
};

/**
 * Vérifie si une déclaration doit être ignorée
 * en regardant la ligne courante et la ligne précédente
 */
export const shouldIgnoreDeclaration = (
  lines: string[],
  lineNumber: number,
): boolean => {
  const lineIndex = lineNumber - 1;

  // Vérifier la ligne courante
  if (lineIndex >= 0 && lineIndex < lines.length) {
    const currentLine = lines[lineIndex];
    if (currentLine && shouldIgnoreLine(currentLine)) {
      return true;
    }
  }

  // Vérifier la ligne précédente
  const previousIndex = lineIndex - 1;
  if (previousIndex >= 0 && previousIndex < lines.length) {
    const previousLine = lines[previousIndex];
    if (previousLine && shouldIgnoreLine(previousLine)) {
      return true;
    }
  }

  return false;
};

/**
 * Vérifie avec plus de contexte (jusqu'à N lignes avant)
 */
export const shouldIgnoreDeclarationWithContext = (
  lines: string[],
  lineNumber: number,
  contextLines: number = 3,
): boolean => {
  const lineIndex = lineNumber - 1;

  // Vérifier la ligne courante
  if (lineIndex >= 0 && lineIndex < lines.length) {
    const currentLine = lines[lineIndex];
    if (currentLine && shouldIgnoreLine(currentLine)) {
      return true;
    }
  }

  // Vérifier les lignes précédentes dans le contexte donné
  for (let i = 1; i <= contextLines; i++) {
    const previousIndex = lineIndex - i;
    if (previousIndex >= 0 && previousIndex < lines.length) {
      const lineContent = lines[previousIndex];
      if (!lineContent) continue;
      const line = lineContent.trim();

      // Si on trouve une annotation, c'est pour ignorer
      if (shouldIgnoreLine(line)) {
        return true;
      }

      // Si on trouve une ligne non-vide qui n'est pas un commentaire, on arrête
      if (line !== '' && !isCommentLine(line)) {
        break;
      }
    }
  }

  return false;
};

/**
 * Vérifie si une ligne contient une annotation ignore-file
 */
const containsFileIgnoreAnnotation = (line: string): boolean => {
  if (!line.includes('react-metrics-ignore-file')) {
    return false;
  }

  return FILE_IGNORE_PATTERNS.some((pattern) => pattern.test(line));
};

/**
 * Vérifie si un fichier entier doit être ignoré
 * L'annotation react-metrics-ignore-file doit être dans les commentaires en début de fichier
 */
export const shouldIgnoreFile = (lines: string[]): boolean => {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const trimmed = line.trim();

    // Ignorer les lignes vides
    if (trimmed === '') {
      continue;
    }

    // Vérifier les annotations d'ignore-file
    if (containsFileIgnoreAnnotation(line)) {
      return true;
    }

    // Si on trouve une ligne de code (pas un commentaire), arrêter
    // L'annotation doit être AVANT le code
    if (!isCommentLine(trimmed)) {
      break;
    }
  }

  return false;
};

/**
 * Vérifie si une déclaration est marquée @deprecated
 * en regardant les commentaires JSDoc avant la déclaration
 */
export const isDeprecatedDeclaration = (
  lines: string[],
  lineNumber: number,
): boolean => {
  const lineIndex = lineNumber - 1;

  // Regarder les lignes précédentes (jusqu'à 10 lignes de contexte)
  for (let i = 1; i <= 10; i++) {
    const previousIndex = lineIndex - i;
    if (previousIndex < 0 || previousIndex >= lines.length) {
      break;
    }

    const lineContent = lines[previousIndex];
    if (!lineContent) continue;
    const line = lineContent.trim();

    // Si on trouve @deprecated dans un commentaire
    if (line.includes('@deprecated')) {
      return true;
    }

    // Si on trouve une ligne non-vide qui n'est pas un commentaire, arrêter
    if (line !== '' && !isCommentLine(line)) {
      break;
    }
  }

  return false;
};
