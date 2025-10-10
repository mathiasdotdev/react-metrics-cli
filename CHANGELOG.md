# Changelog

## [Non publiée]

## [0.20.0] - 10/10/2025

### Added

- **Système d'analyse TypeScript natif** : Implémentation complète des modules detection, verification et annotation
- **Migration vers Bun** : Intégration du runtime Bun avec bunfig.toml et lockfile natif
- **Tests snapshot** : Suite complète de tests avec snapshots pour analyse, config, logger, reporter
- **Projet react-demo complet** : Nouveau projet de démonstration avec exemples d'usage exhaustifs
- **ESLint natif** : Configuration moderne avec eslint.config.ts
- **Pre-commit hooks** : Intégration Husky pour validation automatique

### Changed

- **Architecture modulaire** : Refonte complète vers src/lib/ avec séparation analysis/config/parser/reporter/ui
- **Système de types** : Types centralisés dans src/lib/types/

### Technical

- **Tests snapshot** : Helpers de test et validation automatique des résultats
- **Structure react-demo** : Exemples pour props, annotations, classes, deprecated features

## [0.19.0] - 04/10/2025

### Removed

- **Commande `upload`** : Suppression de l'upload vers Nexus (fonctionnalité obsolète depuis migration TypeScript natif)
- **Commande `download`** : Suppression du téléchargement de binaires depuis Nexus (plus nécessaire avec tsgo)
- **Commande `coverage`** : Suppression de l'analyse de couverture (spécifique aux tests Go, non applicable)
- **Authentification Nexus** : Suppression du système de credentials et TokenManager (plus utilisé)
- **Dépendances binaires Go** : Le projet utilise maintenant exclusivement TypeScript avec tsgo

### Changed

- **Documentation** : Mise à jour README pour refléter uniquement les commandes `analyze` et `config`
- **Emplacement configuration** : Simplification de `~/.nexus-utils/` vers `~/.react-metrics/`
- **Architecture** : Focus sur l'analyse TypeScript native sans dépendances externes

### Technical

- **Nettoyage codebase** : Suppression des références obsolètes à Nexus, binaires Go, et credentials
- **Structure simplifiée** : Architecture centrée sur `src/lib/` avec modules analysis, config, logger, parser, reporter

## [0.18.0] - 29/09/2025

### Added

- **Compilateur TypeScript natif** : Migration vers tsgo (TypeScript v7/Corsa) écrit en Go pour performance x10
- **Package @typescript/native-preview** : Intégration du compilateur preview pour compilation ultra-rapide

### Changed

