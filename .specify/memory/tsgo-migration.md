# Migration vers tsgo (TypeScript v7 / Corsa)

## Vue d'ensemble

Le projet React-Metrics CLI a migré vers **tsgo**, le nouveau compilateur TypeScript réécrit en Go (nom de code : Corsa, aussi appelé TypeScript v7). Cette migration apporte des améliorations de performance significatives sans modifier le code source TypeScript.

## Avantages

- ⚡ **Performance x10** : Compilation jusqu'à 10 fois plus rapide que `tsc` traditionnel
- 🔄 **Compatibilité totale** : Aucune modification du code TypeScript nécessaire
- 📦 **Même configuration** : Utilise les mêmes `tsconfig.json` et `tsconfig.prod.json`
- 🎯 **Drop-in replacement** : Remplace `tsc` sans changer le workflow

## Installation

Le package est déjà installé dans le projet :

```bash
npm install -D @typescript/native-preview
```

## Utilisation

### Scripts npm mis à jour

```bash
# Build standard (utilise tsgo)
npm run build

# Build production (utilise tsgo)
npm run build:prod

# Analyse du bundle
npm run build:analyze
```

### Commande directe

```bash
# Compilation avec tsgo
npx tsgo --project ./tsconfig.json

# Build production
npx tsgo --project ./tsconfig.prod.json
```

## Compatibilité

Le projet conserve **TypeScript 5.9.2** pour :

- Initialisation de configuration : `npx tsc --init`
- Développement avec ts-node : `npm run dev`
- Outils d'éditeur (LSP, auto-complétion)

## Retour à tsc (si nécessaire)

Si vous rencontrez des problèmes avec tsgo, vous pouvez temporairement revenir à `tsc` :

### Modification temporaire des scripts

Dans `package.json`, remplacez temporairement :

```json
"scripts": {
  "build": "npx tsc && chmod +x dist/index.js",
  "build:prod": "npx tsc --project tsconfig.prod.json && chmod +x dist/index.js"
}
```

### Test de compatibilité

```bash
# Test avec tsc
npx tsc --project ./tsconfig.json --noEmit

# Test avec tsgo
npx tsgo --project ./tsconfig.json
```

## Différences connues

### Comportement identique

- Même sortie de compilation
- Même système de types
- Même gestion d'erreurs
- Compatibilité totale avec tsconfig.json

### Optimisations tsgo

- Compilation parallélisée native
- Meilleure utilisation du cache
- Gestion optimisée de la mémoire

## Support VS Code

Pour bénéficier de l'accélération dans VS Code :

1. Installez l'extension **"TypeScript (Native Preview)"**
2. Ajoutez dans vos paramètres VS Code (`.vscode/settings.json`) :

```json
{
  "typescript.experimental.useTsgo": true
}
```

Cela accélérera :

- Le hover sur les types
- Le go-to-definition
- Les erreurs en temps réel
- L'auto-complétion

## CI/CD

Les pipelines Jenkins/CI doivent :

1. Installer les dépendances : `npm install`
2. Exécuter le build : `npm run build:prod`
3. Aucune configuration spéciale requise

Le package `@typescript/native-preview` télécharge automatiquement le binaire natif pour la plateforme cible.

## Troubleshooting

### Erreur : tsgo command not found

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Build plus lent qu'attendu

```bash
# Nettoyer le cache
npm run clean
npm run build
```

### Erreurs de compilation inattendues

```bash
# Comparer avec tsc
npx tsc --project ./tsconfig.json --noEmit
npx tsgo --project ./tsconfig.json
```

Si `tsc` compile sans erreur mais `tsgo` échoue, signalez le problème à l'équipe TypeScript.

## Références

- [Annonce TypeScript v7 / Corsa](https://devblogs.microsoft.com/typescript/)
- [Package @typescript/native-preview](https://www.npmjs.com/package/@typescript/native-preview)
- [Extension VS Code](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)

## Statut

**Version actuelle** : 1.16.0
**Date de migration** : 29/09/2025
**Statut** : ✅ Production ready
