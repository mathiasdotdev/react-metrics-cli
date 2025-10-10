/**
 * Fichier de test pour la détection @deprecated
 * Ce fichier contient différents types de déclarations marquées @deprecated
 */

/**
 * @deprecated Utiliser newFunction à la place
 */
export function oldFunction() {
  return 'old';
}

/**
 * @deprecated Cette classe sera supprimée dans la v2.0
 */
export class OldClass {
  oldMethod() {
    return 'old method';
  }
}

/**
 * @deprecated Constante obsolète, utiliser NEW_CONSTANT
 */
export const OLD_CONSTANT = 'old value';

/**
 * @deprecated Interface obsolète
 */
export interface OldInterface {
  oldProp: string;
}

/**
 * @deprecated Type obsolète
 */
export type OldType = {
  value: string;
};

// @deprecated Fonction fléchée obsolète
export const oldArrowFunction = () => {
  return 'old arrow';
};

/**
 * @deprecated Props obsolètes
 */
export interface DeprecatedProps {
  /** @deprecated Utiliser newProp */
  oldProp: string;
  newProp: string;
}

/**
 * Fonction moderne (non deprecated)
 */
export function newFunction() {
  return 'new';
}

/**
 * Classe moderne (non deprecated)
 */
export class NewClass {
  newMethod() {
    return 'new method';
  }
}

export const NEW_CONSTANT = 'new value';
