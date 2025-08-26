import chalk from 'chalk'
import { BinaryManager } from '../core/binary/BinaryManager'
import { CommandWrapper } from '../ui/wrapper/CommandWrapper'
import { Command } from 'commander'

export interface DownloadCommandOptions {
  version?: string
  groupId?: string
  artifactId?: string
  repository?: string
  format?: string
  local?: boolean
}

export class DownloadCommand {
  private binaryManager: BinaryManager

  constructor() {
    this.binaryManager = new BinaryManager()
  }

  /**
   * Exécute la commande de téléchargement
   */
  async execute(options: DownloadCommandOptions): Promise<void> {
    try {
      // Configurer le mode local si demandé
      if (options.local) {
        process.env.NEXUS_LOCAL = 'true'
        console.log(
          chalk.blue('🏠 Mode local activé (Nexus sur localhost:8081)')
        )
      }

      if (options.groupId || options.artifactId) {
        // Mode avancé avec paramètres personnalisés (ancien comportement)
        const groupId = options.groupId || 'fr.maif.digital'
        const artifactId = options.artifactId || 'react-metrics'
        const version = options.version
        const repository = options.repository || 'react-metrics-artefacts'
        const format = options.format || 'raw'

        const pathDownloaded = await this.binaryManager.downloadArtifact(
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
        const pathDownloaded = await this.binaryManager.downloadReactMetricsBinary(
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
  }
}

/**
 * Crée et configure la commande download
 */
export function createDownloadCommand(): Command {
  const downloadCmd = CommandWrapper.createCompactCommand()
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
    .action(async (options: DownloadCommandOptions) => {
      const downloadCommand = new DownloadCommand()
      await downloadCommand.execute(options)
    })

  return downloadCmd
}