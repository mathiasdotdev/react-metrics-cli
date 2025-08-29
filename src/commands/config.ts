import { Command } from 'commander'
import { BinaryManager } from '../core/binary/BinaryManager'
import { ConfigManager } from '../core/config/ConfigManager'
import { TokenManager } from '../core/nexus/TokenManager'
import { LogoDisplay } from '../ui/display/LogoDisplay'
import { Logger } from '../ui/logger/Logger'
import { CommandWrapper } from '../ui/wrapper/CommandWrapper'

export interface ConfigCommandOptions {
  info?: boolean
  init?: boolean
  credentials?: boolean
  reset?: boolean
}

export class ConfigCommand {
  private binaryManager: BinaryManager
  private tokenManager: TokenManager

  constructor() {
    this.binaryManager = new BinaryManager()
    this.tokenManager = new TokenManager()
  }

  /**
   * Exécute la commande de configuration
   */
  async execute(options: ConfigCommandOptions): Promise<void> {
    try {
      // Afficher le logo compact pour toutes les sous-commandes
      Logger.log(LogoDisplay.compactVersion())
      Logger.newLine()

      if (options.init) {
        await this.initConfiguration()
      } else if (options.info) {
        await this.showInfo()
      } else if (options.credentials) {
        await this.configureCredentials()
      } else if (options.reset) {
        await this.resetConfiguration()
      } else {
        await this.showConfigHelp()
      }
    } catch (error) {
      Logger.error(`# Erreur: ${error}`)
      process.exit(1)
    }
  }

  /**
   * Initialise le fichier de configuration
   */
  private async initConfiguration(): Promise<void> {
    if (ConfigManager.configExists()) {
      Logger.warn('Un fichier de configuration existe déjà !')
      Logger.log(`# Fichier: ${ConfigManager.getConfigPath()}`)
      Logger.log(
        '# Le fichier existant va être remplacé par les valeurs par défaut'
      )
    }

    ConfigManager.initConfig()
    Logger.success(
      `Fichier de configuration initialisé: ${ConfigManager.getConfigPath()}`
    )
    Logger.log('# Modifiez le fichier directement dans votre éditeur')
  }

  /**
   * Affiche les informations de configuration
   */
  private async showInfo(): Promise<void> {
    Logger.info('Informations de configuration React-Metrics\n')

    if (!ConfigManager.configExists()) {
      Logger.warn('Aucun fichier de configuration trouvé')
      Logger.log(
        `💡 Utilisez 'react-metrics config --init' pour créer un fichier de configuration`
      )
      return
    }

    const config = ConfigManager.loadConfig()
    Logger.files(`Fichier: ${ConfigManager.getConfigPath()}\n`)

    Logger.settings('Configuration actuelle:')
    Logger.list(`Extensions de fichiers: ${config.fileExtensions.join(', ')}`)
    Logger.list(`Max goroutines: ${config.maxGoroutines}`)
    Logger.list(`Dossiers ignorés: ${config.ignoredFolders.join(', ')}`)
    if (config.otherIgnoredFolders.length > 0) {
      Logger.list(
        `Autres dossiers ignorés: ${config.otherIgnoredFolders.join(', ')}`
      )
    }
    Logger.list(
      `Ignorer annotations: ${config.ignoreAnnotations ? 'Oui' : 'Non'}`
    )

    Logger.report('Rapports:')
    Logger.list(`Terminal: ${config.reports.terminal ? 'Activé' : 'Désactivé'}`)
    Logger.list(`HTML: ${config.reports.html ? 'Activé' : 'Désactivé'}`)
    Logger.list(`JSON: ${config.reports.json ? 'Activé' : 'Désactivé'}`)

    Logger.analysis('Analyses:')
    Logger.list(
      `Constantes: ${config.analysis.constants ? 'Activée' : 'Désactivée'}`
    )
    Logger.list(
      `Fonctions: ${config.analysis.functions ? 'Activée' : 'Désactivée'}`
    )
    Logger.list(
      `Classes: ${config.analysis.classes ? 'Activée' : 'Désactivée'}`
    )
    Logger.list(`Props: ${config.analysis.props ? 'Activée' : 'Désactivée'}`)
    Logger.list(
      `Consoles: ${config.analysis.consoles ? 'Activée' : 'Désactivée'}`
    )
    Logger.list(
      `Imports: ${config.analysis.imports ? 'Activée' : 'Désactivée'}`
    )
    Logger.list(
      `Dépendances: ${config.analysis.dependencies ? 'Activée' : 'Désactivée'}`
    )
  }

