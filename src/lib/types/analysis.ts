/**
 * Type de déclaration détectée dans le code
 */
export enum DeclarationType {
  CONSTANT = 'CONSTANT',
  FUNCTION = 'FUNCTION',
  CLASS = 'CLASS',
  CONSOLE = 'CONSOLE',
  PROP = 'PROP',
  EXPORT = 'EXPORT',
  DEPENDENCY = 'DEPENDENCY',
  DEFINITION = 'DEFINITION',
}

/**
 * Localisation d'une déclaration dans un fichier
 */
export interface Location {
  filePath: string;
  line: number;
  column: number;
}

/**
 * Représente une déclaration trouvée dans le code
 */
export interface Declaration {
  name: string;
  type: DeclarationType;
  location: Location;
  isUsedLocally: boolean;
  isImportedExternally: boolean;
  isDeprecated?: boolean;
  context?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Résultat complet de l'analyse
 */
export interface AnalysisResult {
  declarations: Map<string, Declaration>;
  deadCode: Declaration[];
  deprecated: Declaration[];
  duration: number;
}

/**
 * Génère une clé unique pour une déclaration
 */
export const getDeclarationKey = (declaration: Declaration): string => {
  return `${declaration.location.filePath}:${declaration.location.line}:${declaration.location.column}:${declaration.name}`;
};

/**
 * Vérifie si une déclaration est utilisée (localement ou importée ailleurs)
 */
export const isUsed = (declaration: Declaration): boolean => {
  return declaration.isUsedLocally || declaration.isImportedExternally;
};

/**
 * Récupère le code mort (déclarations non utilisées)
 */
export const getDeadCode = (
  declarations: Map<string, Declaration>,
): Declaration[] => {
  return Array.from(declarations.values()).filter((d) => !isUsed(d));
};

/**
 * Récupère toutes les déclarations marquées @deprecated
 */
export const getDeprecated = (
  declarations: Map<string, Declaration>,
): Declaration[] => {
  return Array.from(declarations.values())
    .filter((d) => d.isDeprecated === true)
    .sort((a, b) => a.location.filePath.localeCompare(b.location.filePath));
};
