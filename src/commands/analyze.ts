import { displayAnalysisResults } from '$reporter/display-terminal';
import { DetectorConfig } from '$types/config';
import { Logger } from '$ui/logger/Logger';
import { CommandWrapper } from '$ui/wrapper/CommandWrapper';
import { createAnalyzer } from '@core/create-analyzer';
import { Command } from 'commander';

export interface AnalyzeCommandOptions {
  path?: string;
  debug?: boolean;
}

export class AnalyzeCommand {
  /**
   * Exécute la commande d'analyse
   */
  async execute(options: AnalyzeCommandOptions): Promise<void> {
    try {
      await this.runAnalysis(options);
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(error.message);
      } else {
        Logger.error(`Erreur inattendue: ${error}`);
      }
      process.exit(1);
    }
  }

  /**
   * Exécute l'analyse avec le parser TypeScript natif
   */
  private async runAnalysis(options: AnalyzeCommandOptions): Promise<void> {
    const projectPath = options.path || process.cwd();

    // Configuration du détecteur
    const config: DetectorConfig = {
      fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
      ignoredFolders: ['node_modules', '.git', 'dist', 'build', 'coverage'],
      ignoreAnnotations: true,
      maxGoroutines: 20,
      debug: options.debug,
    };

    if (options.debug) {
      Logger.debug('🐛 Mode debug activé');
    }

    // Créer l'analyseur
    const analyzer = createAnalyzer(config, projectPath);

    // Exécuter l'analyse
    const result = await analyzer.executeCompleteAnalysis();

    // Afficher les résultats
    // Affichage avec la fonction displayAnalysisResults
    Logger.newLine();
    displayAnalysisResults(result);
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
      'Activer le mode debug (génère un fichier de log détaillé)',
    )
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
