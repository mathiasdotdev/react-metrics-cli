# React-Metrics CLI

![React-Metrics CLI Screenshot](./assets/react-metrics.png)

CLI pour analyser le code mort dans les projets React/TypeScript en utilisant le binaire Go.

## 🚀 Installation

```bash
npm install -g react-metrics-cli
```

## 📖 Utilisation

### Commande d'analyse (par défaut)

```bash
# Analyser le répertoire courant
react-metrics

# Analyser un projet spécifique
react-metrics ./mon-projet-react

# Analyser avec le mode debug
react-metrics --debug

# Forcer le téléchargement du binaire
react-metrics --force

# Spécifier un fichier de sortie pour les logs
react-metrics --debug --output mon-rapport.log
```

### Options d'analyse

| Option            | Alias | Description                                              |
| ----------------- | ----- | -------------------------------------------------------- |
| `--debug`         | `-d`  | Active le mode debug (génère un fichier de log détaillé) |
| `--output <file>` | `-o`  | Fichier de sortie pour les logs debug                    |
| `--force`         | `-f`  | Force le téléchargement du binaire même s'il existe      |

### Commandes de configuration

```bash
# Menu interactif de configuration
react-metrics config

# Afficher les informations de configuration
react-metrics config --info

# Mettre à jour le binaire
react-metrics config --update

# Remettre à zéro la configuration
react-metrics config --reset
```

### Aide

```bash
# Afficher l'aide générale
react-metrics --help

# Afficher l'aide détaillée
react-metrics help
```

## ⚙️ Configuration

### Configuration .env pour Nexus

**IMPORTANT**: Avant la première utilisation, configurez vos identifiants Nexus dans le fichier `$HOME/.nexus-utils/.env` :

```bash
# Créer le répertoire si nécessaire
mkdir -p ~/.nexus-utils

# Créer le fichier .env avec vos identifiants
cat << EOF > ~/.nexus-utils/.env
NEXUS_USERNAME=your-token-name
NEXUS_PASSWORD=your-token-password
EOF
```

Ces identifiants sont nécessaires pour télécharger les binaires depuis votre repository Nexus. Vous pouvez obtenir ces tokens depuis votre interface Nexus (cf: https://nexus.maif.io/#user/usertoken).

### Tests locaux

Pour tester avec une instance Nexus locale (`localhost:8081`), définir la variable d'environnement :

```bash
# Windows
set NEXUS_LOCAL=true
react-metrics download -v 1.0.0
# Linux/macOS
export NEXUS_LOCAL=true
react-metrics download -v 1.0.0
```

Ou utiliser les scripts de test fournis :

```bash
# Windows
.\test-local.bat

# Linux/macOS
./test-local.sh
```

### Première utilisation

Lors de la première utilisation, la CLI utilisera automatiquement les identifiants configurés dans `.nexus-utils/.env` pour télécharger le binaire d'analyse.

### Chemins de stockage

**⚠️ CHEMINS EXPLICITES - MODIFIEZ SELON VOS BESOINS**

#### Windows

- **Binaire** : `C:\react-metrics\react-metrics-windows-amd64.exe`
- **Token chiffré** : `C:\react-metrics\nexus-token.enc`

#### Linux/macOS

- **Binaire** : `/usr/local/react-metrics/react-metrics-linux-amd64` (ou darwin)
- **Token chiffré** : `/usr/local/react-metrics/nexus-token.enc`

### Configuration Nexus

**⚠️ CONFIGURATION NEXUS - MODIFIEZ DANS `src/config/constants.ts`**

```typescript
export const NEXUS_CONFIG = {
  // URL de base de votre Nexus Repository
  BASE_URL: 'https://nexus.maif.io/repository/react-metrics-binaries',

  // Nom du repository dans Nexus
  REPOSITORY: 'react-metrics-binaries',

  // Version du binaire à télécharger
  VERSION: '1.0.0',

  // Groupe/namespace du binaire
  GROUP: 'com.company.react-metrics',
}
```

## 🔍 Types de code mort détectés

La CLI utilise le binaire Go pour détecter :

- **Constantes non utilisées** : `const UNUSED_CONSTANT = "valeur"`
- **Fonctions non utilisées** : Fonctions classiques et fléchées
- **Classes non utilisées** : `class UnusedClass {}`
- **Appels console** : `console.log`, `console.warn`, etc.
- **Props React non utilisées** : Props destructurées non utilisées

## 📊 Exemple de sortie

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
```

## 🔧 Développement

### Prérequis

- Node.js 16+
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

### Scripts de développement

```bash
# Compilation TypeScript
npm run build

# Développement avec rechargement automatique
npm run dev

# Tests
npm run test

# Démarrage de la CLI compilée
npm start
```

### Structure du projet

```
react-metrics-cli/
├── src/
│   ├── config/
│   │   └── constants.ts          # Configuration Nexus et chemins
│   ├── utils/
│   │   ├── tokenManager.ts       # Gestion des tokens chiffrés
│   │   ├── binaryManager.ts      # Téléchargement et gestion du binaire
│   │   └── binaryExecutor.ts     # Exécution du binaire Go
│   ├── commands/
│   │   ├── analyze.ts            # Commande d'analyse
│   │   └── config.ts             # Commande de configuration
│   └── index.ts                  # Point d'entrée CLI
├── dist/                         # Code compilé
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Sécurité

### Chiffrement du token

Le token Nexus est chiffré avec AES avant d'être stocké localement. La clé de chiffrement peut être modifiée dans `src/config/constants.ts` :

```typescript
export const ENCRYPTION_CONFIG = {
  SECRET_KEY: 'react-metrics-secret-key-2024',
  ALGORITHM: 'AES',
}
```

### Validation du token

La CLI valide automatiquement le token lors du téléchargement. En cas d'échec (401), elle demande un nouveau token.

## 🚨 Dépannage

### Erreurs courantes

#### "Token Nexus invalide ou expiré"

```bash
# Supprimer le token et en saisir un nouveau
react-metrics config --reset
```

#### "Binaire non trouvé sur Nexus"

- Vérifiez la configuration Nexus dans `constants.ts`
- Vérifiez que le binaire existe sur votre serveur Nexus
- Vérifiez les permissions d'accès

#### "Impossible de télécharger le binaire"

- Vérifiez votre connexion internet
- Vérifiez les permissions d'écriture dans le répertoire de destination
- Essayez avec `--force` pour forcer le téléchargement

#### Permissions insuffisantes (Linux/macOS)

```bash
# Donner les permissions d'exécution
sudo chmod +x /usr/local/react-metrics/react-metrics-*

# Ou changer le répertoire de destination dans constants.ts
```

### Logs de debug

Utilisez le mode debug pour obtenir plus d'informations :

```bash
react-metrics --debug --output debug.log
```

### Informations de configuration

```bash
react-metrics config --info
```

## 🔗 Intégration CI/CD

### Jenkins

```groovy
pipeline {
    agent any
    stages {
        stage('Analyse Code Mort') {
            steps {
                sh 'npx react-metrics-cli .'
            }
        }
    }
}
```

### GitHub Actions

```yaml
- name: Analyse du code mort
  run: |
    npm install -g react-metrics-cli
    react-metrics .
```

### Variables d'environnement

Vous pouvez configurer le token via une variable d'environnement :

```bash
export NEXUS_TOKEN="votre-token"
react-metrics
```

## 📝 Licence

MIT

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request
