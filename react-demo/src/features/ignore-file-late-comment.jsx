// Ce fichier teste que l'annotation ignore-file trop tard ne fonctionne pas

const thisVariableWillBeDetected =
  "Cette variable sera détectée car l'annotation est trop tard";

function thisWillAlsoBeDetected() {
  console.log('Cette fonction sera détectée');
}

// react-metrics-ignore-file
// Cette annotation arrive trop tard après du code et ne devrait pas fonctionner

const thisVariableWillAlsoBeDetected =
  'Cette autre variable sera aussi détectée';

export default function UnusedComponent() {
  return <div>Ce composant sera détecté comme non utilisé</div>;
}
