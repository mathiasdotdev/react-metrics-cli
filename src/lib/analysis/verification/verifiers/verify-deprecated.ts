/**
 * Vérificateur de déclarations @deprecated
 *
 * Note : Les déclarations @deprecated sont déjà vérifiées par les autres verifiers
 * (verify-functions, verify-classes, etc.). Ce fichier existe principalement pour
 * la cohérence architecturale et pour d'éventuelles vérifications spécifiques futures.
 */

import { Declaration } from '$types/analysis';

/**
 * Vérifie les déclarations @deprecated
 *
 * Actuellement, cette fonction ne fait rien car les déclarations @deprecated
 * sont déjà vérifiées par les autres verifiers. Elle est présente pour:
 * - Maintenir la cohérence avec l'architecture (detectors + verifiers)
 * - Permettre d'ajouter des vérifications spécifiques aux deprecated si nécessaire
 *
 * @param _content - Contenu du fichier (non utilisé)
 * @param _declarations - Map des déclarations (non utilisé)
 */
export const verifyDeprecated = (
  _content: string,
  _declarations: Map<string, Declaration>,
): void => {
  // Les déclarations @deprecated sont déjà vérifiées par les autres verifiers
  // (verify-functions, verify-classes, verify-constants, etc.)
  //
  // Cette fonction peut être étendue dans le futur pour ajouter des vérifications
  // spécifiques aux déclarations @deprecated (par exemple: vérifier si elles sont
  // encore utilisées et suggérer un remplacement).
};
