# Guide rapide : TypeScript avec tsgo

## 🚀 Qu'est-ce que tsgo ?

**tsgo** est le nouveau compilateur TypeScript réécrit en Go (TypeScript v7 / nom de code Corsa) qui offre des performances jusqu'à **10x plus rapides** que le compilateur traditionnel `tsc`.

## 📦 Installation

```bash
# Installer toutes les dépendances (inclut @typescript/native-preview)
npm install
```

## 🔨 Commandes de build

```bash
# Build standard (développement)
npm run build

# Build optimisé (production)
npm run build:prod

# Nettoyer les builds
npm run clean

# Build + tests + préparation publication
npm run prepublishOnly
```

## ⚡ Différence de performance

| Opération         | tsc (avant) | tsgo (maintenant) |
| ----------------- | ----------- | ----------------- |
| Build complet     | ~X secondes | ~X/10 secondes    |
| Build incrémental | ~Y secondes | ~Y/10 secondes    |

_Les temps exacts dépendent de votre machine_

## 🎯 Aucun changement de code requis

- ✅ Même code TypeScript
- ✅ Mêmes fichiers de configuration (`tsconfig.json`)
- ✅ Même sortie JavaScript
- ✅ Même vérification de types

## 🔧 Commandes directes

```bash
# Compiler avec tsgo
npx tsgo --project ./tsconfig.json

# Build production
npx tsgo --project ./tsconfig.prod.json

# Vérifier les types sans compiler
npx tsc --noEmit
```

## 💻 Support éditeur (VS Code)

Pour accélérer également l'éditeur :

1. Installer l'extension **TypeScript (Native Preview)**
2. Ajouter dans `.vscode/settings.json` :

```json
{
  "typescript.experimental.useTsgo": true
}
```

Cela accélère :

- Le hover (info-bulles)
- Go to definition
- Autocomplete
- Vérification en temps réel

## 🐛 Dépannage

### Le build échoue

```bash
# Nettoyer et réinstaller
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Comparer avec tsc

```bash
# Test avec tsc classique (sans build)
npx tsc --noEmit

# Test avec tsgo
npx tsgo --project ./tsconfig.json
```

Si tsc fonctionne mais tsgo échoue, c'est probablement un bug de tsgo (version preview).

## 📚 Documentation complète

- **Guide de migration** : `.specify/memory/tsgo-migration.md`
- **Résumé technique** : `.specify/migration-tsgo-summary.md`
- **Build workflows** : `.specify/memory/build-workflows.md`

## ℹ️ Informations projet

- **Version actuelle** : 1.16.0
- **Package tsgo** : `@typescript/native-preview`
- **TypeScript** : 5.9.2 (conservé pour tooling)
- **Date de migration** : 29/09/2025

## 🔄 Rollback temporaire

Si vous devez revenir à `tsc` temporairement, modifiez `package.json` :

```json
"scripts": {
  "build": "npx tsc && chmod +x dist/index.js",
  "build:prod": "npx tsc --project tsconfig.prod.json && chmod +x dist/index.js"
}
```

Puis :

```bash
npm run build
```

## 📞 Support

- Issues GitHub : Rapporter les problèmes de compilation
- Documentation TypeScript : [typescriptlang.org](https://www.typescriptlang.org)
- Package npm : [@typescript/native-preview](https://www.npmjs.com/package/@typescript/native-preview)
