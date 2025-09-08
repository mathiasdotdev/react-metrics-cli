import { ChildProcess, spawn } from 'child_process';

export interface CLITestResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}

export interface CLITestOptions {
  args?: string[];
  cwd?: string;
  timeout?: number;
  env?: Record<string, string>;
}

/**
 * Utilitaire pour tester la CLI en tant que processus séparé
 */
export class CLITestRunner {
  private cliPath: string;

  constructor(cliPath: string = 'dist/index.js') {
    this.cliPath = cliPath;
  }

  /**
   * Exécute la CLI avec les arguments donnés et retourne le résultat
   */
  async run(options: CLITestOptions = {}): Promise<CLITestResult> {
    const startTime = Date.now();
    const { args = [], cwd = process.cwd(), timeout = 30000, env = {} } = options;

    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      const child: ChildProcess = spawn('node', [this.cliPath, ...args], {
        cwd,
        env: { ...process.env, ...env },
        stdio: 'pipe',
      });

      // Capturer la sortie
      if (child.stdout) {
        child.stdout.on('data', (data: Buffer) => {
          stdout += data.toString();
        });
      }

      if (child.stderr) {
        child.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
      }

      // Gérer la fin du processus
      child.on('close', (code: number | null) => {
        const duration = Date.now() - startTime;
        resolve({
          exitCode: code || 0,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          duration,
        });
      });

      // Gérer les erreurs
      child.on('error', (error: Error) => {
        reject(error);
      });

      // Timeout
      const timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`CLI test timed out after ${timeout}ms`));
      }, timeout);

      child.on('close', () => {
        clearTimeout(timeoutId);
      });
    });
  }

  /**
   * Test l'affichage de l'aide
   */
  async testHelp(): Promise<CLITestResult> {
    return this.run({ args: ['--help'] });
  }

  /**
   * Test l'affichage de la version
   */
  async testVersion(): Promise<CLITestResult> {
    return this.run({ args: ['--version'] });
  }

  /**
   * Test une commande d'analyse
   */
  async testAnalyze(projectPath?: string, options: string[] = []): Promise<CLITestResult> {
    const args = ['analyze'];
    if (projectPath) args.push(projectPath);
    args.push(...options);

    return this.run({ args });
  }

  /**
   * Test une commande de coverage
   */
  async testCoverage(projectPath?: string, options: string[] = []): Promise<CLITestResult> {
    const args = ['coverage'];
    if (projectPath) args.push(projectPath);
    args.push(...options);

    return this.run({ args });
  }

  /**
   * Test une commande de download
   */
  async testDownload(options: string[] = []): Promise<CLITestResult> {
    return this.run({ args: ['download', ...options] });
  }

  /**
   * Test une commande de config
   */
  async testConfig(options: string[] = []): Promise<CLITestResult> {
    return this.run({ args: ['config', ...options] });
  }
}

// Assertions utiles pour les tests CLI
export const expectSuccessfulExit = (result: CLITestResult): void => {
  expect(result.exitCode).toBe(0);
};

export const expectErrorExit = (result: CLITestResult): void => {
  expect(result.exitCode).not.toBe(0);
};

export const expectOutputContains = (result: CLITestResult, text: string): void => {
  expect(result.stdout).toContain(text);
};

export const expectErrorContains = (result: CLITestResult, text: string): void => {
  expect(result.stderr).toContain(text);
};
