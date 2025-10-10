/**
 * Vérificateur pour console.* - Tous restent "non utilisés" (code mort)
 */

import { Declaration, DeclarationType } from '$types/analysis';

/**
 * Vérifie les utilisations des console.* (toujours considérés comme code mort)
 */
export const verifyConsoles = (
  _content: string,
  declarations: Map<string, Declaration>,
): void => {
  // Les console.* sont toujours considérés comme du code mort
  // On ne fait rien, ils restent isUsedLocally = false et isImportedExternally = false
  for (const [_key, declaration] of declarations) {
    if (declaration.type === DeclarationType.CONSOLE) {
      declaration.isUsedLocally = false;
      declaration.isImportedExternally = false;
    }
  }
};
