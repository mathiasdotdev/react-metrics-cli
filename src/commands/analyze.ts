import chalk from 'chalk'
import { Command } from 'commander'
import { BinaryExecutor, ExecutionOptions } from '../core/binary/BinaryExecutor'
import { BinaryManager } from '../core/binary/BinaryManager'
import { CommandWrapper } from '../ui/wrapper/CommandWrapper'

export interface AnalyzeCommandOptions {
  path?: string
  debug?: boolean
  local?: boolean
}

export class AnalyzeCommand {
  private binaryManager: BinaryManager

  constructor() {
    this.binaryManager = new BinaryManager()
  }

  /**
   * Exécute la commande d'analyse
   */
  async execute(options: AnalyzeCommandOptions): Promise<void> {
    try {
      // Configurer le mode local si demandé
      if (options.local) {
        process.env.NEXUS_LOCAL = 'true'
        console.log(
          chalk.blue('🏠 Mode local activé (Nexus sur localhost:8081)')
        )
      }

      // Télécharger le binaire automatiquement avec la structure simplifiée
      const binaryPath = await this.ensureBinaryAvailable()

      await this.runAnalysis(options, binaryPath)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('ENOENT')) {
          console.error(chalk.red('❌ Binaire react-metrics non trouvé'))
          console.error(
            chalk.yellow(
              '💡 Utilisez "react-metrics download" pour télécharger le binaire'
            )
          )
          console.error(
            chalk.yellow('💡 Ou configurez Nexus avec "react-metrics config"')
          )
        } else if (error.message.includes('spawn')) {
          console.error(chalk.red("❌ Impossible d'exécuter le binaire"))
          console.error(
            chalk.yellow("💡 Vérifiez les permissions d'exécution du binaire")
          )
        } else {
          console.error(chalk.red(`❌ ${error.message}`))
        }
      } else {
        console.error(chalk.red(`❌ Erreur inattendue: ${error}`))
      }
      process.exit(1)
    }
  }

  /**
   * S'assure que le binaire est disponible et le télécharge si nécessaire
   */
  private async ensureBinaryAvailable(): Promise<string> {
    try {
      // Utiliser la méthode de téléchargement avec la structure simplifiée
      const binaryPath = await this.binaryManager.downloadReactMetricsBinary()

      if (!binaryPath) {
        throw new Error('Impossible de télécharger le binaire react-metrics')
      }

      return binaryPath
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("Fichier d'identifiants Nexus non trouvé") ||
          error.message.includes('USERNAME ou PASSWORD manquant') ||
          error.message.includes('401') ||
          error.message.includes('403') ||
          error.message.includes('Unauthorized') ||
          error.message.includes('Impossible de configurer l\'authentification Nexus')
        ) {
          console.error(chalk.red('\n❌ Échec du téléchargement'))
          console.error(chalk.yellow('💡 Problème d\'authentification Nexus'))
          console.error(chalk.yellow('💡 Vos credentials Nexus ne sont pas configurés'))
          console.error(chalk.yellow('💡 La commande aurait dû vous demander vos credentials'))
          console.error(chalk.yellow('💡 Si nécessaire, supprimez le fichier de credentials pour recommencer:'))
          console.error(chalk.cyan(`   ${require('os').homedir()}/.nexus-utils/.credentials`))
          throw new Error(
            'Authentication Nexus échouée. Configurez vos credentials.'
          )
        } else if (
          error.message.includes('ENOTFOUND') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('getaddrinfo')
        ) {
          console.error(chalk.red('\n❌ Échec du téléchargement'))
          console.error(chalk.yellow('💡 Serveur Nexus inaccessible'))
          console.error(chalk.yellow('💡 Vérifiez votre connexion réseau'))
          console.error(
            chalk.yellow(
              '💡 Si vous testez en local, définissez: NEXUS_LOCAL=true'
            )
          )
          console.error(
            chalk.yellow(
              '💡 Sinon vérifiez que https://nexus.maif.io est accessible'
            )
          )
          throw new Error('Serveur Nexus inaccessible. Vérifiez votre réseau.')
        }
      }

      console.error(chalk.red(`❌ Erreur lors du téléchargement: ${error}`))
      throw error
    }
  }

  /**
   * Exécute l'analyse avec le binaire
   */
  private async runAnalysis(
    options: AnalyzeCommandOptions,
    binaryPath: string
  ): Promise<void> {
    const executor = new BinaryExecutor(binaryPath)

    // Préparer les options d'exécution
    const executionOptions: ExecutionOptions = {
      projectPath: options.path || process.cwd(),
      debug: options.debug || false,
    }

    console.log(
      chalk.blue(`🔍 Analyse du projet: ${executionOptions.projectPath}`)
    )

    if (executionOptions.debug) {
      console.log(chalk.gray('🐛 Mode debug activé'))
    }

    // Exécuter l'analyse
    const result = await executor.execute(executionOptions)

    // Afficher les résultats
    if (!result.success) {
      console.error(chalk.red("\n❌ L'analyse a échoué"))
      if (result.stderr) {
        console.error(chalk.red('Erreurs:'))
        console.error(result.stderr)
      }
      process.exit(result.exitCode)
    }

    // Afficher les informations de debug si activé
    if (executionOptions.debug) {
      console.log(
        chalk.blue(
          `📝 Logs debug disponibles dans: output/logs/react-metrics-debug.log`
        )
      )
    }

  }
}

/**
 * Crée et configure la commande analyze
 */
export function createAnalyzeCommand(): Command {
  const analyzeCmd = CommandWrapper.createCompactCommand()
    .command('analyze [path]')
    .description('Analyse un projet React pour détecter le code mort')
    .option(
      '-d, --debug',
      'Activer le mode debug (génère un fichier de log détaillé)'
    )
    .option('-l, --local', 'Utiliser le serveur Nexus local (localhost:8081)')
    .action(
      async (
        path: string | undefined,
        options: { debug?: boolean; local?: boolean }
      ) => {
        try {
          const analyzeCommand = new AnalyzeCommand()
          await analyzeCommand.execute({
            path,
            debug: options.debug,
            local: options.local,
          })
        } catch (error) {
          console.error(chalk.red(`Erreur: ${error}`))
          process.exit(1)
        }
      }
    )

  return analyzeCmd
}
