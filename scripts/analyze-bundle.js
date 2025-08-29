const fs = require('fs')
const path = require('path')
const { Logger } = require('../src/ui/logger/Logger')

/**
 * Analyse la taille des fichiers générés dans le répertoire dist
 */
function analyzeBundleSize() {
  const distDir = path.join(__dirname, '..', 'dist')

  if (!fs.existsSync(distDir)) {
    Logger.error(
      "Répertoire dist introuvable. Exécutez d'abord npm run build:prod"
    )
    process.exit(1)
  }

  Logger.files('Analyse de la taille du bundle:\n')

  const files = getAllFiles(distDir)
  let totalSize = 0
  const fileStats = []

  files.forEach((filePath) => {
    const stats = fs.statSync(filePath)
    const relativePath = path.relative(distDir, filePath)
    const size = stats.size
    totalSize += size

    fileStats.push({
      path: relativePath,
      size: size,
      sizeFormatted: formatBytes(size),
    })
  })

  // Trier par taille décroissante
  fileStats.sort((a, b) => b.size - a.size)

  // Afficher les statistiques
  fileStats.forEach((file) => {
    Logger.list(`${file.path.padEnd(30)} ${file.sizeFormatted.padStart(10)}`)
  })

  Logger.files(`\nTaille totale: ${formatBytes(totalSize)}`)
  Logger.files(`Nombre de fichiers: ${fileStats.length}`)

  // Suggestions d'optimisation
  Logger.info("\nSuggestions d'optimisation:")

  if (totalSize > 10 * 1024 * 1024) {
    // Plus de 10MB
    Logger.warn('Bundle très volumineux (>10MB)')
  } else if (totalSize > 5 * 1024 * 1024) {
    // Plus de 5MB
    Logger.warn('Bundle assez volumineux (>5MB)')
  } else {
    Logger.success('Taille du bundle acceptable')
  }

  const jsFiles = fileStats.filter((f) => f.path.endsWith('.js'))
  const avgJsSize = jsFiles.reduce((sum, f) => sum + f.size, 0) / jsFiles.length

  if (avgJsSize > 1024 * 1024) {
    // Plus de 1MB en moyenne
    Logger.info('Considérez le tree-shaking ou la minification')
  }

  const largeFiles = fileStats.filter((f) => f.size > 500 * 1024) // Plus de 500KB
  if (largeFiles.length > 0) {
    Logger.files('Fichiers volumineux à analyser:')
    largeFiles.forEach((f) => {
      Logger.list(`${f.path} (${f.sizeFormatted})`)
    })
  }
}

/**
 * Récupère tous les fichiers d'un répertoire de manière récursive
 */
function getAllFiles(dirPath) {
  const files = []

  function traverseDir(currentPath) {
    const items = fs.readdirSync(currentPath)

    items.forEach((item) => {
      const fullPath = path.join(currentPath, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        traverseDir(fullPath)
      } else {
        files.push(fullPath)
      }
    })
  }

  traverseDir(dirPath)
  return files
}

/**
 * Formate les octets en unités lisibles
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Exécuter l'analyse
analyzeBundleSize()
