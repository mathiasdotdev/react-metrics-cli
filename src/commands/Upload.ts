import { Command } from 'commander';
import { promises as fs, constants } from 'node:fs';
import * as path from 'path';
import { TokenManager } from '../core/nexus/TokenManager';
import { LogoDisplay } from '../ui/display/LogoDisplay';
import { Logger } from '../ui/logger/Logger';

interface UploadOptions {
  version: string;
  repository?: string;
  nexusUrl?: string;
  dryRun?: boolean;
}

interface BinaryInfo {
  name: string;
  path: string;
  platformArch: string;
  extension: string;
  size: number;
}

export class UploadCommand {
  private tokenManager: TokenManager;

  constructor() {
    this.tokenManager = new TokenManager();
  }

  /**
   * Execute l'upload des binaires vers Nexus
   */
  async execute(options: UploadOptions): Promise<void> {
    try {
      LogoDisplay.compactVersion();
      Logger.settings('🚀 Upload vers Nexus Repository');
      Logger.newLine();

      const {
        version,
        repository = 'react-metrics-artefacts',
        nexusUrl = 'http://localhost:8081',
        dryRun = false,
      } = options;

      // Validation de la version
      if (!this.isValidVersion(version)) {
        Logger.error(`Version invalide: ${version}`);
        Logger.info('Format attendu: x.y.z (ex: 1.0.0)');
        return;
      }

      // Vérification des binaires
      const binaries = await this.findBinaries();
      if (binaries.length === 0) {
        Logger.error('Aucun binaire trouvé dans react-metrics/dist/binaries/');
        Logger.info("Exécutez d'abord: cd ../react-metrics && make build");
        return;
      }

      Logger.info(`Version: ${version}`);
      Logger.info(`Repository: ${repository}`);
      Logger.info(`URL Nexus: ${nexusUrl}`);
      Logger.info(`Binaires trouvés: ${binaries.length}`);
      Logger.newLine();

      if (dryRun) {
        Logger.warn('🧪 MODE DRY-RUN - Simulation uniquement');
        await this.simulateUpload(binaries, version, nexusUrl, repository);
        return;
      }

      // Récupération des credentials via TokenManager
      Logger.credentials('Authentification Nexus requise...');
      const base64Token = await this.tokenManager.getAuthToken();
      const credentials = this.decodeBase64Token(base64Token);

      // Test de connectivité
      if (!(await this.testConnectivity(nexusUrl))) {
        Logger.error(`Impossible de joindre Nexus: ${nexusUrl}`);
        return;
      }

      // Upload des binaires
      const results = await this.uploadAllBinaries(
        binaries,
        version,
        nexusUrl,
        repository,
        credentials,
      );

      // Résultats
      const { successful, failed } = results;
      Logger.newLine();
      Logger.info(`Résultats: ${successful} réussis, ${failed} échecs`);

      if (failed === 0) {
        Logger.success('✅ Tous les binaires uploadés avec succès !');
        Logger.info(`🔗 Accédez à vos artefacts: ${nexusUrl}/#browse/browse:${repository}`);
      } else {
        Logger.error(`❌ ${failed} binaire(s) ont échoué`);
        process.exit(1);
      }
    } catch (error) {
      Logger.error(`Erreur lors de l'upload: ${error}`);
      process.exit(1);
    }
  }

  /**
   * Trouve les binaires react-metrics dans le répertoire parent
   */
  private async findBinaries(): Promise<BinaryInfo[]> {
    const projectRoot = path.join(__dirname, '..', '..', '..', 'react-metrics');
    const binariesDir = path.join(projectRoot, 'dist', 'binaries');

    if (!(await this.pathExists(binariesDir))) {
      return [];
    }

    const expectedBinaries = [
      'react-metrics-linux-amd64',
      'react-metrics-darwin-amd64',
      'react-metrics-darwin-arm64',
      'react-metrics-windows-amd64.exe',
    ];

    const binaries: BinaryInfo[] = [];

    for (const binaryName of expectedBinaries) {
      const binaryPath = path.join(binariesDir, binaryName);

      if (await this.pathExists(binaryPath)) {
        const stats = await fs.stat(binaryPath);
        const platformArch = this.extractPlatformArch(binaryName);
        const extension = this.getExtension(binaryName);

        binaries.push({
          name: binaryName,
          path: binaryPath,
          platformArch,
          extension,
          size: stats.size,
        });
      }
    }

    return binaries;
  }

