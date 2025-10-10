/*
 * Ce fichier teste l'annotation ignore-file multi-lignes
 * react-metrics-ignore-file
 */

// Tout le contenu de ce fichier devrait être ignoré

const unusedVariable = 'Cette variable ne sera pas détectée';

function unusedFunction() {
  console.log('Cette fonction ne sera pas détectée');
}

class UnusedClass {
  method() {
    console.warn('Cette méthode ne sera pas détectée');
  }
}

export const exportedButUnused =
  'Cette constante exportée mais non utilisée ne sera pas détectée';
