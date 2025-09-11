import { Command } from 'commander';
import { BinaryExecutor, ExecutionOptions } from '../core/binary/BinaryExecutor';
import { BinaryManager } from '../core/binary/BinaryManager';
import { Logger } from '../ui/logger/Logger';
import { CommandWrapper } from '../ui/wrapper/CommandWrapper';

export interface AnalyzeCommandOptions {
  path?: string;
  debug?: boolean;
}

export class AnalyzeCommand {
  private binaryManager: BinaryManager;

  constructor() {
    this.binaryManager = new BinaryManager();
  }

  /**
   * Exécute la commande d'analyse
   */
  async execute(options: AnalyzeCommandOptions): Promise<void> {
    try {
      // Télécharger le binaire automatiquement avec la structure simplifiée
      const binaryPath = await this.ensureBinaryAvailable();

      await this.runAnalysis(options, binaryPath);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('ENOENT')) {
          Logger.error('Binaire react-metrics non trouvé');
          Logger.warn('💡 Utilisez "react-metrics download" pour télécharger le binaire');
          Logger.warn('💡 Ou configurez Nexus avec "react-metrics config"');
        } else if (error.message.includes('spawn')) {
          Logger.error("Impossible d'exécuter le binaire");
          Logger.warn("💡 Vérifiez les permissions d'exécution du binaire");
        } else {
          Logger.error(error.message);
        }
      } else {
        Logger.error(`Erreur inattendue: ${error}`);
      }
      process.exit(1);
    }
  }

  /**
   * S'assure que le binaire est disponible et le télécharge si nécessaire
   */
  private async ensureBinaryAvailable(): Promise<string> {
    try {
      // Utiliser la méthode de téléchargement avec la structure simplifiée
      const binaryPath = await this.binaryManager.downloadReactMetricsBinary();

      if (!binaryPath) {
        throw new Error('Impossible de télécharger le binaire react-metrics');
      }

      return binaryPath;
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("Fichier d'identifiants Nexus non trouvé") ||
          error.message.includes('USERNAME ou PASSWORD manquant') ||
          error.message.includes('401') ||
          error.message.includes('403') ||
          error.message.includes('Unauthorized') ||
          error.message.includes("Impossible de configurer l'authentification Nexus")
        ) {
          Logger.error('\nÉchec du téléchargement');
          Logger.warn("💡 Problème d'authentification Nexus");
          Logger.warn('💡 Vos credentials Nexus ne sont pas configurés');
          Logger.warn('💡 La commande aurait dû vous demander vos credentials');
          Logger.warn('💡 Si nécessaire, supprimez le fichier de credentials pour recommencer:');
          Logger.colored('cyan', `   ${require('os').homedir()}/.nexus-utils/.credentials`);
          throw new Error('Authentication Nexus échouée. Configurez vos credentials.');
        } else if (
          error.message.includes('ENOTFOUND') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('getaddrinfo')
        ) {
          Logger.error('\nÉchec du téléchargement');
          Logger.warn('💡 Serveur Nexus inaccessible');
          Logger.warn(
            '💡 Vérifiez votre connexion réseau ou que https://nexus.maif.io est accessible',
          );
          throw new Error('Serveur Nexus inaccessible. Vérifiez votre réseau.');
        }
      }

      Logger.error(`Erreur lors du téléchargement: ${error}`);
      throw error;
    }
  }

  /**
   * Exécute l'analyse avec le binaire
   */
  private async runAnalysis(options: AnalyzeCommandOptions, binaryPath: string): Promise<void> {
    const executor = new BinaryExecutor(binaryPath);

    // Préparer les options d'exécution
    const executionOptions: ExecutionOptions = {
      projectPath: options.path || process.cwd(),
      debug: options.debug || false,
    };

    Logger.info(`🔍 Analyse du projet: ${executionOptions.projectPath}`);

    if (executionOptions.debug) {
      Logger.debug('🐛 Mode debug activé');
    }

    // Exécuter l'analyse
    const result = await executor.execute(executionOptions);

    // Afficher les résultats
    if (!result.success) {
      Logger.error("\nL'analyse a échoué");
      if (result.stderr) {
        Logger.error('Erreurs:');
        Logger.error(result.stderr);
      }
      process.exit(result.exitCode);
    }

    // Afficher les informations de debug si activé
    if (executionOptions.debug) {
      Logger.info(`📝 Logs debug disponibles dans: output/logs/react-metrics-debug.log`);
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
    .option('-d, --debug', 'Activer le mode debug (génère un fichier de log détaillé)')
    .action(async (path: string | undefined, options: { debug?: boolean }) => {
      try {
        const analyzeCommand = new AnalyzeCommand();
        await analyzeCommand.execute({
          path,
          debug: options.debug,
        });
      } catch (error) {
        Logger.error(`Erreur: ${error}`);
        process.exit(1);
      }
    });

  return analyzeCmd;
}
