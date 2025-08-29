# Guide de Contribution

Merci de votre intérêt pour contribuer à React-Metrics CLI !

## 🔄 Workflow de Contribution

### 1. Fork et cloner

```bash
git clone https://github.com/mathias-hadrien/react-metrics-cli.git
cd react-metrics-cli
```

### 2. Créer une branche

```bash
git checkout -b feature/ma-fonctionnalite
# ou
git checkout -b fix/correction-bug
```

### 3. Développer

```bash
# Installer les dépendances
npm install

# Développer avec auto-reload
npm run dev

# Build et tests
npm run build && npm run test
```

### 4. Validation

```bash
# Tests complets avec couverture
npm run test:coverage

# Tests d'intégration
npm run test:integration

# Build optimisé
npm run build:prod
```

### 5. Commit et Push

```bash
git add .
git commit -m "feat: ajouter nouvelle commande coverage"
git push origin feature/ma-fonctionnalite
```

### 6. Pull Request

- Décrire clairement les changements
- Référencer les issues liées
- S'assurer que tous les tests passent
- Mettre à jour la version si nécessaire

## 🎯 Types de Contributions

### Ajouter une nouvelle commande

1. Créer le handler dans `src/commands/`
2. Ajouter les tests unitaires
3. Mettre à jour `src/index.ts`
4. Documenter dans README.md

### Améliorer les fonctionnalités existantes

- Gestion d'erreurs améliorée
- Interface utilisateur plus intuitive
- Performance et optimisations

### Corriger des bugs

- Problèmes d'authentification Nexus
- Erreurs de téléchargement
- Incompatibilités de plateforme

## 📝 Conventions

### Gestion des versions

Lors de l'incrémentation de version, mettre à jour **3 fichiers** :

- `package.json` - Version principale
- `CHANGELOG.md` - Nouvelle entrée avec modifications
- `src/__tests__/integration/cli-basic.test.ts` - Test d'expectation de version

### Structure des tests

- **Tests unitaires** : `src/**/__tests__/*.test.ts`
- **Tests d'intégration** : `src/__tests__/integration/`
- **Helpers de test** : `src/__tests__/helpers/`

### Standards de code

- TypeScript strict mode
- ESLint + Prettier
- Tests avec Vitest
- Coverage minimum 80%

## 🐳 Tests avec Nexus local

### Configuration Docker

```bash
# Utiliser localhost:8081
export NEXUS_LOCAL=true
react-metrics analyze --local
```

### Variables d'environnement de développement

```bash
# Fichier .env pour tests locaux
NEXUS_LOCAL=true
NEXUS_URL=http://localhost:8081
```

## 📞 Support

Questions ? Créez une issue ou consultez la documentation existante.

Merci de contribuer à React-Metrics CLI ! 🎉
