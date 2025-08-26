# React-Metrics CLI

![React-Metrics CLI Screenshot](./assets/react-metrics.png)

Interface en ligne de commande TypeScript pour analyser le code mort dans les projets React/TypeScript. Télécharge et exécute automatiquement le binaire Go d'analyse depuis Nexus Repository.

## 📋 Table des matières

- [🚀 Installation et démarrage rapide](#-installation-et-démarrage-rapide)
- [📖 Utilisation](#-utilisation)  
- [⚙️ Configuration](#️-configuration)
- [🔐 Authentification sécurisée](#-authentification-sécurisée)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🔧 Développement](#-développement)
- [🔗 Intégration CI/CD](#-intégration-cicd)
- [🚨 Dépannage](#-dépannage)
- [📄 Licence et contribution](#-licence-et-contribution)

## 🚀 Installation et démarrage rapide

### Installation

```bash
npm install -g react-metrics-cli
```

### Premier lancement

```bash
# Analyse locale (aucune configuration requise si binaire local disponible)
react-metrics analyze

# Ou analyser un projet spécifique
react-metrics analyze ./mon-projet-react

# Pour télécharger depuis Nexus, les credentials seront demandés automatiquement
```

### Configuration optionnelle

```bash
# Voir la configuration actuelle et son emplacement
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
react-metrics analyze --debug ./mon-projet-react

# Tests avec Nexus local
react-metrics analyze --local
```

| Option    | Description                                    |
| --------- | ---------------------------------------------- |
| `--debug` | Active le mode debug avec fichier de log      |
| `--local` | Utilise Nexus local (localhost:8081)          |

#### Couverture de tests

```bash
# Analyser la couverture
react-metrics coverage

# Générer rapport HTML
react-metrics coverage --html output/coverage/coverage.html
```

#### Configuration

```bash
# Afficher l'emplacement et l'aide
react-metrics config

# Voir la configuration actuelle
react-metrics config --info  

# Créer/réinitialiser la configuration
react-metrics config --init
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

**Emplacement :** `$HOME/.nexus-utils/react-metrics.json`

Le fichier permet de personnaliser :
- Extensions de fichiers à analyser  
- Dossiers ignorés (standards + personnalisés)
- Types d'analyses activées
- Formats de rapports (terminal, HTML, JSON)
- Performances (nombre de goroutines)
- Annotations `// react-metrics-ignore`

**Usage :** Modifiez directement le fichier dans votre éditeur. Utilisez `react-metrics config` pour voir l'emplacement.

### Emplacements des fichiers

| Type | Emplacement | Description |
|------|-------------|-------------|
| **Configuration** | `~/.nexus-utils/react-metrics.json` | Paramètres de l'outil |
| **Credentials** | `~/.nexus-utils/.credentials` | Credentials Nexus chiffrés |
| **Binaires** | `~/.nexus-utils/artifacts/` | Binaires téléchargés |
| **Système (fallback)** | `C:\react-metrics\` (Win) ou `/usr/local/react-metrics/` | Répertoires système |

### Tests avec Nexus local

```bash
# Utiliser localhost:8081
export NEXUS_LOCAL=true
react-metrics analyze --local
```

## ✨ Fonctionnalités

### Configuration React-Metrics

La CLI gère un fichier de configuration global dans `$HOME/.nexus-utils/react-metrics.json` qui permet de personnaliser :

- **Extensions de fichiers** à analyser (`.js`, `.jsx`, `.ts`, `.tsx`)
- **Dossiers ignorés** (standards + personnalisés)
- **Types d'analyses** (constantes, fonctions, classes, props, consoles, imports, dépendances)
- **Rapports** (terminal, HTML, JSON)
- **Performances** (nombre de goroutines)
- **Annotations** (ignorer les commentaires `// react-metrics-ignore`)

**Configuration simplifiée** : Utilisez `react-metrics config` pour voir le chemin du fichier et le modifier directement dans votre éditeur.

### Types de code mort détectés

La CLI utilise le binaire Go pour détecter :

- **Constantes non utilisées** : `const UNUSED_CONSTANT = "valeur"`
- **Fonctions non utilisées** : Fonctions classiques et fléchées
- **Classes non utilisées** : `class UnusedClass {}`
- **Appels console** : `console.log`, `console.warn`, etc.
- **Props React non utilisées** : Props destructurées non utilisées

### Exemple de sortie

```bash
🚀 React-Metrics - Analyse de code mort

✅ Binaire trouvé
🔍 Analyse du projet: /mon-projet-react

=== Constantes ===
Fichier: ../src/components/Button.tsx:16:1
       Nom: UNUSED_CONSTANT

=== Fonctions ===
Fichier: ../src/utils/helpers.ts:10:1
       Nom: unusedFunction

Total: 2 éléments de code mort détectés

✅ Analyse terminée avec succès en 1250ms
📝 Logs debug disponibles dans: output/logs/react-metrics-debug.log
```

## 🔧 Développement

### Prérequis

- Node.js 16+
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

### Scripts disponibles

```bash
# Compilation TypeScript
npm run build

# Développement avec rechargement automatique
npm run dev

# Tests unitaires et d'intégration (Vitest)
npm run test

# Tests en mode watch
npm run test:watch

# Tests avec coverage
npm run test:coverage

# Interface web pour les tests
npm run test:ui

# Tests d'intégration CLI uniquement
npm run test:integration

# Tests unitaires uniquement
npm run test:unit

# Démarrage de la CLI compilée
npm start
```

### Architecture modulaire

```
react-metrics-cli/
├── src/
│   ├── commands/           # Commandes CLI (Analyze, Coverage, Config)
│   ├── core/              # Logique métier
│   │   ├── binary/        # Gestion des binaires (Manager, Executor)
│   │   ├── config/        # Configuration globale (ConfigManager, System)
│   │   └── nexus/         # Interaction Nexus (TokenManager)
│   ├── ui/                # Interface utilisateur
│   │   ├── display/       # Affichage (HelpDisplay, LogoDisplay)
│   │   └── wrapper/       # Wrappers Commander
│   └── system/            # Diagnostics système
├── dist/                  # Code compilé
└── package.json          # Configuration projet
```


## 🔗 Intégration CI/CD

**Jenkins**
```groovy
pipeline {
    agent any
    stages {
        stage('Analyse Code Mort') {
            steps {
                sh 'npx react-metrics-cli analyze .'
            }
        }
    }
}
```

**GitHub Actions**
```yaml
- name: Analyse du code mort
  run: |
    npm install -g react-metrics-cli
    react-metrics analyze .
```

## 🚨 Dépannage

### Erreurs courantes

| Erreur | Solution |
|--------|----------|
| **Token invalide** | Supprimer `~/.nexus-utils/.credentials` |
| **Binaire non trouvé** | Vérifier permissions Nexus |
| **Téléchargement impossible** | Vérifier connexion/permissions |
| **Permissions insuffisantes** | `chmod +x` sur le binaire |

### Diagnostic

```bash
# Mode debug
react-metrics analyze --debug

# Info configuration  
react-metrics config --info
```

## 📄 License

MIT License - voir [LICENSE](LICENSE) pour plus de détails.