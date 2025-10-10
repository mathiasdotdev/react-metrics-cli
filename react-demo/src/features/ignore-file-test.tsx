// react-metrics-ignore-file
// Ce fichier teste l'annotation ignore-file qui devrait ignorer tout le contenu

// Ces fonctions, constantes, classes et consoles ne devraient PAS être détectés comme du code mort

function unusedIgnoredFunction() {
  console.log(
    "Cette fonction n'est pas utilisée mais le fichier entier est ignoré",
  );
  return 'ignored';
}

const unusedIgnoredConstant =
  "Cette constante n'est pas utilisée mais le fichier entier est ignoré";

class UnusedIgnoredClass {
  constructor() {
    console.warn(
      "Cette classe n'est pas utilisée mais le fichier entier est ignoré",
    );
  }
}

const unusedIgnoredArrowFunction = () => {
  console.error(
    "Cette fonction fléchée n'est pas utilisée mais le fichier entier est ignoré",
  );
  return false;
};

// Même les imports non utilisés devraient être ignorés
import React, { useState } from 'react';

export default function IgnoredComponent() {
  return (
    <div>
      Ce composant n'est jamais utilisé mais le fichier entier est ignoré
    </div>
  );
}
