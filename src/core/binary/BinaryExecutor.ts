import chalk from 'chalk';
import { ChildProcess, spawn } from 'child_process';
import ora from 'ora';
import { TIMEOUTS } from '../config/System';

export interface ExecutionOptions {
  command?: string;
  projectPath?: string;
  debug?: boolean;
  outputFile?: string;
  htmlOutput?: string;
  help?: boolean;
}

export interface ExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}

export class BinaryExecutor {
  private binaryPath: string;

  constructor(binaryPath: string) {
    this.binaryPath = binaryPath;
  }

  /**
   * Exécute le binaire avec les options spécifiées
   */
  async execute(options: ExecutionOptions = {}): Promise<ExecutionResult> {
    const startTime = Date.now();
    const args = this.buildArguments(options);
    
    const spinner = ora({
      text: 'Analyse du code en cours...',
      spinner: 'dots',
      color: 'cyan'
    }).start();
    
    try {
      const result = await this.runBinary(args);
      const duration = Date.now() - startTime;
      
      if (result.success) {
        spinner.stop();
      } else {
        spinner.stopAndPersist({
          symbol: chalk.red('❌'),
          text: chalk.red('Échec de l\'analyse')
        });
      }
      
      return {
        ...result,
        duration
      };
    } catch (error) {
      spinner.stopAndPersist({
        symbol: chalk.red('❌'),
        text: chalk.red('Exécution échouée')
      });
      throw error;
    }
  }

  /**
   * Construit les arguments de ligne de commande
   */
  private buildArguments(options: ExecutionOptions): string[] {
    const args: string[] = [];

    // Commande principale 
    if (options.help) {
      args.push('--help');
    } else {
      args.push(options.command || 'analyser');
    }

    // Chemin du projet
    if (options.projectPath) {
      args.push('--chemin', options.projectPath);
    }

    // Mode debug
    if (options.debug) {
      args.push('--debug');
    }

    // Fichier de sortie pour debug
    if (options.outputFile) {
      args.push('--sortie', options.outputFile);
    }

    // Sortie HTML pour coverage
    if (options.htmlOutput) {
      args.push('--html', options.htmlOutput);
    }

    return args;
  }

  /**
   * Exécute le binaire et capture la sortie
   */
  private async runBinary(args: string[]): Promise<Omit<ExecutionResult, 'duration'>> {
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      const child: ChildProcess = spawn(this.binaryPath, args, {
        stdio: 'pipe',
        timeout: TIMEOUTS.EXECUTION
      });

      // Capturer stdout
      if (child.stdout) {
        child.stdout.on('data', (data: Buffer) => {
          const output = data.toString();
          stdout += output;
          // Afficher en temps réel (sans le spinner)
          process.stdout.write(output);
        });
      }

      // Capturer stderr
      if (child.stderr) {
        child.stderr.on('data', (data: Buffer) => {
          const output = data.toString();
          stderr += output;
          // Afficher les erreurs en temps réel
          process.stderr.write(chalk.red(output));
        });
      }

      // Gérer la fin du processus
      child.on('close', (code: number | null) => {
        const exitCode = code || 0;
        resolve({
          success: exitCode === 0,
          exitCode,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      });

      // Gérer les erreurs
      child.on('error', (error: Error) => {
        if (error.message.includes('ENOENT')) {
          reject(new Error(`Binaire non trouvé: ${this.binaryPath}`));
        } else if (error.message.includes('EACCES')) {
          reject(new Error(`Permission refusée pour exécuter: ${this.binaryPath}`));
        } else {
          reject(new Error(`Impossible d'exécuter le binaire: ${error.message}`));
        }
      });

      // Gérer le timeout
      child.on('timeout', () => {
        child.kill('SIGKILL');
        reject(new Error('Timeout: le binaire met trop de temps à répondre'));
      });
    });
  }

  /**
   * Affiche l'aide du binaire
   */
  async showHelp(): Promise<void> {
    try {
      const result = await this.execute({ help: true });
      
      if (result.success) {
        console.log('\n' + chalk.cyan('📖 Aide React-Metrics:'));
        console.log(result.stdout);
      } else {
        console.error(chalk.red('Impossible d\'afficher l\'aide'));
        if (result.stderr) {
          console.error(result.stderr);
        }
      }
    } catch (error) {
      console.error(chalk.red(`Erreur lors de l'affichage de l'aide: ${error}`));
    }
  }

  /**
   * Teste si le binaire fonctionne
   */
  async testBinary(): Promise<boolean> {
    try {
      const result = await this.execute({ help: true });
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Analyse un projet avec les options par défaut
   */
  async analyzeProject(projectPath: string, debug: boolean = false): Promise<ExecutionResult> {
    const options: ExecutionOptions = {
      projectPath,
      debug
    };

    // Ne pas surcharger outputFile, laisser le binaire utiliser ses valeurs par défaut
    // Le binaire Go utilise "output/logs/react-metrics-debug.log" par défaut

    return this.execute(options);
  }

  /**
   * Formate et affiche les résultats d'exécution
   */
  displayResults(result: ExecutionResult): void {
    console.log('\n' + chalk.cyan('📊 Résultats de l\'analyse:'));
    
    if (result.success) {
      console.log(chalk.green(`✅ Analyse réussie (code de sortie: ${result.exitCode})`));
      console.log(chalk.gray(`⏱️  Durée: ${result.duration}ms`));
      
      if (result.stdout) {
        console.log('\n' + chalk.blue('📋 Sortie:'));
        console.log(result.stdout);
      }
    } else {
      console.log(chalk.red(`❌ Analyse échouée (code de sortie: ${result.exitCode})`));
      
      if (result.stderr) {
        console.log('\n' + chalk.red('🚨 Erreurs:'));
        console.log(result.stderr);
      }
    }
  }
} 