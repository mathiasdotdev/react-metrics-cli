# Changelog

## [Non publiée]

## [1.2.0] - 24/08/2025

### Added - Configuration Locale et Détection Automatique

- **Option `--local` pour environnement local** : Flexibilité développement/production
  - Commande `analyze --local` force utilisation Nexus localhost:8081
  - Auto-configuration credentials admin/admin123 pour Docker local
  - Message utilisateur explicite mode local activé
  - Variables d'environnement `NEXUS_LOCAL=true` pour contrôle programmatique
- **Détection binaire local intelligente** : Optimisation performances
  - Méthode `checkLocalBinary()` vérifie cache `~/.nexus-utils/artifacts`
  - Pattern matching plateforme-spécifique (windows-amd64, linux-amd64, darwin-amd64)
  - Tri versions décroissant avec `localeCompare` numérique
  - Réutilisation binaire existant évite téléchargements inutiles

### Fixed - Structure Maven et Téléchargement

- **Conformité Maven Repository** : Correction structure d'artefacts non-standard
  - **Avant** : `group=releases, artifact=1.8.0, version=windows-amd64` (incorrect)
  - **Après** : `group=com.maif.react-metrics, artifact=react-metrics-windows-amd64, version=1.9.0` (standard Maven2)
  - Repository unifié `react-metrics-artefacts` avec format Maven2
  - Adaptateur `BinaryManager.downloadReactMetricsBinary()` mis à jour
- **Correction fallbacks codés en dur** : Remplacement par détection automatique
  - Méthode `getLatestReactMetricsVersion()` via API REST Nexus
  - Fallback intelligent sur versions locales avec `getLatestLocalVersion()`
  - Tri sémantique versions avec filtrage regex `/^\d+\.\d+\.\d+(?:-\w+)?$/`
  - Messages utilisateur informatifs progression téléchargement

- **Bug téléchargement 0-bytes résolu** : Problème dans `@outil-nexus`
  - Cause racine : paramètre `mavenArtifactId` incorrect dans SearchRequest
  - **Correction** : utilisation `name: artifactId` au lieu de `mavenArtifactId: artifactId`
  - Fichier `outil-nexus/src/core/downloadNexusArtifactCore.ts` ligne 43
  - Téléchargements fonctionnels : binaires 5.4MB au lieu de 0 bytes
- **Gestion erreurs robuste** : Traitement échecs téléchargement
  - Messages d'erreur contextuels avec codes HTTP
  - Fallback automatique versions locales si API indisponible
  - Validation existence fichiers avant exécution
  - Cleanup automatique artefacts corrompus

### Technical - Intégration Pipeline Complète

- **Pipeline bout-en-bout validée** : Tests locaux/production
  - Upload : `react-metrics` scripts → Nexus Maven2 (structure standard)
  - Download : `react-metrics-cli` → `outil-nexus` → API Maven search/download
  - Exécution : binaire Go détection 54 éléments code mort en 607ms
  - Tests environnement : Docker local + validation fonctionnelle

## [1.1.0] - 19/08/2025

### Changed - Refactorisation Architecture Nexus

- **Structure d'artefacts simplifiée** : Organisation Maven2 optimisée
  - Noms d'artefacts courts : `windows-amd64`, `linux-amd64`, `darwin-amd64`
  - Extensions cohérentes : `.exe` pour Windows, `.bin` pour Linux/macOS
  - Repository unifié : `react-metrics-artefacts` (Maven2)
  - Structure : `releases/react-metrics/1.4.0/windows-amd64.exe`
- **Configuration environnement améliorée** : Système local/production simplifié
  - Variable `NEXUS_LOCAL=true` pour tests locaux (localhost:8081)
  - Credentials via `NEXUS_USERNAME` et `NEXUS_PASSWORD` (évite conflits Windows)
  - Auto-détection environnement : local ou production (nexus.maif.io)
