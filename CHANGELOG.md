# Changelog

## [Non publiée]

## [1.8.0] - 26/08/2025

### Fixed
- **Stockage credentials** : Migration vers `$HOME/.nexus-utils/` au lieu de `C:\react-metrics\`
- **Messages de completion** : Suppression doublons "Analyse terminée" (une seule occurrence)

### Changed
- **Chemins de configuration** : Utilisation de `path.join()` pour compatibilité cross-platform

## [1.7.0] - 26/08/2025

### Added
- **Commande config --credentials** : Configuration explicite des credentials Nexus avec chiffrement AES
- **Commande config --reset** : Suppression complète de toute la configuration (React-Metrics + credentials)
- **Logo compact** : Affichage du logo sur toutes les sous-commandes config

### Fixed
- **Messages d'aide système** : Correction instructions obsolètes sur configuration credentials (.env → chiffrement AES)
- **UX cohérente** : Logo affiché de manière consistante dans toutes les commandes

## [1.6.0] - 26/08/2025

### Added
- **Système chiffrement AES** : Remplacement du `.env` par chiffrement sécurisé des credentials Nexus
- **Configuration centralisée** : Stockage dans `$HOME/.nexus-utils/react-metrics.json` avec fusion intelligente
- **TokenManager refactorisé** : Gestion sécurisée des credentials avec mot de passe maître

### Changed
- **Sécurité renforcée** : Abandon des variables d'environnement au profit du chiffrement AES
- **UX améliorée** : Prompts interactifs pour configuration credentials avec validation

## [1.5.0] - 25/08/2025

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

## [1.4.0] - 25/08/2025

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

## [1.3.0] - 25/08/2025

### Changed
- **Architecture modulaire** : Refactorisation complète avec commandes séparées
- **Point d'entrée simplifié** : `index.ts` réduit à 55 lignes
- **Aide intelligente** : Module `helpDisplay.ts` avec aide contextuelle

### Fixed
- **Comportement par défaut** : `react-metrics` seul affiche aide au lieu d'analyser
- **Suppression doublons** : Logo affiché une seule fois par commande

## [1.2.0] - 24/08/2025

### Added
- **Option `--local`** : Support Nexus local (localhost:8081)
- **Détection binaire intelligente** : Cache `~/.nexus-utils/artifacts`

### Fixed
- **Structure Maven2** : Conformité repository standard
- **Téléchargement 0-bytes** : Correction paramètres API Nexus

## [1.1.0] - 19/08/2025

### Changed
- **Structure artefacts simplifiée** : Organisation Maven2 optimisée
- **Configuration environnement** : Variables `NEXUS_LOCAL`, `NEXUS_USERNAME`, `NEXUS_PASSWORD`

### Fixed
- **Compatibilité Maven2** : Migration depuis repository RAW
- **Conflits Windows** : Variables d'environnement `USERNAME` vs `NEXUS_USERNAME`

## [1.0.0] - 16/08/2025

### Added
- **CLI TypeScript** : Interface complète avec Commander.js (analyze, download, config)
- **Intégration Nexus** : Support téléchargement artefacts avec `@maif/nexus-utils`
- **Chiffrement tokens** : Sécurité AES et ChaCha20-Poly1305
- **Support multi-plateforme** : Windows, Linux, macOS (AMD64/ARM64)
- **Exécution binaires Go** : Interface sophistiquée avec monitoring