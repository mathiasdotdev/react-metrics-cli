import chalk from 'chalk';
import { BinaryExecutor, ExecutionOptions } from '../core/binary/BinaryExecutor';
import { BinaryManager } from '../core/binary/BinaryManager';
import { CommandWrapper } from '../ui/wrapper/CommandWrapper';
import { Command } from 'commander';

export interface CoverageCommandOptions {
  path?: string;
  html?: string;
  local?: boolean;
}

export class CoverageCommand {
  private binaryManager: BinaryManager;

  constructor() {
    this.binaryManager = new BinaryManager();
  }

  /**
   * Exécute la commande de coverage
   */
  async execute(options: CoverageCommandOptions): Promise<void> {
    try {

      // Configurer le mode local si demandé
      if (options.local) {
        process.env.NEXUS_LOCAL = 'true';
        console.log(chalk.blue('🏠 Mode local activé (Nexus sur localhost:8081)'));
      }

      // Télécharger le binaire automatiquement
      const binaryPath = await this.ensureBinaryAvailable();

      await this.runCoverage(options, binaryPath);

    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`❌ ${error.message}`));
      } else {
        console.error(chalk.red(`❌ Erreur inattendue: ${error}`));
      }
      process.exit(1);
    }
  }

  /**
   * S'assure que le binaire est disponible
   */
  private async ensureBinaryAvailable(): Promise<string> {
    try {
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
          console.error(chalk.yellow('💡 Utilisez "react-metrics config" pour configurer'));
          throw new Error('Credentials Nexus manquants. Consultez la documentation.');
        }
      }
      
      console.error(chalk.red(`❌ Erreur lors du téléchargement: ${error}`));
      throw error;
    }
  }

  /**
   * Exécute l'analyse de coverage
   */
  private async runCoverage(options: CoverageCommandOptions, binaryPath: string): Promise<void> {
    const executor = new BinaryExecutor(binaryPath);

    // Préparer les options d'exécution pour coverage
    const executionOptions: ExecutionOptions = {
      command: 'coverage',
      projectPath: options.path || process.cwd(),
      htmlOutput: options.html
    };

    console.log(chalk.blue(`🔍 Analyse de couverture: ${executionOptions.projectPath}`));
    
    if (executionOptions.htmlOutput) {
      console.log(chalk.gray(`📄 Rapport HTML: ${executionOptions.htmlOutput}`));
    }

    // Exécuter l'analyse
    const result = await executor.execute(executionOptions);

    // Afficher les résultats
    if (!result.success) {
      console.error(chalk.red('\n❌ L\'analyse de couverture a échoué'));
      if (result.stderr) {
        console.error(chalk.red('Erreurs:'));
        console.error(result.stderr);
      }
      process.exit(result.exitCode);
    }

    // Afficher les informations sur le rapport HTML
    if (executionOptions.htmlOutput) {
      console.log(chalk.blue(`📊 Rapport HTML généré: ${executionOptions.htmlOutput}`));
    } else {
      console.log(chalk.blue(`📊 Rapport HTML disponible dans: output/coverage/coverage.html`));
    }

    console.log(chalk.green(`\n✅ Analyse de couverture terminée avec succès en ${result.duration}ms`));
  }
}

/**
 * Crée et configure la commande coverage
 */
export function createCoverageCommand(): Command {
  const coverageCmd = CommandWrapper.createCompactCommand()
    .command('coverage [path]')
    .description('Analyse la couverture de tests du projet')
    .option('--html <file>', 'Fichier de sortie HTML pour le rapport de coverage')
    .option('-l, --local', 'Utiliser le serveur Nexus local (localhost:8081)')
    .action(
      async (
        path: string | undefined,
        options: { html?: string; local?: boolean }
      ) => {
        try {
          const coverageCommand = new CoverageCommand()
          await coverageCommand.execute({
            path,
            html: options.html,
            local: options.local,
          })
        } catch (error) {
          console.error(chalk.red(`Erreur: ${error}`))
          process.exit(1)
        }
      }
    )

  return coverageCmd
}