- **Scripts de test intégrés** : Validation automatisée
  - `test-local.bat` et `test-local.sh` pour tests environnement local
  - Configuration automatique variables d'environnement
  - Vérification connectivité Nexus et téléchargement

### Fixed - Compatibilité Maven2

- **Support format Maven2** : Migration depuis RAW repository
  - Intégration API Maven upload pour `react-metrics` 
  - Script `upload-to-nexus-maven.sh` pour uploads Maven2
  - Recherche d'artefacts via API Maven search
- **Résolution conflits Windows** : Variables d'environnement
  - `USERNAME` système Windows ne surcharge plus credentials Nexus
  - Priorité `NEXUS_USERNAME` sur `USERNAME` pour éviter conflits
  - Variables environnement correctement chargées depuis `.env`

### Technical - Infrastructure

- **Pipeline upload/download cohérente** : Bout en bout fonctionnel
  - Upload: `react-metrics` → Nexus Maven2 → structure simplifiée
  - Download: `react-metrics-cli` → `outil-nexus` → Maven2 API
  - Tests: environnement local (docker compose) + validation complète

## [1.0.0] - 16/08/2025

### Added - Architecture CLI Complète

- **CLI TypeScript avec Commander.js** : Interface en ligne de commande complète avec 3 commandes principales
  - Commande `analyze` (défaut) : Analyse de projets React pour détecter le code mort
  - Commande `download` : Téléchargement d'artefacts Nexus avec paramètres personnalisés
  - Commande `config` : Gestion interactive de la configuration
  - Commande `help` : Aide détaillée avec exemples d'utilisation
- **Intégration Nexus Repository Manager** : Support complet pour téléchargement d'artefacts
  - Integration `@maif/nexus-utils` et `outil-nexus` pour API Nexus
  - Recherche et listage d'artefacts par groupId/artifactId
  - Détection automatique de la version la plus récente
  - Support formats Maven2 et Raw avec repositories personnalisés

### Added - Sécurité et Gestion des Tokens

- **Double chiffrement des tokens** : Système de sécurité robuste
  - Chiffrement AES pour tokens simples (legacy)
  - Chiffrement ChaCha20-Poly1305 avec sel et IV pour configuration Nexus
  - Dérivation de clés avec scryptSync pour sécurité renforcée
- **Gestion persistante des configurations** : Stockage sécurisé local
  - Configuration Nexus chiffrée (URL, groupe, repository, token)
  - Support variables d'environnement `ENCRYPTION_SECRET_KEY`
  - Validation et re-saisie automatique en cas de token invalide
- **Prompts interactifs** : Interface utilisateur avec Inquirer.js
  - Saisie sécurisée des tokens avec masquage
  - Configuration interactive complète Nexus
  - Menu de configuration avec options reset/info

### Added - Support Multi-Plateforme

- **Détection automatique OS/Architecture** : Support complet cross-platform
  - Windows (AMD64/ARM64) : `react-metrics-windows-*.exe`
  - Linux (AMD64/ARM64) : `react-metrics-linux-*`
  - macOS (AMD64/ARM64) : `react-metrics-darwin-*`
