# React-Metrics CLI

![React-Metrics CLI Screenshot](./assets/react-metrics.png)

**React-Metrics CLI** est une interface en ligne de commande TypeScript pour analyser le code mort dans les projets React/TypeScript. Il utilise le projet [react-metrics](https://github.com/mathias-hadrien/react-metrics.git) (binaire Go) pour l'analyse de code mort et télécharge automatiquement les binaires depuis Nexus Repository.

## 📋 Table des matières

- [🚀 Installation et démarrage rapide](#-installation-et-démarrage-rapide)
- [📖 Utilisation](#-utilisation)
- [⚙️ Configuration](#️-configuration)
- [🔐 Authentification sécurisée](#-authentification-sécurisée)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🔧 Développement](#-développement)
- [🔗 Intégration CI/CD](#-intégration-cicd)
- [🚨 Dépannage](#-dépannage)
- [📝 Diagnostic](#-diagnostic)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-license)

## 🚀 Installation et démarrage rapide

### Installation

```bash
npm install -g react-metrics-cli@latest
```

### Premier lancement

```bash
# Analyse locale (aucune configuration requise si un binaire local est disponible)
# Sinon, voir la section "Configuration optionnelle"
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

# Vous pouvez aussi configurer vos credentials Nexus avec la commande :
react-metrics config --credentials
```

> Pour copier le **User Token** de Nexus, allez dans [Nexus User Token](https://nexus.maif.io/#user/usertoken), puis copier le token en base64 (format user:password)

### 📦 Binaires disponibles

Les binaires Go sont automatiquement téléchargés depuis **Nexus Repository Manager** : [react-metrics-artefacts](https://nexus.maif.io/service/rest/repository/browse/react-metrics-artefacts/com/maif/react-metrics/)

#### Téléchargement manuel d'une version spécifique

```bash
# Télécharger une version particulière depuis Nexus
react-metrics download -g com.maif.react-metrics -r react-metrics-artefacts -v 1.2.0

# Spécifier un binaire spécifique par plateforme (la plateforme est détectée automatiquement en fonction de votre système d'exploitation)
react-metrics download -g com.maif.react-metrics -a react-metrics-windows-amd64-1.2.0 -r react-metrics-artefacts -v 1.2.0
```

| Paramètre           | Description                                 | Exemple                                                    |
| ------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| `-g, --group-id`    | Group ID Maven                              | `com.maif.react-metrics`                                   |
| `-r, --repository`  | Repository Nexus                            | `react-metrics-artefacts`                                  |
| `-f, --format`      | Format de l'artefact                        | `maven2`                                                   |
| `-a, --artifact-id` | Artifact ID (avec plateforme si spécifique) | `react-metrics` ou `react-metrics-windows-amd64-{version}` |
| `-v, --version`     | Version du binaire                          | `1.2.0`                                                    |

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
```

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

#### Upload vers Nexus

```bash
# Upload des binaires (mode dry-run par défaut)
react-metrics upload -v 1.0.0

# Upload réel vers Nexus
react-metrics upload -v 1.0.0 --no-dry-run
```

| Option             | Description                                   |
| ------------------ | --------------------------------------------- |
| `-v, --version`    | Version des binaires à uploader (obligatoire) |
| `-r, --repository` | Repository Nexus cible                        |
| `--dry-run`        | Simulation uniquement (par défaut)            |
| `--no-dry-run`     | Upload réel vers Nexus                        |

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

```bash
~/.nexus-utils/                     # Répertoire principal de configuration
├── react-metrics.json              # Configuration de l'outil (extensions, analyses, rapports)
├── .credentials                     # Tokens Nexus chiffrés avec AES
├── artifacts/                       # Binaires téléchargés depuis Nexus
└── cache/                          # Fichiers temporaires et cache
    ├── download-cache/
    └── temp-files/
```

## 🔐 Authentification sécurisée

### Configuration simplifiée des credentials

React-Metrics CLI utilise un système d'authentification sécurisé simplifié :

**📝 Étape 1** : Récupérez votre token depuis Nexus

- Connectez-vous à Nexus Repository
- Allez dans **User Token**
- Copiez le token base64 (format `user:password` encodé)

**🔒 Étape 2** : Configuration automatique

```bash
# Premier lancement - les credentials seront demandés automatiquement
react-metrics analyze

# Ou configuration explicite
react-metrics config --credentials
```

**🛡️ Sécurité**

- Token chiffré avec AES et mot de passe maître
- Stockage sécurisé dans `~/.nexus-utils/.credentials`
- Système de retry intelligent (3 tentatives)
- Régénération automatique en cas d'échecs répétés

### Variables d'environnement

Personnalisez la configuration avec un fichier `.env` :

```bash
# Copiez .env.example vers .env et personnalisez les valeurs
cp .env.example .env
```

Voir `.env.example` pour la liste complète des variables disponibles.

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

- Node.js 22.14.0+
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

### Scripts disponibles

```bash
# Compilation TypeScript
npm run build

# Build optimisé pour la production
npm run build:prod

# Analyse de la taille du bundle
npm run build:analyze

# Nettoyage du répertoire dist
npm run clean

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

### ⚠️ Note importante sur les versions

Lors de l'incrémentation de version, pensez à mettre à jour **3 fichiers** :

- `package.json` - Version principale
- `CHANGELOG.md` - Nouvelle entrée avec les modifications
- `src/__tests__/integration/cli-basic.test.ts` - Test d'expectation de version (le test s'appelle `should display version when --version flag is used`)

### Architecture modulaire

```bash
react-metrics-cli/
├── src/
│   ├── commands/                   # Commandes CLI
│   │   ├── Analyze.ts                  # Commande d'analyse de code mort
│   │   ├── Config.ts                   # Gestion de la configuration
│   │   ├── Coverage.ts                 # Analyse de couverture de tests
│   │   ├── Download.ts                 # Téléchargement d'artefacts Nexus
│   │   └── Upload.ts                   # Upload vers Nexus
│   ├── core/                       # Logique métier
│   │   ├── binary/                     # Gestion des binaires Go
│   │   │   ├── BinaryExecutor.ts           # Exécution des binaires
│   │   │   └── BinaryManager.ts            # Téléchargement et gestion
│   │   ├── config/                     # Configuration système
│   │   │   ├── ConfigManager.ts            # Gestionnaire de configuration
│   │   │   └── System.ts                   # Constantes système
│   │   └── nexus/                      # Authentification Nexus
│   │       └── TokenManager.ts             # Gestion des tokens chiffrés
│   ├── ui/                         # Interface utilisateur
│   │   ├── display/                    # Affichage console
│   │   │   ├── HelpDisplay.ts              # Aide contextuelle
│   │   │   └── LogoDisplay.ts              # Logo et branding
│   │   ├── logger/                     # Système de logging
│   │   │   └── Logger.ts                   # Logger centralisé
│   │   └── wrapper/                    # Wrappers Commander.js
│   │       └── CommandWrapper.ts           # Wrapper des commandes
│   ├── system/                     # Diagnostics système
│   │   └── SystemDiagnostic.ts         # Diagnostic de l'environnement
│   └── index.ts                    # Point d'entrée CLI
├── scripts/                        # Scripts d'optimisation
├── dist/                           # Code TypeScript compilé
├── output/                         # Sortie des analyses et logs
├── assets/                         # Ressources (images, etc.)
├── package.json                    # Configuration npm
├── tsconfig.prod.json              # Configuration TypeScript production
└── vitest.config.ts                # Configuration des tests
```

## 🔗 Intégration CI/CD

**Jenkins**

```groovy
pipeline {
    agent any
    stages {
        stage('Analyse Code Mort') {
            steps {
                sh 'npx react-metrics-cli@latest analyze .'
            }
        }
    }
}
```

**GitHub Actions**

```yaml
- name: Analyse du code mort
  run: |
    npm install -g react-metrics-cli@latest
    react-metrics analyze .
```

## 🚨 Dépannage

### Erreurs courantes

| Erreur                        | Solution                                |
| ----------------------------- | --------------------------------------- |
| **Token invalide**            | Supprimer `~/.nexus-utils/.credentials` |
| **Binaire non trouvé**        | Vérifier permissions Nexus              |
| **Téléchargement impossible** | Vérifier connexion/permissions          |
| **Permissions insuffisantes** | `chmod +x` sur le binaire               |

### 📝 Diagnostic

```bash
# Mode debug
react-metrics analyze --debug

# Info configuration
react-metrics config --info
```

## 🤝 Contribution

Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour contribuer au projet.

## 📄 License

MIT License - voir [LICENSE](LICENSE) pour plus de détails.
