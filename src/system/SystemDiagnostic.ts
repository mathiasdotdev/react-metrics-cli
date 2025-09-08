import chalk from 'chalk';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ConfigManager } from '../core/config/ConfigManager';
import { TokenManager } from '../core/nexus/TokenManager';

export interface SystemStatus {
  nexusConfigured: boolean;
  binaryAvailable: boolean;
  binaryVersion?: string;
  nexusConfigPath: string;
  reactMetricsConfigured: boolean;
  reactMetricsConfigPath: string;
}

export class SystemDiagnostic {
  /**
   * Effectue un diagnostic complet du système
   */
  static async checkSystemStatus(): Promise<SystemStatus> {
    const tokenManager = new TokenManager();
    const nexusConfigured = await this.checkNexusCredentials(tokenManager);
    const { available: binaryAvailable, version: binaryVersion } = await this.checkBinaryStatus();

    const reactMetricsConfigPath = ConfigManager.getConfigPath();
    const reactMetricsConfigured = ConfigManager.configExists();

    return {
      nexusConfigured,
      binaryAvailable,
      binaryVersion,
      nexusConfigPath: path.join(os.homedir(), '.nexus-utils', '.credentials'),
      reactMetricsConfigured,
      reactMetricsConfigPath,
    };
  }

  /**
   * Vérifie si les credentials Nexus sont configurés
   */
  private static async checkNexusCredentials(tokenManager: TokenManager): Promise<boolean> {
    try {
      // Vérifier si le fichier de credentials chiffrés existe
      const credentialsPath = path.join(os.homedir(), '.nexus-utils', '.credentials');
      return fs.existsSync(credentialsPath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Vérifie si un binaire local est disponible et récupère sa version
   */
  private static async checkBinaryStatus(): Promise<{ available: boolean; version?: string }> {
    const possiblePaths = this.getPossibleBinaryPaths();

    for (const pathPattern of possiblePaths) {
      try {
        // Si le chemin contient un wildcard, on doit chercher dans le répertoire
        if (pathPattern.includes('*')) {
          const dirPath = path.dirname(pathPattern);
          const filePattern = path.basename(pathPattern);

          if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            const regex = new RegExp(filePattern.replace(/\*/g, '.*'));

            const matchingFile = files.find((file) => regex.test(file));
            if (matchingFile) {
              const fullPath = path.join(dirPath, matchingFile);
              const version = this.extractVersionFromPath(fullPath);
              return { available: true, version };
            }
          }
        } else {
          // Chemin exact
          if (fs.existsSync(pathPattern)) {
            const version = this.extractVersionFromPath(pathPattern);
            return { available: true, version };
          }
        }
      } catch (error) {
        continue;
      }
    }

    return { available: false };
  }

  /**
   * Retourne les chemins possibles pour les binaires selon l'OS
   */
  private static getPossibleBinaryPaths(): string[] {
    const platform = os.platform();
    const arch = os.arch();
    const cacheDir = path.join(os.homedir(), '.nexus-utils', 'artifacts');

    const paths: string[] = [];

    // Ajouter les chemins du cache utilisateur (priorité)
    if (platform === 'win32') {
      paths.push(
        path.join(cacheDir, 'react-metrics-windows-amd64-*.exe'),
        path.join(cacheDir, 'react-metrics-windows-*.exe'),
      );
    } else {
      const platformName = platform === 'darwin' ? 'darwin' : 'linux';
      const archName = arch === 'arm64' ? 'arm64' : 'amd64';
      paths.push(
        path.join(cacheDir, `react-metrics-${platformName}-${archName}-*`),
        path.join(cacheDir, `react-metrics-${platformName}-*`),
      );
    }

    // Ajouter les chemins système (fallback)
    if (platform === 'win32') {
      paths.push(
        'C:\\react-metrics\\react-metrics-windows-amd64.exe',
        'C:\\react-metrics\\react-metrics.exe',
      );
    } else {
      const binaryName =
        platform === 'darwin'
          ? `react-metrics-darwin-${arch === 'arm64' ? 'arm64' : 'amd64'}`
          : `react-metrics-linux-${arch === 'arm64' ? 'arm64' : 'amd64'}`;

      paths.push(
        `/usr/local/react-metrics/${binaryName}`,
        `/usr/local/react-metrics/react-metrics`,
      );
    }

    return paths;
  }

  /**
   * Extrait la version depuis le chemin du binaire
   */
  private static extractVersionFromPath(binaryPath: string): string | undefined {
    const fileName = path.basename(binaryPath);

    // Essayer d'extraire la version depuis le nom du fichier
    // Pattern: react-metrics-platform-arch-VERSION.exe ou react-metrics-platform-VERSION
    const fileVersionMatch = fileName.match(/react-metrics-\w+-(?:\w+-)?(\d+\.\d+\.\d+)/);
    if (fileVersionMatch) {
      return fileVersionMatch[1];
    }

    // Essayer d'extraire la version depuis le nom du répertoire parent
    const parentDir = path.dirname(binaryPath);
    const dirVersionMatch = parentDir.match(/(\d+\.\d+\.\d+)/);
    if (dirVersionMatch) {
      return dirVersionMatch[1];
    }

    // Fallback: version inconnue mais binaire présent
    return 'présent';
  }

  /**
   * Génère un message d'aide contextuel selon l'état du système
   */
  static generateContextualHelp(status: SystemStatus): string {
    let message = '';

    // En-tête état de la configuration
    message += chalk.blue('État de la configuration:\n');

    // État des credentials Nexus
    if (status.nexusConfigured) {
      message += chalk.green('🟢 Credentials Nexus: Configurés\n');
    } else {
      message += chalk.red('🔴 Credentials Nexus: Non configurés\n');
    }

    // État du binaire
    if (status.binaryAvailable) {
      const versionText = status.binaryVersion ? ` v${status.binaryVersion}` : '';
      message += chalk.green(`🟢 Binaire local:${versionText} (prêt)\n`);
    } else {
      message += chalk.red('🔴 Binaire local: Non trouvé\n');
    }

    // État de la configuration React-Metrics
    if (status.reactMetricsConfigured) {
      message += chalk.green('🟢 Configuration React-Metrics: Configurée\n');
    } else {
      message += chalk.yellow('🟡 Configuration React-Metrics: Non trouvée (optionnelle)\n');
    }

    message += '\n';

    // Messages d'aide contextuels - afficher tous les problèmes
    if (!status.nexusConfigured) {
      message += chalk.yellow('💡 Configurez vos credentials Nexus:\n');
      message += chalk.cyan(
        '   Les credentials seront demandés automatiquement lors de la première utilisation\n',
      );
      message += chalk.cyan('   Ils seront chiffrés et stockés de manière sécurisée\n');
      message +=
        chalk.cyan('   Lancez: ') +
        chalk.white('react-metrics analyze') +
        chalk.cyan(' ou ') +
        chalk.white('react-metrics download\n\n');

      // Ajouter une ligne vide si il y a d'autres problèmes à afficher
      if (!status.binaryAvailable || !status.reactMetricsConfigured) {
        message += '\n';
      }
    }

    if (!status.binaryAvailable) {
      message +=
        chalk.yellow('💡 Téléchargez le binaire avec: ') + chalk.white('react-metrics download\n');

      if (!status.reactMetricsConfigured) {
        message += '\n';
      }
    }

    if (!status.reactMetricsConfigured) {
      message +=
        chalk.yellow('💡 Créez une configuration personnalisée avec: ') +
        chalk.white('react-metrics config --init\n');
      message += chalk.gray('   (optionnel: utilise les valeurs par défaut sinon)\n\n');
    }

    // Toujours terminer par l'aide générale
    message += chalk.blue('Pour voir toutes les commandes: ') + chalk.white('react-metrics --help');

    return message;
  }
}