- **Chemins de stockage optimisés** : Organisation système par OS
  - Windows : `C:\react-metrics\`
  - Linux/macOS : `/usr/local/react-metrics/`
  - Cache utilisateur : `~/.react-metrics-cache/`

## [0.4.0] - 14/07/2025

### Added - Exécution et Monitoring

- **Exécuteur de binaires Go** : Interface d'exécution sophistiquée
  - Construction automatique des arguments CLI Go
  - Capture temps réel stdout/stderr avec couleurs
  - Timeouts configurables (10min exécution, 5min téléchargement)
  - Spinners et indicateurs de progression avec Ora
- **Parsing et formatage des résultats** : Affichage intelligent
  - Formatage coloré avec Chalk
  - Rapport détaillé durée d'exécution
  - Support mode debug avec fichiers de logs
  - Gestion d'erreurs contextuelle

### Technical - Architecture Modulaire

- **Structure claire commands/utils/config** : Séparation des responsabilités
  - `AnalyzeCommand` : Orchestration analyse avec binaire Go
  - `ConfigCommand` : Gestion configuration interactive
  - `BinaryManager` : Téléchargement et gestion artefacts Nexus
  - `BinaryExecutor` : Exécution binaires avec monitoring
  - `TokenManager` : Chiffrement/déchiffrement tokens
- **Configuration centralisée** : Constants avec détection environnement
  - Chemins adaptés par OS avec fonctions helpers
  - Extraction automatique version depuis binaires
  - URLs de téléchargement dynamiques par plateforme
- **Pipeline CI/CD Jenkins** : Intégration DevOps
  - Support Node.js 22 avec npm
  - Bibliothèques MAIF intégrées (df-maif-pipeline-library)

### Changed - Interface Utilisateur

- **Messages utilisateur cohérents** : Expérience utilisateur optimisée
  - Emojis et couleurs pour feedback visuel
  - Messages d'erreur contextuels et actionables
  - Aide détaillée avec exemples pratiques
- **Gestion d'erreurs globales** : Robustesse applicative
  - Capture uncaughtException et unhandledRejection
  - Codes de sortie appropriés pour CI/CD
  - Nettoyage automatique en cas d'erreur

## [0.3.0] - 05/06/2025

### Added - Intégration Nexus Repository

- **Configuration Nexus avancée** : Support repositories personnalisés
  - Paramètres groupId/artifactId/version flexibles
  - Support formats multiples (Maven2, Raw)
  - Configuration repository par défaut `react-metrics-binaries`
- **Téléchargement intelligent** : Gestion versions et artefacts
  - Détection automatique dernière version disponible
  - Tri intelligent des versions avec `localeCompare` numérique
  - Fallback version 1.0.0 par défaut

### Added - Sécurité Tokens

- **Chiffrement AES des tokens** : Première implémentation sécurité
  - Clé secrète configurable `react-metrics-secret-key-2024`
  - Stockage chiffré local des tokens Nexus
  - Validation automatique et re-saisie si invalide

## [0.2.0] - 04/06/2025

### Added - CLI de Base

- **Structure CLI Commander.js** : Foundation de l'interface
  - Commandes de base analyze/config/help
  - Options --debug et --output pour analyse
  - Parsing arguments et gestion erreurs
- **Exécuteur binaire** : Interface avec binaires Go
  - Construction arguments `analyser --chemin --debug --sortie`
  - Capture output avec spawn et pipes
  - Affichage temps réel avec formatage couleur

### Added - Gestion Configuration

- **Menu configuration interactif** : Interface utilisateur basique
  - Options info/reset avec Inquirer.js
  - Gestion tokens et paths de stockage
  - Structure modulaire commands/utils

## [0.1.0] - 27/05/2025

### Added - Initialisation Projet

- **Setup TypeScript/Node.js** : Foundation technique
  - Configuration TypeScript avec types stricts
  - Dependencies CLI : Commander, Inquirer, Chalk
  - Structure projet modulaire src/commands/utils/config
- **Package.json complet** : Configuration NPM
  - Binaire `react-metrics` avec point d'entrée
  - Scripts build/dev/test avec ts-node
  - Keywords et metadata pour publication
- **Jenkinsfile MAIF** : Intégration pipeline
  - Configuration Node.js 22 avec libraries MAIF
  - Support npm pour build et déploiement
  - Pipeline automatisé pour CI/CD

### Technical - Foundation

- **Architecture extensible** : Base pour évolutions futures
  - Interfaces TypeScript pour options et résultats
  - Séparation claire business logic/infrastructure
  - Support multi-commandes avec aliases
- **Engine Node.js 18+** : Compatibilité moderne
  - Support async/await natif
  - Modules ES6+ avec transpilation TypeScript
  - Dépendances sécurisées et maintenues
