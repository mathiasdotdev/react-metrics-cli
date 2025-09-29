import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import NexusUtils from '../../../../outil-nexus/src/lib/index';
import { Logger } from '../../ui/logger/Logger';
import { NEXUS_CONFIG } from '../config/System';
import { TokenManager } from '../nexus/TokenManager';

export class BinaryManager {
  private tokenManager: TokenManager;

  constructor() {
    this.tokenManager = new TokenManager();
  }

  /**
   * Configure l'environnement Nexus selon le mode (local/production)
   */
  private async setupNexusEnvironment(): Promise<void> {
    process.env.NEXUS_URL = NEXUS_CONFIG.URL;
    try {
      const authToken = await this.tokenManager.getAuthToken();
      process.env.NEXUS_AUTH_TOKEN = authToken;
      Logger.credentials('Authentification Nexus configurée');
    } catch (error) {
      throw new Error(`Impossible de configurer l'authentification Nexus: ${error}`);
    }
  }

  /**
   * Vérifie si un binaire local existe déjà dans le cache
   */
  private checkLocalBinary(): string | null {
    const platform = process.platform;
    const arch = process.arch;
    const artifactsDir = path.join(os.homedir(), '.nexus-utils', 'artifacts');

    if (!fs.existsSync(artifactsDir)) {
      return null;
    }

    // Chercher des binaires existants avec le pattern version-plateforme
    const files = fs.readdirSync(artifactsDir);
    let extension = '';

    switch (platform) {
      case 'win32':
        extension = '.exe';
        break;
      default:
        extension = '';
        break;
    }

    // Pattern pour trouver les binaires correspondant à la plateforme
    let platformPattern: string;

    if (platform === 'win32') {
      if (arch === 'x64') {
        platformPattern = 'windows-amd64';
      } else {
        throw new Error(
          `Architecture Windows non supportée: ${arch}. Seulement AMD64 est supporté.`,
        );
      }
    } else if (platform === 'darwin') {
      platformPattern = arch === 'x64' ? 'darwin-amd64' : 'darwin-arm64';
    } else if (platform === 'linux') {
      if (arch === 'x64') {
        platformPattern = 'linux-amd64';
      } else {
        throw new Error(`Architecture Linux non supportée: ${arch}. Seulement AMD64 est supporté.`);
      }
    } else {
      throw new Error(`Plateforme non supportée: ${platform}-${arch}`);
    }

    // Chercher les fichiers qui matchent le pattern version-plateforme.extension
    const matchingFiles = files.filter(
      (file) =>
        file.includes(platformPattern) &&
        file.endsWith(extension) &&
        !file.includes('.md5') &&
        !file.includes('.sha'),
    );

    if (matchingFiles.length > 0) {
      matchingFiles.sort((a, b) =>
        b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }),
      );
      const selected = matchingFiles[0];
      if (selected) {
        const binaryPath = path.join(artifactsDir, selected);
        Logger.files(`Binaire local trouvé: ${binaryPath}`);
        return binaryPath;
      }
    }

    return null;
  }

  /**
   * Récupère la dernière version disponible localement dans le cache
   */
  private getLatestLocalVersion(): string | null {
    const artifactsDir = path.join(os.homedir(), '.nexus-utils', 'artifacts');

    if (!fs.existsSync(artifactsDir)) {
      return null;
    }

    const files = fs.readdirSync(artifactsDir);

    // Extraire les versions des noms de fichiers (pattern: version-plateforme.extension)
    const versions = new Set<string>();

    files.forEach((file) => {
      // Pattern pour extraire la version: commence par un numéro, suivi de points et numéros
      const versionRegex = /^(\d+\.\d+\.\d+(?:-\w+)?)/;
      const versionMatch = versionRegex.exec(file);
      if (versionMatch && versionMatch[1]) {
        versions.add(versionMatch[1]);
      }
    });

    if (versions.size === 0) {
      return null;
    }

    // Convertir en array et trier par version décroissante
    const sortedVersions = Array.from(versions).sort((a, b) =>
      b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }),
    );

    return sortedVersions[0] || null;
  }

  /**
   * Liste les artefacts Nexus pour un groupId/artifactId
   */
  async listNexusArtifactsByGA(groupId: string, artifactId: string): Promise<any[]> {
    this.setupNexusEnvironment();
    const { SearchApi, Configuration } = NexusUtils;
    const api = new SearchApi(new Configuration({}));
    const result = await api.searchAssets({ group: groupId, name: artifactId });
    const artifacts = result.items || [];
    return artifacts;
  }

  /**
   * Retourne la version la plus récente d'un artefact Nexus pour un groupId/artifactId
   */
  async getLatestArtifactVersion(groupId: string, artifactId: string): Promise<string | null> {
    const artifacts = await this.listNexusArtifactsByGA(groupId, artifactId);
    const versions = artifacts.map((a) => a.version).filter(Boolean);
    if (versions.length === 0) return null;
    versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
    return versions[0];
  }

  /**
   * Télécharge un artefact Nexus (le plus récent ou version précise)
   */
  async downloadArtifact(
    groupId: string,
    artifactId: string,
    artifactVersion?: string,
    repository?: string,
    format?: string,
  ): Promise<string | null> {
    await this.setupNexusEnvironment();

    // Utilise la librairie outil-nexus pour télécharger l'artefact
    // Structure Jenkins avec format raw
    const result = await NexusUtils.downloadNexusArtifact({
      groupId: groupId || 'fr.maif.guilde-dev',
      artifactId,
      repository: repository || 'react-metrics-artefacts',
      format: format || 'raw',
      artifactVersion,
    });
    return result?.filePath || null;
  }

  /**
   * Récupère la dernière version disponible pour react-metrics
   * @param snapshots Si true, cherche dans snapshots/, sinon dans releases/
   */
  async getLatestReactMetricsVersion(snapshots = false): Promise<string | null> {
    try {
      // Utiliser directement l'API REST avec la nouvelle structure Jenkins
      const nexusUrl = NEXUS_CONFIG.URL;
      const authHeader = `Basic ${process.env.NEXUS_AUTH_TOKEN || ''}`;
      const type = snapshots ? 'snapshots' : 'releases';

      // Chercher dans le bon répertoire selon le type
      const searchPath = `fr/maif/guilde-dev/react-metrics/${type}/`;
      const response = await fetch(
        `${nexusUrl}/service/rest/v1/search?repository=${NEXUS_CONFIG.REPOSITORY}&q=${searchPath}`,
        {
          headers: {
            Authorization: authHeader,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: any = await response.json();
      const artifacts = data.items || [];

      // Extraire les versions depuis les chemins des artefacts
      const versions = new Set<string>();
      artifacts.forEach((artifact: any) => {
        if (artifact.path) {
          // Chercher le pattern fr/maif/guilde-dev/react-metrics/{type}/{version}/
          const pathPattern = new RegExp(`fr/maif/guilde-dev/react-metrics/${type}/([^/]+)/`);
          const match = artifact.path.match(pathPattern);
          if (match && match[1]) {
            const version = match[1];
            // Filtrer seulement les versions valides et cohérentes avec le type
            if (/^\d+\.\d+\.\d+(?:-\w+)?$/.test(version)) {
              const isVersionSnapshot = version.includes('-SNAPSHOT') ||
                                       version.includes('-rc') ||
                                       version.includes('-beta') ||
                                       version.includes('-alpha');
              // Vérifier que le type correspond à la version
              if ((snapshots && isVersionSnapshot) || (!snapshots && !isVersionSnapshot)) {
                versions.add(version);
              }
            }
          }
        }
      });

      if (versions.size === 0) return null;

      // Convertir en array et trier par version décroissante
      const sortedVersions = Array.from(versions).sort((a, b) =>
        b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }),
      );

      return sortedVersions[0] || null;
    } catch (error) {
      Logger.warn(`Impossible de récupérer la dernière version: ${error}`);
      return null;
    }
  }

  /**
   * Télécharge un binaire react-metrics avec la structure simplifiée
   */
  async downloadReactMetricsBinary(version?: string, snapshots?: boolean): Promise<string | null> {
    try {
      // D'abord vérifier si un binaire local existe déjà AVANT de configurer Nexus
      if (!version) {
        const localBinary = this.checkLocalBinary();
        if (localBinary && fs.existsSync(localBinary)) {
          Logger.success('Utilisation du binaire local existant');
          return localBinary;
        }
      }

      // Seulement si on n'a pas de binaire local, configurer Nexus
      Logger.download('Aucun binaire local trouvé, connexion à Nexus nécessaire...');
      await this.setupNexusEnvironment();

      // Si aucune version spécifiée, récupérer la dernière ou utiliser un fallback
      let targetVersion = version;
      if (!targetVersion) {
        Logger.download('Binaire non trouvé, téléchargement nécessaire...');
        Logger.info('🔍 Recherche de la dernière version...');

        try {
          const latestVersion = await this.getLatestReactMetricsVersion(snapshots);
          if (latestVersion) {
            targetVersion = latestVersion;
            const typeLabel = snapshots ? 'snapshot' : 'release';
            Logger.success(`📋 Dernière version ${typeLabel} trouvée: ${targetVersion}`);
          }
        } catch (error) {
          Logger.warn(`Impossible de détecter automatiquement la version: ${error}`);
        }

        // Fallback sur la dernière version disponible localement si la détection automatique échoue
        if (!targetVersion) {
          const latestVersion = this.getLatestLocalVersion();
          if (latestVersion) {
            targetVersion = latestVersion;
            Logger.info(
              `📋 Utilisation de la dernière version disponible localement: ${targetVersion}`,
            );
          } else {
            throw new Error(
              'Impossible de déterminer la version à télécharger (aucune version disponible)',
            );
          }
        }
      }


      Logger.download(`Téléchargement du binaire react-metrics...`);
      Logger.info(`  - Plateforme: ${process.platform}-${process.arch}`);
      Logger.info(`  - Version: ${targetVersion}`);

      // Structure unifiée Jenkins : fr/maif/guilde-dev/react-metrics/{type}/{version}/{binaire}
      Logger.info(`  - Mode: Structure Jenkins unifiée`);
      const result = await this.downloadFromJenkinsStructure('', targetVersion);

      if (result?.filePath) {
        Logger.success(`Binaire téléchargé: ${result.filePath}`);
        return result.filePath;
      } else {
        Logger.error('Téléchargement impossible');
        return null;
      }
    } catch (error) {
      Logger.error(`Erreur lors du téléchargement: ${error}`);
      throw error; // Re-lancer l'erreur pour qu'elle soit gérée par l'appelant
    }
  }

  /**
   * Télécharge un binaire depuis la structure Jenkins unifiée
   * Structure: fr/maif/guilde-dev/react-metrics/{type}/{version}/{binaire}
   */
  private async downloadFromJenkinsStructure(
    platformArch: string,
    version: string,
  ): Promise<{ filePath: string } | null> {
    try {
      const platform = process.platform;
      const arch = process.arch;

      // Construire le nom de binaire avec version incluse
      let platformName: string;
      let extension = '';

      switch (platform) {
        case 'win32':
          platformName = 'windows-amd64';
          extension = '.exe';
          break;
        case 'darwin':
          platformName = arch === 'x64' ? 'darwin-amd64' : 'darwin-arm64';
          break;
        case 'linux':
          platformName = 'linux-amd64';
          break;
        default:
          throw new Error(`Plateforme non supportée: ${platform}-${arch}`);
      }

      // Nouveau format : react-metrics-{version}-{platform}-{arch}[.exe]
      const binaryName = `react-metrics-${version}-${platformName}${extension}`;

      // Déterminer le type (releases/snapshots) selon la version
      const isSnapshot = version.includes('-SNAPSHOT') ||
                        version.includes('-rc') ||
                        version.includes('-beta') ||
                        version.includes('-alpha');
      const type = isSnapshot ? 'snapshots' : 'releases';

      // Construire l'URL avec nouvelle structure : fr/maif/guilde-dev/react-metrics/{type}/{version}/{binaire}
      const nexusUrl = NEXUS_CONFIG.URL;
      const jenkinsPath = `fr/maif/guilde-dev/react-metrics/${type}/${version}/${binaryName}`;
      const downloadUrl = `${nexusUrl}/repository/${NEXUS_CONFIG.REPOSITORY}/${jenkinsPath}`;

      Logger.info(`  - Type: ${type}`);
      Logger.info(`  - URL: ${downloadUrl}`);

      // Utiliser l'API REST de Nexus pour télécharger
      const authHeader = `Basic ${process.env.NEXUS_AUTH_TOKEN || ''}`;

      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: authHeader,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Créer le répertoire de destination
      const artifactsDir = path.join(os.homedir(), '.nexus-utils', 'artifacts');
      if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
      }

      // Sauvegarder le binaire (le nom contient déjà la version)
      const filePath = path.join(artifactsDir, binaryName);

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));

      // Rendre exécutable sur Unix
      if (platform !== 'win32') {
        fs.chmodSync(filePath, 0o755);
      }

      return { filePath };
    } catch (error) {
      Logger.error(`Erreur téléchargement binaire: ${error}`);
      return null;
    }
  }

  /**
   * Exemple d'utilisation : téléchargement react-metrics
   */
  async exampleUsage() {
    // Télécharger la dernière version release
    const releasePath = await this.downloadReactMetricsBinary();
    if (releasePath) {
      Logger.success(`Version release téléchargée : ${releasePath}`);
    }

    // Télécharger la dernière version snapshot
    const snapshotPath = await this.downloadReactMetricsBinary(undefined, true);
    if (snapshotPath) {
      Logger.success(`Version snapshot téléchargée : ${snapshotPath}`);
    }
  }
}
