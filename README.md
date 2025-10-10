# React-Metrics CLI

![React-Metrics CLI Screenshot](./assets/react-metrics.png)

**React-Metrics CLI** est une interface en ligne de commande TypeScript pour analyser le code mort dans les projets React/TypeScript.

## 📋 Table des matières

- [🚀 Installation et démarrage rapide](#-installation-et-démarrage-rapide)
- [📖 Utilisation](#-utilisation)
- [⚙️ Configuration](#️-configuration)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🔧 Développement](#-développement)
- [🔗 Intégration CI/CD](#-intégration-cicd)
- [🚨 Dépannage](#-dépannage)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-license)

## 🚀 Installation et démarrage rapide

### Installation

```bash
npm install -g react-metrics-cli@latest
```

### Premier lancement

```bash
# Analyser le répertoire courant
react-metrics analyze

# Ou analyser un projet spécifique
react-metrics analyze ./mon-projet-react
```

### Configuration optionnelle

```bash
# Voir l'état de la configuration actuelle et son emplacement
react-metrics config

# Initialiser le fichier de configuration avec les valeurs par défaut
react-metrics config --init
```

## 📖 Utilisation

### Commandes disponibles

#### Analyse de code mort

```bash
# Analyser le répertoire courant
react-metrics analyze

# Analyser un projet spécifique
react-metrics analyze ./mon-projet-react

# Mode debug avec logs détaillés
react-metrics analyze ./mon-projet-react --debug
```

#### Configuration

```bash
# Afficher l'emplacement et l'aide
react-metrics config

# Voir la configuration actuelle
react-metrics config --info

# Créer/initialiser la configuration avec les valeurs par défaut
react-metrics config --init

# Réinitialiser la configuration (supprimer le fichier)
react-metrics config --reset

# Activer/désactiver une analyse
react-metrics config --enable constants
react-metrics config --disable dependencies

# Modifier une valeur spécifique
react-metrics config --set "maxGoroutines=50"
react-metrics config --set "analysis.definitions=false"
```

#### Aide contextuelle

```bash
# Aide générale avec diagnostic système
react-metrics

# Aide d'une commande spécifique
react-metrics analyze --help
```

## ⚙️ Configuration

### Fichier de configuration global

**Emplacement :** `$HOME/.react-metrics-cli/config.json`

Le fichier permet de personnaliser :

- Extensions de fichiers à analyser
- Dossiers ignorés (standards + personnalisés)
- Types d'analyses activées (constants, functions, classes, props, consoles, definitions, imports, exports, dependencies)
- Formats de rapports (terminal, HTML, JSON)
- Performances (nombre de goroutines)
- Annotations `// react-metrics-ignore-ligne` et `// react-metrics-ignore-file`

### Gestion de la configuration

```bash
# Initialiser la configuration avec les valeurs par défaut
react-metrics config --init

# Afficher la configuration actuelle
react-metrics config --info

# Activer/désactiver une analyse spécifique
react-metrics config --enable constants
react-metrics config --disable dependencies

# Modifier une valeur
react-metrics config --set "maxGoroutines=50"
react-metrics config --set "analysis.exports=false"

# Réinitialiser la configuration
react-metrics config --reset
```

**Usage :** Vous pouvez aussi modifier directement le fichier dans votre éditeur. Utilisez `react-metrics config` pour voir l'emplacement exact.

📚 **Documentation complète** : Voir [Configuration Guide](./.specify/memory/configuration.md) pour plus de détails sur toutes les options disponibles.

## ✨ Fonctionnalités

### Configuration React-Metrics

La CLI gère un fichier de configuration global qui permet de personnaliser :

- **Extensions de fichiers** à analyser (`.js`, `.jsx`, `.ts`, `.tsx`)
- **Dossiers ignorés** (standards + personnalisés)
- **Types d'analyses** (constantes, fonctions, classes, props, consoles, imports, dépendances)
- **Rapports** (terminal, HTML, JSON)
- **Performances** (nombre de goroutines)
- **Annotations** (ignorer les commentaires `// react-metrics-ignore`)

**Configuration simplifiée** : Utilisez `react-metrics config` pour voir le chemin du fichier et le modifier directement dans votre éditeur.

### Types de code mort détectés

L'analyseur TypeScript détecte :

- **Constantes non utilisées** : `const UNUSED_CONSTANT = "valeur"`
- **Fonctions non utilisées** : Fonctions classiques et fléchées
- **Classes non utilisées** : `class UnusedClass {}`
- **Appels console** : `console.log`, `console.warn`, etc.
- **Props React non utilisées** : Props destructurées non utilisées

### Exemple de sortie

```bash
🚀 React-Metrics - Analyse de code mort

🔍 Analyse du projet: /mon-projet-react

=== Constantes ===
Fichier: ../src/components/Button.tsx:16:1
       Nom: UNUSED_CONSTANT

=== Fonctions ===
Fichier: ../src/utils/helpers.ts:10:1
       Nom: unusedFunction

Total: 2 éléments de code mort détectés

✅ Analyse terminée avec succès
```

## 🔧 Développement

### Prérequis

- Node.js 22.14.0+
- Bun 1.0.0+ (recommandé pour le développement)

### ⚡ Compilateur TypeScript ultra-rapide

Le projet utilise **tsgo** (TypeScript v7/Corsa), le nouveau compilateur TypeScript réécrit en Go qui offre des performances **jusqu'à 10x plus rapides** que le compilateur traditionnel.

**Aucune modification de code nécessaire** - la migration est totalement transparente !

📚 **Guide complet** : Consultez [TSGO-QUICKSTART.md](./TSGO-QUICKSTART.md) pour plus de détails sur tsgo, le support VS Code, et le dépannage.

### Installation des dépendances

```bash
bun install
```

Le package `@typescript/native-preview` est automatiquement installé et utilisé pour la compilation.

### Scripts disponibles

```bash
# Compilation TypeScript (utilise tsgo)
bun bundle

# Build optimisé pour la production (utilise tsgo)
bun bundle:prod

# Nettoyage du répertoire dist
bun clean

# Développement avec rechargement automatique
bun dev

# Tests (Vitest)
bun test

# Tests en mode watch
bun test:watch

# Tests avec coverage pour CI/CD
bun test:ci

# Formatage du code avec Prettier
bun format

# Préparation avant publication (clean + build:prod + test)
bun prepublish
```

### ⚠️ Note importante sur les versions

Lors de l'incrémentation de version, pensez à mettre à jour **2 fichiers** :

- `package.json` - Version principale
- `CHANGELOG.md` - Nouvelle entrée avec les modifications

### Architecture modulaire

```bash
react-metrics-cli/
├── src/
│   ├── commands/                   # Commandes CLI
│   │   ├── Analyze.ts                  # Commande d'analyse de code mort
│   │   └── Config.ts                   # Gestion de la configuration
│   ├── lib/                        # Logique métier
│   │   ├── analysis/                   # Analyse de code mort
│   │   │   ├── detection/                  # Détection des déclarations
│   │   │   ├── verification/               # Vérification de l'utilisation
│   │   │   ├── annotations/                # Gestion des annotations
│   │   │   └── utils/                      # Utilitaires d'analyse
│   │   ├── config/                     # Configuration système
│   │   ├── logger/                     # Système de logging
│   │   ├── parser/                     # Parsing de fichiers
│   │   ├── reporter/                   # Génération de rapports
│   │   └── utils/                      # Utilitaires généraux
│   ├── types/                      # Types TypeScript
│   │   ├── analysis.ts                 # Types d'analyse
│   │   ├── config.ts                   # Types de configuration
│   │   ├── logger.ts                   # Types de logger
│   │   └── reporter.ts                 # Types de reporter
│   ├── ui/                         # Interface utilisateur
│   │   ├── display/                    # Affichage console
│   │   ├── logger/                     # Logger CLI
│   │   └── wrapper/                    # Wrappers Commander.js
│   └── index.ts                    # Point d'entrée CLI
├── dist/                           # Code TypeScript compilé
├── output/                         # Sortie des analyses et logs
├── assets/                         # Ressources (images, etc.)
├── package.json                    # Configuration npm
├── tsconfig.prod.json              # Configuration TypeScript production
└── vitest.config.ts                # Configuration des tests
```

## 🔗 Intégration CI/CD

**GitHub Actions**

```yaml
- name: Analyse du code mort
  run: |
    npm install -g react-metrics-cli@latest
    react-metrics analyze .
```

## 🚨 Dépannage

### Erreurs courantes

| Erreur                     | Solution                                                            |
| -------------------------- | ------------------------------------------------------------------- |
| **Commande non reconnue**  | Vérifier l'installation : `npm list -g react-metrics-cli`           |
| **Configuration invalide** | Réinitialiser : `react-metrics config --reset`                      |
| **Fichiers non analysés**  | Vérifier votre configuration locale : `react-metrics config --info` |

## 🤝 Contribution

Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour contribuer au projet.

## 📄 License

MIT License - voir [LICENSE](LICENSE) pour plus de détails.
