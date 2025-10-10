import {
  configExists,
  getConfigPath,
  initConfig,
  loadConfig,
} from '$config/load-config';
import { LogoDisplay } from '$ui/display/LogoDisplay';
import { Logger } from '$ui/logger/Logger';
import { CommandWrapper } from '$ui/wrapper/CommandWrapper';
import { Command } from 'commander';

export interface ConfigCommandOptions {
  info?: boolean;
  init?: boolean;
  open?: boolean;
}

export class ConfigCommand {
  /**
   * Exécute la commande de configuration
   */
  async execute(options: ConfigCommandOptions): Promise<void> {
    try {
      // Afficher le logo compact pour toutes les sous-commandes
      Logger.log(LogoDisplay.compactVersion());
      Logger.newLine();

      if (options.init) {
        await this.initConfiguration();
      } else if (options.info) {
        await this.showInfo();
      } else if (options.open) {
        await this.openConfigFile();
      } else {
        await this.showConfigHelp();
      }
    } catch (error) {
      Logger.error(`# Erreur: ${error}`);
      process.exit(1);
    }
  }

  /**
   * Initialise le fichier de configuration
   */
  private async initConfiguration(): Promise<void> {
    if (configExists()) {
      Logger.warn('Un fichier de configuration existe déjà !');
      Logger.log(`# Fichier: ${getConfigPath()}`);
      Logger.log(
        '# Le fichier existant va être remplacé par les valeurs par défaut',
      );
    }

    initConfig();
    Logger.success(`Fichier de configuration initialisé: ${getConfigPath()}`);
    Logger.log('# Modifiez le fichier directement dans votre éditeur');
  }

  /**
   * Affiche les informations de configuration
   */
  private async showInfo(): Promise<void> {
    Logger.info('Informations de configuration React-Metrics\n');

    if (!configExists()) {
      Logger.warn('Aucun fichier de configuration trouvé');
      Logger.log(
        `💡 Utilisez 'react-metrics config --init' pour créer un fichier de configuration`,
      );
      return;
    }

    const config = loadConfig();
    Logger.files(`Fichier: ${getConfigPath()}\n`);

    Logger.settings('Configuration actuelle:');
    Logger.list(`Extensions de fichiers: ${config.fileExtensions.join(', ')}`);
    Logger.list(`Dossiers ignorés: ${config.ignoredFolders.join(', ')}`);
    if (config.otherIgnoredFolders.length > 0) {
      Logger.list(
        `Autres dossiers ignorés: ${config.otherIgnoredFolders.join(', ')}`,
      );
    }
    Logger.list(
      `Ignorer annotations: ${config.ignoreAnnotations ? 'Oui' : 'Non'}`,
    );

    Logger.report('Rapports:');
    Logger.list(
      `Terminal: ${config.reports.terminal ? 'Activé' : 'Désactivé'}`,
    );
    Logger.list(`HTML: ${config.reports.html ? 'Activé' : 'Désactivé'}`);
    Logger.list(`JSON: ${config.reports.json ? 'Activé' : 'Désactivé'}`);

    Logger.analysis('Analyses:');
    Logger.list(
      `Constantes: ${config.analysis.constants ? 'Activée' : 'Désactivée'}`,
    );
    Logger.list(
      `Fonctions: ${config.analysis.functions ? 'Activée' : 'Désactivée'}`,
    );
    Logger.list(
      `Classes: ${config.analysis.classes ? 'Activée' : 'Désactivée'}`,
    );
    Logger.list(`Props: ${config.analysis.props ? 'Activée' : 'Désactivée'}`);
    Logger.list(
      `Consoles: ${config.analysis.consoles ? 'Activée' : 'Désactivée'}`,
    );
    Logger.list(
      `Definitions: ${config.analysis.definitions ? 'Activée' : 'Désactivée'}`,
    );
    Logger.list(
      `Imports: ${config.analysis.imports ? 'Activée' : 'Désactivée'}`,
    );
    Logger.list(
      `Exports: ${config.analysis.exports ? 'Activée' : 'Désactivée'}`,
    );
    Logger.list(
      `Dépendances: ${config.analysis.dependencies ? 'Activée' : 'Désactivée'}`,
    );
  }

  /**
   * Ouvre le fichier de configuration dans l'éditeur
   */
  private async openConfigFile(): Promise<void> {
    if (!configExists()) {
      Logger.warn('Aucun fichier de configuration trouvé');
      Logger.log('💡 Utilisez --init pour créer un fichier de configuration');
      return;
    }

    const configPath = getConfigPath();
    const { spawn } = await import('child_process');

    try {
      // Tenter d'ouvrir avec VS Code
      const editor = spawn('code', [configPath], {
        detached: true,
        stdio: 'ignore',
      });

      editor.on('error', () => {
        // Si VS Code n'est pas disponible, afficher le chemin
        Logger.info('VS Code non détecté');
        Logger.files(`Fichier de configuration: ${configPath}`);
        Logger.log('💡 Ouvrez ce fichier dans votre éditeur préféré');
      });

      editor.on('spawn', () => {
        Logger.success('Fichier de configuration ouvert dans VS Code');
      });

      editor.unref();
    } catch (error) {
      Logger.files(`Fichier de configuration: ${configPath}`);
      Logger.log('💡 Ouvrez ce fichier dans votre éditeur préféré');
    }
  }

  /**
   * Affiche l'aide de configuration
   */
  private async showConfigHelp(): Promise<void> {
    Logger.settings('Configuration React-Metrics\n');

    if (!configExists()) {
      Logger.warn('Aucun fichier de configuration trouvé');
      Logger.log('💡 Utilisez --init pour créer un fichier de configuration\n');
    } else {
      Logger.success('Fichier de configuration trouvé');
    }

    Logger.files(`Emplacement: ${getConfigPath()}\n`);

    Logger.settings('Options disponibles:');
    Logger.list('--info              Afficher la configuration actuelle');
    Logger.list(
      '--init              Créer/réinitialiser le fichier de configuration',
    );
    Logger.list(
      '--open              Ouvrir le fichier de configuration dans VS Code',
    );
    Logger.newLine();
    Logger.settings('# Modification manuelle:');
    Logger.list('Ouvrez le fichier dans votre éditeur pour le modifier');
    Logger.list('Le fichier sera automatiquement utilisé par react-metrics');

    Logger.newLine();
    Logger.examples('Exemples:');
    Logger.list('react-metrics config --info');
    Logger.list('react-metrics config --init');
    Logger.list('react-metrics config --open');
    Logger.list(`code ${getConfigPath()}`);
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
      'Initialiser le fichier de configuration avec les valeurs par défaut',
    )
    .option('-i, --info', 'Afficher les informations de configuration')
    .option('-o, --open', 'Ouvrir le fichier de configuration dans VS Code')
    .action(
      async (options: { init?: boolean; info?: boolean; open?: boolean }) => {
        try {
          const configCommand = new ConfigCommand();
          await configCommand.execute({
            init: options.init,
            info: options.info,
            open: options.open,
          });
        } catch (error) {
          Logger.error(`Erreur: ${error}`);
          process.exit(1);
        }
      },
    );

  return configCmd;
}
