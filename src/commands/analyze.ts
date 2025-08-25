import chalk from 'chalk';
import { BinaryExecutor, ExecutionOptions } from '../utils/binaryExecutor';
import { BinaryManager } from '../utils/binaryManager';

export interface AnalyzeCommandOptions {
  path?: string;
  debug?: boolean;
  output?: string;
  local?: boolean;
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
      console.log(chalk.cyan('🚀 React-Metrics - Analyse de code mort\n'));

      // Configurer le mode local si demandé
      if (options.local) {
        process.env.NEXUS_LOCAL = 'true';
        console.log(chalk.blue('🏠 Mode local activé (Nexus sur localhost:8081)'));
      }

      // Télécharger le binaire automatiquement avec la structure simplifiée
      const binaryPath = await this.ensureBinaryAvailable();

      await this.runAnalysis(options, binaryPath);

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('ENOENT')) {
          console.error(chalk.red('❌ Binaire react-metrics non trouvé'));
          console.error(chalk.yellow('💡 Utilisez "react-metrics download" pour télécharger le binaire'));
          console.error(chalk.yellow('💡 Ou configurez Nexus avec "react-metrics config"'));
        } else if (error.message.includes('spawn')) {
          console.error(chalk.red('❌ Impossible d\'exécuter le binaire'));
          console.error(chalk.yellow('💡 Vérifiez les permissions d\'exécution du binaire'));
        } else {
          console.error(chalk.red(`❌ ${error.message}`));
        }
      } else {
        console.error(chalk.red(`❌ Erreur inattendue: ${error}`));
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
        if (error.message.includes('Fichier d\'identifiants Nexus non trouvé') || 
            error.message.includes('USERNAME ou PASSWORD manquant')) {
          console.error(chalk.red('\n❌ Échec du téléchargement'));
          console.error(chalk.yellow('💡 Credentials Nexus non configurés'));
          console.error(chalk.yellow('💡 Créez le fichier: ' + require('os').homedir() + '/.nexus-utils/.env'));
          console.error(chalk.yellow('💡 Avec le contenu:'));
          console.error(chalk.cyan('   NEXUS_USERNAME=votre-token-name'));
          console.error(chalk.cyan('   NEXUS_PASSWORD=votre-token-password'));
          console.error(chalk.yellow('💡 Ou utilisez "react-metrics config" pour configurer'));
          throw new Error('Credentials Nexus manquants. Consultez la documentation.');
        } else if (error.message.includes('ENOTFOUND') || 
                   error.message.includes('ECONNREFUSED') ||
                   error.message.includes('getaddrinfo')) {
          console.error(chalk.red('\n❌ Échec du téléchargement'));
          console.error(chalk.yellow('💡 Serveur Nexus inaccessible'));
          console.error(chalk.yellow('💡 Vérifiez votre connexion réseau'));
          console.error(chalk.yellow('💡 Si vous testez en local, définissez: NEXUS_LOCAL=true'));
          console.error(chalk.yellow('💡 Sinon vérifiez que https://nexus.maif.io est accessible'));
          throw new Error('Serveur Nexus inaccessible. Vérifiez votre réseau.');
        }
      }
      
      console.error(chalk.red(`❌ Erreur lors du téléchargement: ${error}`));
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
      outputFile: options.output
    };

    console.log(chalk.blue(`🔍 Analyse du projet: ${executionOptions.projectPath}`));
    
    if (executionOptions.debug) {
      console.log(chalk.gray('🐛 Mode debug activé'));
    }

    // Exécuter l'analyse
    const result = await executor.execute(executionOptions);

    // Afficher les résultats
    if (!result.success) {
      console.error(chalk.red('\n❌ L\'analyse a échoué'));
      if (result.stderr) {
        console.error(chalk.red('Erreurs:'));
        console.error(result.stderr);
      }
      process.exit(result.exitCode);
    }

    // Afficher les informations de debug si activé
    if (executionOptions.debug && executionOptions.outputFile) {
      console.log(chalk.blue(`📝 Rapport détaillé sauvegardé: ${executionOptions.outputFile}`));
    }

    console.log(chalk.green(`\n✅ Analyse terminée avec succès en ${result.duration}ms`));
  }
}