#!/usr/bin/env node

import chalk from 'chalk'
import { Command } from 'commander'
import { AnalyzeCommand } from './commands/analyze'
import { ConfigCommand } from './commands/config'
import { BinaryManager } from './utils/binaryManager'
import { LogoDisplay } from './utils/logoDisplay'

const program = new Command()

// Configuration du programme principal
program
  .name('react-metrics')
  .description('')
  .version('1.0.0')
  .helpOption('-h, --help', 'Afficher cette aide détaillée')
  .helpCommand(false) // Désactiver la commande help automatique
  .configureHelp({
    formatHelp: () => `
${LogoDisplay.getLogoString()}

${chalk.blue('# Utilisation:')}
  react-metrics [commande] [options]

${chalk.blue('# Commandes disponibles:')}
  analyze [path]     Analyser un projet React (commande par défaut)
  download           Télécharger un binaire Nexus
  config             Gérer la configuration

${chalk.blue("# Exemples d'analyse:")}
  react-metrics                    Analyser le répertoire courant
  react-metrics ./mon-projet       Analyser un projet spécifique
  react-metrics --debug            Analyser avec logs détaillés
  react-metrics --local            Utiliser Nexus local (localhost:8081)

${chalk.blue('# Exemples de configuration:')}
  react-metrics config             Menu interactif
  react-metrics config --info      Afficher les informations
  react-metrics config --reset     Remettre à zéro

${chalk.blue('# Options globales:')}
  -h, --help                       Afficher cette aide
  -V, --version                    Afficher la version

${chalk.gray(
  "Pour plus d'informations, visitez: https://github.com/your-org/react-metrics"
)}
`,
  })

// Commande d'analyse (commande par défaut)
program
  .command('analyze [path]', { isDefault: true })
  .description('Analyse un projet React pour détecter le code mort')
  .option(
    '-d, --debug',
    'Activer le mode debug (génère un fichier de log détaillé)'
  )
  .option('-o, --output <file>', 'Fichier de sortie pour les logs debug')
  .option('-l, --local', 'Utiliser le serveur Nexus local (localhost:8081)')
  .action(async (path: string | undefined, options: any) => {
    try {
      LogoDisplay.display()

      const analyzeCommand = new AnalyzeCommand()
      await analyzeCommand.execute({
        path,
        debug: options.debug,
        output: options.output,
        local: options.local,
      })
    } catch (error) {
      console.error(chalk.red(`Erreur: ${error}`))
      process.exit(1)
    }
  })

// Commande pour télécharger un binaire react-metrics avec la structure simplifiée
program
  .command('download')
  .description(
    'Télécharger un binaire react-metrics compatible pour votre OS/arch'
  )
  .option(
    '-v, --version <version>',
    "Version de l'artefact à télécharger (par défaut: dernière stable)"
  )
  .option(
    '-g, --groupId <groupId>',
    "GroupId Maven de l'artefact (pour usage avancé)"
  )
  .option(
    '-a, --artifactId <artifactId>',
    "ArtifactId Maven de l'artefact (pour usage avancé)"
  )
  .option(
    '-r, --repository <repository>',
    'Repository Nexus (pour usage avancé)'
  )
  .option('-f, --format <format>', 'Format Nexus (pour usage avancé)')
  .option('-l, --local', 'Utiliser le serveur Nexus local (localhost:8081)')
  .action(async (options: any) => {
    try {
      LogoDisplay.displayCompact()

      // Configurer le mode local si demandé
      if (options.local) {
        process.env.NEXUS_LOCAL = 'true';
        console.log(chalk.blue('🏠 Mode local activé (Nexus sur localhost:8081)'));
      }

      const manager = new BinaryManager()

      if (options.groupId || options.artifactId) {
        // Mode avancé avec paramètres personnalisés (ancien comportement)
        const groupId = options.groupId || 'fr.maif.digital'
        const artifactId = options.artifactId || 'react-metrics'
        const version = options.version
        const repository = options.repository || 'react-metrics-artefacts'
        const format = options.format || 'raw'

        const pathDownloaded = await manager.downloadArtifact(
          groupId,
          artifactId,
          version,
          repository,
          format
        )
        if (pathDownloaded) {
          console.log(chalk.green(`Binaire téléchargé : ${pathDownloaded}`))
        } else {
          console.log(chalk.red('Téléchargement impossible.'))
        }
      } else {
        // Mode simplifié avec la structure react-metrics
        const pathDownloaded = await manager.downloadReactMetricsBinary(
          options.version
        )
        if (pathDownloaded) {
          console.log(chalk.green(`Binaire téléchargé : ${pathDownloaded}`))
        } else {
          console.log(chalk.red('Téléchargement impossible.'))
        }
      }
    } catch (error) {
      console.error(chalk.red(`Erreur: ${error}`))
      process.exit(1)
    }
  })

// Commande de configuration
program
  .command('config')
  .description('Afficher la configuration')
  .option('-r, --reset', 'Remettre à zéro la configuration')
  .option('-i, --info', 'Afficher les informations de configuration')
  .action(async (options: any) => {
    try {
      LogoDisplay.displayCompact()

      const configCommand = new ConfigCommand()
      await configCommand.execute({
        reset: options.reset,
        info: options.info,
      })
    } catch (error) {
      console.error(chalk.red(`Erreur: ${error}`))
      process.exit(1)
    }
  })

// Gestion des erreurs globales
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Erreur inattendue:'), error.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('❌ Promesse rejetée:'), reason)
  process.exit(1)
})

// Affichage d'un message si aucune commande n'est fournie
if (process.argv.length === 2) {
  LogoDisplay.displayCompact()

  console.log(chalk.gray('Analyse du répertoire courant en cours...\n'))

  // Exécuter l'analyse par défaut sur le répertoire courant
  const analyzeCommand = new AnalyzeCommand()
  analyzeCommand.execute({ path: process.cwd() }).catch((error) => {
    console.error(chalk.red(`Erreur: ${error}`))
    process.exit(1)
  })
} else {
  // Parser les arguments
  program.parse()
}
