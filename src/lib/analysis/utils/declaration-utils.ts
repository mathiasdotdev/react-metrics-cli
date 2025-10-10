/**
 * Utilitaires pour la création de déclarations
 */

import { Declaration, DeclarationType, Location } from '$types/analysis';

/**
 * Crée une localisation
 */
export const createLocation = (
  filePath: string,
  line: number,
  column: number,
): Location => ({
  filePath,
  line,
  column,
});

/**
 * Crée une déclaration
 */
export const createDeclaration = (
  name: string,
  type: DeclarationType,
  filePath: string,
  line: number,
  column: number,
  context?: string,
  isDeprecated?: boolean,
): Declaration => ({
  name,
  type,
  location: createLocation(filePath, line, column),
  isUsedLocally: false,
  isImportedExternally: false,
  isDeprecated,
  context,
});
