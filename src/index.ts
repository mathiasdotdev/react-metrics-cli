#!/usr/bin/env node

import chalk from 'chalk'
import { createAnalyzeCommand } from './commands/Analyze'
import { createConfigCommand } from './commands/Config'
import { createCoverageCommand } from './commands/Coverage'
import { createDownloadCommand } from './commands/Download'
import { CommandWrapper } from './ui/wrapper/CommandWrapper'
import { HelpDisplay } from './ui/display/HelpDisplay'

// Importer la version depuis package.json
const packageJson = require('../package.json')

// Configuration du programme principal
const program = CommandWrapper.createFullCommand()
  .name('react-metrics')
  .description('Analyseur de code mort React')
  .version(packageJson.version)
  .helpOption('-h, --help', 'Afficher cette aide détaillée')
  .helpCommand(false)

// Gestion des erreurs globales
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Erreur inattendue:'), error.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('❌ Promesse rejetée:'), reason)
  process.exit(1)
})

// Vérifier si l'aide générale est demandée
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  // Si c'est juste --help sans commande spécifique, afficher l'aide personnalisée
  if (process.argv.length === 3) {
    HelpDisplay.displayGeneralHelp()
    process.exit(0)
  }
}

// Comportement quand aucune commande n'est fournie
if (process.argv.length === 2) {
  HelpDisplay.displayQuickHelp().then(() => {
    process.exit(0)
  }).catch(() => {
    process.exit(1)
  })
} else {
  // Ajouter toutes les commandes au programme principal
  program.addCommand(createAnalyzeCommand())
  program.addCommand(createCoverageCommand())
  program.addCommand(createDownloadCommand())
  program.addCommand(createConfigCommand())

  // Parser les arguments
  program.parse()
}