- **Scripts de build** : Remplacement de `tsc` par `tsgo` dans tous les scripts npm
- **Performance de build** : Amélioration significative des temps de compilation (jusqu'à 10x plus rapide)

### Technical

- **Maintien compatibilité** : TypeScript 5.9.2 conservé pour outils comme `tsc --init` et ts-node

## [0.17.0] - 29/09/2025

### Added

- **Agent Framework** : Intégration complète avec commandes agents (analyze, changelog, clarify, constitution, implement, plan, specify, tasks)
- **Système Specify** : Framework de développement avec mémoire organisationnelle, scripts et templates pour workflows

### Changed

- **Documentation projet** : Mise à jour des guides de contribution et processus de développement

### Technical

- **Infrastructure de test** : Retrait script test-local.sh remplacé par nouveaux workflows

## [0.16.0] - 08/09/2025

### Technical

- **Migration vers modules natifs Node.js** : Suppression des dépendances `crypto-js` et `fs-extra` au profit des modules natifs `node:crypto` et `node:fs`
- **Chiffrement sécurisé amélioré** : Remplacement du chiffrement CryptoJS par AES-256-CBC natif avec IV aléatoire et dérivation de clé scrypt
- **API promises native** : Migration complète vers `fs.promises` pour toutes les opérations fichiers

## [0.15.0] - 05/09/2025

### Changed

- **Logger Pino** : Remplacement du système Logger personnalisé par Pino avec niveau debug par défaut et coloré

## [0.14.0] - 29/08/2025

### Added

- **Fichier CONTRIBUTING.md** : Guide de contribution manquant avec workflow TypeScript/Node.js adapté au projet
- **Section contribution README.md** : Lien vers CONTRIBUTING.md pour améliorer la visibilité

## [0.13.0] - 28/08/2025

### Fixed

- **Tests unitaires complets** : Correction de tous les tests restants (problèmes de mock sur Upload)
- **Mocking ConfigManager** : Ajout du mock Logger pour éliminer les sorties stderr
- **Mocking Upload** : Correction TokenManager et fs-extra pour tests d'authentification

## [0.12.0] - 28/08/2025

### Added

- **Commande upload** : Upload intégré des binaires vers Nexus Repository avec `react-metrics upload -v 1.0.0`
- **Intégration TokenManager** : Utilisation du système de credentials chiffré existant
- **Mode dry-run** : Simulation par défaut avec `--dry-run`, upload réel avec `--no-dry-run`
- **Tests complets** : Suite de tests unitaires pour la commande upload

### Fixed

- **Script make upload** : Remplacement de la dépendance aux variables d'environnement par le système TokenManager

## [0.11.0] - 28/08/2025

### Fixed

- **Suite de tests complète** : Correction de tous les tests unitaires et d'intégration
- **Support Windows** : Fix spawn npm avec npm.cmd et shell
- **Mocks et exports manquants** : Ajout des dépendances System.ts et Logger

## [0.10.0] - 26/08/2025

### Added

- **Logger centralisé** : Couleurs cohérentes
- **Configuration .env** : Variables d'environnement
- **Tests complets** : Suite pour core/config
- **Build optimisé** : Scripts d'analyse

### Changed

- **TokenManager** : Un seul champ base64 depuis Nexus User Token
- **Stockage credentials** : dans `~/.nexus-utils/.credentials`
- **Système de retry** : 3 tentatives avant suppression des credentials
- **Remplacement 130+ console.log** : par Logger

### Fixed

- **Interface TokenManager** : Simplification avec validation automatique du format base64
- **Gestion environnements** : Détection automatique local/prod avec variables d'environnement
- **Build size** : Réduction significative avec tsconfig.prod.json

## [0.9.0] - 26/08/2025

### Fixed

- **Stockage credentials** : Migration vers `$HOME/.nexus-utils/` au lieu de `C:\react-metrics\`
- **Messages de completion** : Suppression doublons "Analyse terminée" (une seule occurrence)

### Changed

- **Chemins de configuration** : Utilisation de `path.join()` pour compatibilité cross-platform

## [0.8.0] - 26/08/2025

### Added

- **Commande config --credentials** : Configuration explicite des credentials Nexus avec chiffrement AES
- **Commande config --reset** : Suppression complète de toute la configuration (React-Metrics + credentials)
- **Logo compact** : Affichage du logo sur toutes les sous-commandes config

### Fixed

- **Messages d'aide système** : Correction instructions obsolètes sur configuration credentials (.env → chiffrement AES)
- **UX cohérente** : Logo affiché de manière consistante dans toutes les commandes

## [0.7.0] - 26/08/2025

### Added

- **Système chiffrement AES** : Remplacement du `.env` par chiffrement sécurisé des credentials Nexus
- **Configuration centralisée** : Stockage dans `$HOME/.nexus-utils/react-metrics.json` avec fusion intelligente
- **TokenManager refactorisé** : Gestion sécurisée des credentials avec mot de passe maître

### Changed

- **Sécurité renforcée** : Abandon des variables d'environnement au profit du chiffrement AES
- **UX améliorée** : Prompts interactifs pour configuration credentials avec validation

## [0.6.0] - 25/08/2025

### Added

- **Suite de tests complète** : Tests unitaires et d'intégration avec Vitest
- **Tests CLI end-to-end** : Validation de toutes les commandes et options
- **Helpers de test** : Utilitaires pour mocking et assertions

### Technical

- **Réorganisation arborescence** : Structure modulaire avec dossiers thématiques
  - `core/` : Logique métier (binary, nexus)
  - `ui/` : Interface utilisateur (display, wrapper)
  - `system/` : Diagnostics système
- **Tests co-localisés** : Dossiers `__tests__` à côté du code source
- **Migration Jest → Vitest** : Résout les problèmes ESM/CommonJS, plus rapide
- **Configuration Vitest** : Coverage, scripts de test, timeout adaptés
- **Convention nommage** : PascalCase pour tous les fichiers TypeScript

### Changed

- **Scripts npm** : `test:watch`, `test:coverage`, `test:unit`, `test:integration`
- **Prepublish** : Inclut maintenant les tests avant publication

## [0.5.0] - 25/08/2025

### Added

- **Aide contextuelle intelligente** : Diagnostic automatique de l'état système (credentials, binaires)
- **Module SystemDiagnostic** : Messages d'aide adaptatifs selon la configuration

### Fixed

- **Menu configuration Inquirer** : Correction erreur `inquirer.prompt is not a function`
- **Détection binaires** : Support cache utilisateur `~/.nexus-utils/artifacts/`
- **Affichage problèmes multiples** : Toutes les solutions affichées simultanément

### Changed

- **Version dynamique** : Récupération automatique depuis `package.json`
- **Architecture CommonJS** : Retour CommonJS pour simplicité et compatibilité

## [0.4.0] - 25/08/2025

### Changed

- **Architecture modulaire** : Refactorisation complète avec commandes séparées
- **Point d'entrée simplifié** : `index.ts` réduit à 55 lignes
- **Aide intelligente** : Module `helpDisplay.ts` avec aide contextuelle

### Fixed

- **Comportement par défaut** : `react-metrics` seul affiche aide au lieu d'analyser
- **Suppression doublons** : Logo affiché une seule fois par commande

## [0.3.0] - 24/08/2025

### Added

- **Configuration Nexus** : Support Nexus via variables d'environnement
- **Détection binaire intelligente** : Cache `~/.nexus-utils/artifacts`

### Fixed

- **Structure Maven2** : Conformité repository standard
- **Téléchargement 0-bytes** : Correction paramètres API Nexus

## [0.2.0] - 19/08/2025

### Changed

- **Structure artefacts simplifiée** : Organisation Maven2 optimisée
- **Configuration environnement** : Variables `NEXUS_LOCAL`, `NEXUS_USERNAME`, `NEXUS_PASSWORD`

### Fixed

- **Compatibilité Maven2** : Migration depuis repository RAW
- **Conflits Windows** : Variables d'environnement `USERNAME` vs `NEXUS_USERNAME`

## [0.1.0] - 16/08/2025

### Added

- **CLI TypeScript** : Interface complète avec Commander.js (analyze, download, config)
- **Intégration Nexus** : Support téléchargement artefacts avec `@maif/nexus-utils`
- **Chiffrement tokens** : Sécurité AES et ChaCha20-Poly1305
- **Support multi-plateforme** : Windows, Linux, macOS (AMD64/ARM64)
- **Exécution binaires Go** : Interface sophistiquée avec monitoring
