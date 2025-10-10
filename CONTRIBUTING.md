# Guide de Contribution

Merci de votre intérêt pour contribuer à React-Metrics CLI !

## 📚 Documentation de Référence

Cette documentation est organisée en fichiers spécialisés dans `.specify/memory/` pour des informations détaillées :

### **[Workflow de Contribution](.specify/memory/contribution-workflows.md)**

Détaille le processus complet de contribution :

- Git workflow avec fork, branches et commits
- Processus de Pull Request étape par étape
- Types de contributions (nouvelles commandes, améliorations, corrections)
- Validation et tests requis avant soumission

### **[Standards de Code](.specify/memory/code-standards.md)**

Spécifie les exigences techniques et qualité :

- Standards TypeScript avec mode strict
- Gestion de versions sémantique et fichiers à mettre à jour
- Requirements Node.js 22+ et TypeScript 5.3+
- Configuration de l'environnement de développement et sécurité

### **[Standards de Test](.specify/memory/testing-standards.md)**

Définit la stratégie de test complète :

- Framework Vitest et couverture minimum 80%
- Organisation des tests (unitaires, intégration, contrats)
- Commandes de test et modes de développement
- Portes qualité et requirements de performance

## 🚀 Démarrage Rapide

```bash
# Cloner et installer
git clone https://github.maif.io/guilde-dev/react-metrics-cli.git
cd react-metrics-cli
npm install

# Développer avec auto-reload
npm run dev

# Build et tests avant commit (obligatoire)
npm run build && npm run test
```

> **Important** : Consultez les [Standards de Code](.specify/memory/code-standards.md) pour les requirements Node.js 22+ et TypeScript 5.3+, et les [Workflow de Contribution](.specify/memory/contribution-workflows.md) pour le processus complet.

## 🔧 Pre-commit Hook (Automatique)

Le projet utilise **Husky** pour gérer les hooks Git automatiquement :

- Les hooks sont installés automatiquement lors du `bun install`
- Le hook pre-commit exécute automatiquement `bun format` puis `bun test`
- Aucune configuration manuelle requise !

Les hooks sont versionnés dans `.husky/` et partagés avec toute l'équipe.

## 📞 Support

Questions ? Créez une issue ou consultez la documentation de référence ci-dessus pour des informations détaillées.

Merci de contribuer à React-Metrics CLI ! 🎉