  /**
   * Affiche l'aide de configuration
   */
  private async showConfigHelp(): Promise<void> {
    Logger.settings('Configuration React-Metrics\n')

    if (!ConfigManager.configExists()) {
      Logger.warn('Aucun fichier de configuration trouvé')
      Logger.log(
        '💡 Utilisez --init pour créer un fichier de configuration\n'
      )
    } else {
      Logger.success('Fichier de configuration trouvé')
    }

    Logger.files(`Emplacement: ${ConfigManager.getConfigPath()}\n`)

    Logger.settings('Options disponibles:')
    Logger.list(
      '--info         Afficher la configuration actuelle'
    )
    Logger.list(
      '--init         Créer/réinitialiser le fichier de configuration'
    )
    Logger.list('--credentials  Configurer les credentials Nexus')
    Logger.list(
      '--reset        Supprimer toute la configuration'
    )
    Logger.newLine()
    Logger.settings('# Modification manuelle:')
    Logger.list(
      'Ouvrez le fichier dans votre éditeur pour le modifier'
    )
    Logger.list(
      'Le fichier sera automatiquement utilisé par react-metrics'
    )

    Logger.newLine()
    Logger.examples('Exemples:')
    Logger.list('react-metrics config --info')
    Logger.list('react-metrics config --init')
    Logger.list('react-metrics config --credentials')
    Logger.list(`code ${ConfigManager.getConfigPath()}`)
  }

  /**
   * Configure les credentials Nexus
   */
  private async configureCredentials(): Promise<void> {
    Logger.settings('Configuration des credentials Nexus\n')

    try {
      await this.tokenManager.getAuthToken()
      Logger.success('Credentials configurés avec succès')
    } catch (error) {
      Logger.error(`Erreur lors de la configuration: ${error}`)
    }
  }

  /**
   * Remet à zéro toute la configuration
   */
  private async resetConfiguration(): Promise<void> {
    Logger.cleanup('Remise à zéro de la configuration\n')

    try {
      // Reset de la configuration React-Metrics
      if (ConfigManager.configExists()) {
        ConfigManager.resetConfig()
        Logger.cleanup('Configuration React-Metrics supprimée')
      }

      // Reset des credentials
      await this.tokenManager.deleteCredentials()

      Logger.success('Configuration complètement remise à zéro')
      Logger.log('Utilisez --init pour recréer une configuration par défaut')
    } catch (error) {
      Logger.error(`Erreur lors de la remise à zéro: ${error}`)
    }
  }
}

/**
 * Crée et configure la commande config
 */
export function createConfigCommand(): Command {
  const configCmd = CommandWrapper.createCompactCommand()
    .command('config')
    .description('Gérer la configuration React-Metrics')
    .option(
      '--init',
      'Initialiser le fichier de configuration avec les valeurs par défaut'
    )
    .option('-i, --info', 'Afficher les informations de configuration')
    .option(
      '-c, --credentials',
      'Configurer les credentials Nexus (chiffrement AES)'
    )
    .option(
      '-r, --reset',
      'Supprimer toute la configuration (React-Metrics + credentials)'
    )
    .action(
      async (options: {
        init?: boolean
        info?: boolean
        credentials?: boolean
        reset?: boolean
      }) => {
        try {
          const configCommand = new ConfigCommand()
          await configCommand.execute({
            init: options.init,
            info: options.info,
            credentials: options.credentials,
            reset: options.reset,
          })
        } catch (error) {
          Logger.error(`Erreur: ${error}`)
          process.exit(1)
        }
      }
    )

  return configCmd
}