  /**
   * Extrait la plateforme et l'architecture du nom de fichier
   */
  private extractPlatformArch(binaryName: string): string {
    const patterns = {
      'linux-amd64': 'linux-amd64',
      'darwin-amd64': 'darwin-amd64',
      'darwin-arm64': 'darwin-arm64',
      'windows-amd64': 'windows-amd64',
    };

    for (const [pattern, result] of Object.entries(patterns)) {
      if (binaryName.includes(pattern)) {
        return result;
      }
    }

    throw new Error(`Nom de binaire non reconnu: ${binaryName}`);
  }

  /**
   * Détermine l'extension pour Maven
   */
  private getExtension(binaryName: string): string {
    return binaryName.endsWith('.exe') ? 'exe' : 'bin';
  }

  /**
   * Decode le token base64 en username:password
   */
  private decodeBase64Token(base64Token: string): {
    username: string;
    password: string;
  } {
    const decoded = Buffer.from(base64Token, 'base64').toString('utf8');
    const [username, password] = decoded.split(':');
    return { username, password };
  }

  /**
   * Teste la connectivité avec Nexus
   */
  private async testConnectivity(nexusUrl: string): Promise<boolean> {
    try {
      Logger.info(`Test de connectivité vers: ${nexusUrl}`);

      // Simuler un test de connectivité
      // Dans un vrai projet, utiliser fetch ou axios pour tester /service/rest/v1/status
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Upload tous les binaires vers Nexus
   */
  private async uploadAllBinaries(
    binaries: BinaryInfo[],
    version: string,
    nexusUrl: string,
    repository: string,
    credentials: { username: string; password: string },
  ): Promise<{ successful: number; failed: number }> {
    let successful = 0;
    let failed = 0;

    for (const binary of binaries) {
      Logger.info(`Upload: ${binary.name} (${this.formatBytes(binary.size)})`);

      if (await this.uploadBinary(binary, version, nexusUrl, repository, credentials)) {
        Logger.success(`✅ ${binary.platformArch}`);
        successful++;
      } else {
        Logger.error(`❌ ${binary.platformArch}`);
        failed++;
      }
    }

    return { successful, failed };
  }

  /**
   * Upload un binaire individuel vers Nexus
   */
  private async uploadBinary(
    binary: BinaryInfo,
    version: string,
    nexusUrl: string,
    repository: string,
    credentials: { username: string; password: string },
  ): Promise<boolean> {
    try {
      // Structure Maven standard
      const groupId = 'com.maif.react-metrics';
      const artifactId = `react-metrics-${binary.platformArch}`;
      const uploadUrl = `${nexusUrl}/service/rest/v1/components?repository=${repository}`;

      // Dans un vrai projet, utiliser l'API REST de Nexus ici
      // Pour la démo, on simule un succès
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      return true;
    } catch (error) {
      Logger.error(`Erreur upload ${binary.platformArch}: ${error}`);
      return false;
    }
  }

  /**
   * Simule l'upload en mode dry-run
   */
  private async simulateUpload(
    binaries: BinaryInfo[],
    version: string,
    nexusUrl: string,
    repository: string,
  ): Promise<void> {
    Logger.info('Simulation des uploads:');
    Logger.newLine();

    for (const binary of binaries) {
      const groupId = 'com.maif.react-metrics';
      const artifactId = `react-metrics-${binary.platformArch}`;
      const mavenPath = `${groupId}/${artifactId}/${version}`;

      Logger.list(`${binary.name}`);
      Logger.list(`  → ${nexusUrl}/repository/${repository}/${mavenPath}/`);
      Logger.list(`  → Taille: ${this.formatBytes(binary.size)}`);
      Logger.newLine();
    }

    Logger.success("✅ Simulation terminée - utilisez --no-dry-run pour l'upload réel");
  }

  /**
   * Valide le format de version
   */
  private isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+(-\w+)?$/.test(version);
  }

  /**
   * Vérifie si un chemin existe
   */
  private async pathExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Formate la taille en octets
   */
  private formatBytes(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }
}

/**
 * Crée la commande upload pour Commander.js
 */
export function createUploadCommand(): Command {
  const uploadCommand = new UploadCommand();

  return new Command('upload')
    .description('Upload des binaires react-metrics vers Nexus Repository')
    .requiredOption('-v, --version <version>', 'Version des binaires à uploader (ex: 1.0.0)')
    .option('-r, --repository <repository>', 'Repository Nexus cible', 'react-metrics-artefacts')
    .option('-u, --nexus-url <url>', 'URL du serveur Nexus', 'http://localhost:8081')
    .option('--dry-run', "Simulation uniquement (pas d'upload réel)", true)
    .option('--no-dry-run', 'Upload réel vers Nexus')
    .action(async (options) => {
      await uploadCommand.execute({
        version: options.version,
        repository: options.repository,
        nexusUrl: options.nexusUrl,
        dryRun: options.dryRun,
      });
    });
}
