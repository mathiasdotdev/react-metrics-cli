// Description de ce fichier de test
// Ce fichier contient du code temporaire pour les tests
// Il devrait être entièrement ignoré grâce à l'annotation suivante
// react-metrics-ignore-file

// Tout ce qui suit ne devrait pas être détecté comme du code mort

const temporaryConfig = {
  apiUrl: 'http://test.example.com',
  timeout: 5000,
  retries: 3,
};

function temporaryHelper(input) {
  console.log('Fonction temporaire:', input);
  return input.toUpperCase();
}

class TemporaryService {
  constructor(config) {
    this.config = config;
    console.warn('Service temporaire initialisé');
  }

  process(data) {
    console.error('Traitement temporaire:', data);
    return this.config.apiUrl + '/' + data;
  }
}

export { temporaryConfig, temporaryHelper, TemporaryService };
