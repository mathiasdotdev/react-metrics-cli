/**
 * Utilitaires pour la validation d'identifiants
 */

/**
 * Vérifie si un nom est un identifiant JavaScript/TypeScript valide
 */
export const isValidName = (name: string): boolean => {
  if (name === '') {
    return false;
  }

  // Le premier caractère doit être une lettre, _ ou $
  const first = name.charCodeAt(0);
  if (
    !(
      (first >= 97 && first <= 122) || // a-z
      (first >= 65 && first <= 90) || // A-Z
      first === 95 || // _
      first === 36
    ) // $
  ) {
    return false;
  }

  // Les autres caractères peuvent inclure des chiffres
  for (let i = 1; i < name.length; i++) {
    const code = name.charCodeAt(i);
    if (
      !(
        (code >= 97 && code <= 122) || // a-z
        (code >= 65 && code <= 90) || // A-Z
        (code >= 48 && code <= 57) || // 0-9
        code === 95 || // _
        code === 36
      ) // $
    ) {
      return false;
    }
  }

  return true;
};
