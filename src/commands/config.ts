import chalk from 'chalk'
import { Command } from 'commander'
import { BinaryManager } from '../core/binary/BinaryManager'
import { ConfigManager } from '../core/config/ConfigManager'
import { LogoDisplay } from '../ui/display/LogoDisplay'
import { CommandWrapper } from '../ui/wrapper/CommandWrapper'
import { TokenManager } from '../core/nexus/TokenManager'

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
      console.log(LogoDisplay.compactVersion())
      console.log()

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
      console.error(chalk.red(`# Erreur: ${error}`))
      process.exit(1)
    }
  }

  /**
   * Initialise le fichier de configuration
   */
  private async initConfiguration(): Promise<void> {
    if (ConfigManager.configExists()) {
      console.log(chalk.yellow('# Un fichier de configuration existe déjà'))
      console.log(chalk.gray(`# Fichier: ${ConfigManager.getConfigPath()}`))
      console.log(
        chalk.gray(
          '# Le fichier existant va être remplacé par les valeurs par défaut'
        )
      )
    }

    ConfigManager.initConfig()
    console.log(
      chalk.green(
        `# Fichier de configuration initialisé: ${ConfigManager.getConfigPath()}`
      )
    )
    console.log(
      chalk.gray(`# Modifiez le fichier directement dans votre éditeur`)
    )
  }

  /**
   * Affiche les informations de configuration
   */
  private async showInfo(): Promise<void> {
    console.log(chalk.cyan('📋 Informations de configuration React-Metrics\n'))

    if (!ConfigManager.configExists()) {
      console.log(chalk.yellow('⚠️  Aucun fichier de configuration trouvé'))
      console.log(
        chalk.gray(
          `💡 Utilisez 'react-metrics config --init' pour créer un fichier de configuration`
        )
      )
      return
    }

    const config = ConfigManager.loadConfig()
    console.log(chalk.blue(`📁 Fichier: ${ConfigManager.getConfigPath()}\n`))

    console.log(chalk.cyan('🔧 Configuration actuelle:'))
    console.log(`  Extensions de fichiers: ${config.fileExtensions.join(', ')}`)
    console.log(`  Max goroutines: ${config.maxGoroutines}`)
    console.log(`  Dossiers ignorés: ${config.ignoredFolders.join(', ')}`)
    if (config.otherIgnoredFolders.length > 0) {
      console.log(
        `  Autres dossiers ignorés: ${config.otherIgnoredFolders.join(', ')}`
      )
    }
    console.log(
      `  Ignorer annotations: ${config.ignoreAnnotations ? 'Oui' : 'Non'}`
    )

    console.log(chalk.cyan('\n📊 Rapports:'))
    console.log(
      `  Terminal: ${config.reports.terminal ? 'Activé' : 'Désactivé'}`
    )
    console.log(`  HTML: ${config.reports.html ? 'Activé' : 'Désactivé'}`)
    console.log(`  JSON: ${config.reports.json ? 'Activé' : 'Désactivé'}`)

    console.log(chalk.cyan('\n🔍 Analyses:'))
    console.log(
      `  Constantes: ${config.analysis.constants ? 'Activée' : 'Désactivée'}`
    )
    console.log(
      `  Fonctions: ${config.analysis.functions ? 'Activée' : 'Désactivée'}`
    )
    console.log(
      `  Classes: ${config.analysis.classes ? 'Activée' : 'Désactivée'}`
    )
    console.log(`  Props: ${config.analysis.props ? 'Activée' : 'Désactivée'}`)
    console.log(
      `  Consoles: ${config.analysis.consoles ? 'Activée' : 'Désactivée'}`
    )
    console.log(
      `  Imports: ${config.analysis.imports ? 'Activée' : 'Désactivée'}`
    )
    console.log(
      `  Dépendances: ${
        config.analysis.dependencies ? 'Activée' : 'Désactivée'
      }`
    )
  }

  /**
   * Affiche l'aide de configuration
   */
  private async showConfigHelp(): Promise<void> {
    console.log(chalk.cyan('⚙️  Configuration React-Metrics\n'))

    if (!ConfigManager.configExists()) {
      console.log(chalk.yellow('⚠️  Aucun fichier de configuration trouvé'))
      console.log(
        chalk.gray(
          '💡 Utilisez --init pour créer un fichier de configuration\n'
        )
      )
    } else {
      console.log(chalk.green('✅ Fichier de configuration trouvé'))
    }

    console.log(
      chalk.blue(`📁 Emplacement: ${ConfigManager.getConfigPath()}\n`)
    )

    console.log(chalk.cyan('# Options disponibles:'))
    console.log(chalk.gray('  # --info         Afficher la configuration actuelle'))
    console.log(
      chalk.gray(
        '  # --init         Créer/réinitialiser le fichier de configuration'
      )
    )
    console.log(chalk.gray('  # --credentials  Configurer les credentials Nexus'))
    console.log(chalk.gray('  # --reset        Supprimer toute la configuration'))
    console.log()
    console.log(chalk.cyan('# Modification manuelle:'))
    console.log(
      chalk.gray('  # Ouvrez le fichier dans votre éditeur pour le modifier')
    )
    console.log(
      chalk.gray(
        '  # Le fichier sera automatiquement utilisé par react-metrics'
      )
    )
    console.log()
    console.log(chalk.cyan('# Exemples:'))
    console.log(chalk.gray('  # react-metrics config --info'))
    console.log(chalk.gray('  # react-metrics config --init'))
    console.log(chalk.gray('  # react-metrics config --credentials'))
    console.log(chalk.gray(`  # code ${ConfigManager.getConfigPath()}`))
  }

  /**
   * Configure les credentials Nexus
   */
  private async configureCredentials(): Promise<void> {
    console.log(chalk.cyan('🔐 Configuration des credentials Nexus\n'))
    
    try {
      await this.tokenManager.getAuthToken()
      console.log(chalk.green('\n✅ Credentials configurés avec succès'))
    } catch (error) {
      console.error(chalk.red(`❌ Erreur lors de la configuration: ${error}`))
    }
  }

  /**
   * Remet à zéro toute la configuration
   */
  private async resetConfiguration(): Promise<void> {
    console.log(chalk.yellow('🔄 Remise à zéro de la configuration\n'))
    
    try {
      // Reset de la configuration React-Metrics
      if (ConfigManager.configExists()) {
        ConfigManager.resetConfig()
        console.log(chalk.yellow('🗑️  Configuration React-Metrics supprimée'))
      }
      
      // Reset des credentials
      await this.tokenManager.deleteCredentials()
      
      console.log(chalk.green('\n✅ Configuration complètement remise à zéro'))
      console.log(chalk.gray('💡 Utilisez --init pour recréer une configuration par défaut'))
    } catch (error) {
      console.error(chalk.red(`❌ Erreur lors de la remise à zéro: ${error}`))
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
    .option('-c, --credentials', 'Configurer les credentials Nexus (chiffrement AES)')
    .option('-r, --reset', 'Supprimer toute la configuration (React-Metrics + credentials)')
    .action(async (options: { init?: boolean; info?: boolean; credentials?: boolean; reset?: boolean }) => {
      try {
        const configCommand = new ConfigCommand()
        await configCommand.execute({
          init: options.init,
          info: options.info,
          credentials: options.credentials,
          reset: options.reset,
        })
      } catch (error) {
        console.error(chalk.red(`Erreur: ${error}`))
        process.exit(1)
      }
    })

  return configCmd
}
