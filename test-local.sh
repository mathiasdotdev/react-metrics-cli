#!/bin/bash

# Script de test pour react-metrics-cli en environnement local
# Usage: ./test-local.sh [version]

# Configuration pour environnement local
export NEXUS_LOCAL=true

# Version à tester (par défaut 1.4.0)
VERSION=${1:-"1.4.0"}

echo "🧪 Test react-metrics-cli en environnement LOCAL"
echo "📍 Nexus: Local (localhost:8081)"
echo "📦 Version: $VERSION"
echo ""

# Vérifier que Nexus local est accessible
echo "🔍 Vérification connectivité Nexus local..."
if ! curl -s --max-time 5 "http://localhost:8081" > /dev/null; then
    echo "❌ Erreur: Nexus local non accessible sur http://localhost:8081"
    echo "💡 Démarrez votre instance Nexus locale"
    exit 1
fi

echo "✅ Nexus local accessible"
echo ""

# Construire le projet
echo "🔨 Build du projet..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build"
    exit 1
fi

echo "✅ Build réussi"
echo ""

# Test 1: Téléchargement avec la structure simplifiée
echo "📥 Test téléchargement react-metrics v$VERSION..."
node dist/index.js download -v "$VERSION"

echo ""
echo "✅ Tests terminés"
echo "💡 Pour utiliser l'environnement de production, supprimez la variable:"
echo "   unset NEXUS_LOCAL"