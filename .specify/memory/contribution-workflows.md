# Contribution Workflows

## Git Workflow

### 1. Fork et cloner

```bash
git clone https://github.maif.io/guilde-dev/react-metrics-cli.git
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

## Pull Request Process

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
git commit -m "feat: ajouter nouvelle fonctionnalité d'analyse"
git push origin feature/ma-fonctionnalite
```

### 6. Pull Request

- Décrire clairement les changements
- Référencer les issues liées
- S'assurer que tous les tests passent
- Mettre à jour la version si nécessaire

## Types de Contributions

### Ajouter une nouvelle commande

1. Créer le handler dans `src/commands/`
2. Ajouter les tests unitaires
3. Mettre à jour `src/index.ts`
4. Documenter dans README.md

### Améliorer les fonctionnalités existantes

- Gestion d'erreurs améliorée
- Interface utilisateur plus intuitive
- Performance et optimisations
- Nouveaux détecteurs/verifiers dans `src/lib/`

### Corriger des bugs

- Problèmes d'analyse de code
- Erreurs de configuration
- Incompatibilités de plateforme
