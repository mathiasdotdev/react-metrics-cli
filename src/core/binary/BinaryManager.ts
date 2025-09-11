import NexusUtils from '@maif/nexus-utils';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
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
    // Structure: group = releases/snapshots, repository = react-metrics-artefacts
    const result = await NexusUtils.downloadNexusArtifact({
      groupId: groupId || 'com.maif.react-metrics',
      artifactId,
      repository: repository || 'react-metrics-artefacts',
      format: format || 'maven2',
      artifactVersion,
    });
    return result?.filePath || null;
  }

  /**
   * Récupère la dernière version disponible pour react-metrics
   */
  async getLatestReactMetricsVersion(): Promise<string | null> {
    try {
      // Utiliser directement l'API REST avec la nouvelle structure Maven standard
      const nexusUrl = NEXUS_CONFIG.URL;
      const authHeader = `Basic ${process.env.NEXUS_AUTH_TOKEN || ''}`;

      const response = await fetch(
        `${nexusUrl}/service/rest/v1/search/assets?repository=${NEXUS_CONFIG.REPOSITORY}&group=${NEXUS_CONFIG.GROUP_ID}`,
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

      // Extraire les versions uniques depuis maven2.version
      const versions = new Set<string>();
      artifacts.forEach((artifact: any) => {
        if (
          artifact.maven2 &&
          artifact.maven2.artifactId &&
          artifact.maven2.artifactId.startsWith('react-metrics-') &&
          artifact.maven2.version
        ) {
          const version = artifact.maven2.version;
          // Filtrer seulement les versions valides (x.x.x format)
          if (/^\d+\.\d+\.\d+(?:-\w+)?$/.test(version)) {
            versions.add(version);
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
  async downloadReactMetricsBinary(version?: string): Promise<string | null> {
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
          const latestVersion = await this.getLatestReactMetricsVersion();
          if (latestVersion) {
            targetVersion = latestVersion;
            Logger.success(`📋 Dernière version trouvée: ${targetVersion}`);
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

      // Déterminer le group selon la version (releases pour stable, snapshots pour pre-release)
      const group =
        targetVersion &&
        (targetVersion.includes('-rc') ||
          targetVersion.includes('-beta') ||
          targetVersion.includes('-alpha'))
          ? 'snapshots'
          : 'releases';

      // Déterminer le nom de fichier simplifié selon la plateforme
      const platform = process.platform;
      const arch = process.arch;
      let artifactId: string;

      switch (platform) {
        case 'win32':
          if (arch === 'x64') {
            artifactId = 'windows-amd64';
          } else {
            throw new Error(
              `Architecture Windows non supportée: ${arch}. Seulement AMD64 est supporté.`,
            );
          }
          break;
        case 'darwin':
          artifactId = arch === 'x64' ? 'darwin-amd64' : 'darwin-arm64';
          break;
        case 'linux':
          if (arch === 'x64') {
            artifactId = 'linux-amd64';
          } else {
            throw new Error(
              `Architecture Linux non supportée: ${arch}. Seulement AMD64 est supporté.`,
            );
          }
          break;
        default:
          throw new Error(`Plateforme non supportée: ${platform}-${arch}`);
      }

      Logger.download(`Téléchargement du binaire react-metrics...`);
      Logger.info(`  - Plateforme: ${platform}-${arch}`);
      Logger.info(`  - Group: ${group}`);
      Logger.info(`  - Artifact: ${artifactId}`);
      Logger.info(`  - Version: ${targetVersion}`);

      const result = await NexusUtils.downloadNexusArtifact({
        groupId: NEXUS_CONFIG.GROUP_ID,
        artifactId: `react-metrics-${artifactId}`,
        repository: NEXUS_CONFIG.REPOSITORY,
        format: 'maven2',
        artifactVersion: targetVersion,
      });

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
   * Exemple d'utilisation : manipulation des artefacts Nexus
   */
  async exampleUsage() {
    const groupId = 'fr.maif.digital';
    const artifactId = 'email-bev';
    const artifacts = await this.listNexusArtifactsByGA(groupId, artifactId);
    if (artifacts.length === 0) {
      Logger.warn('Aucun artefact trouvé.');
      return;
    }
    const latest = await this.getLatestArtifactVersion(groupId, artifactId);
    Logger.success(`Dernière version trouvée : ${latest}`);
    const downloadedPath = latest ? await this.downloadArtifact(groupId, artifactId, latest) : null;
    if (downloadedPath) {
      Logger.success(`Artefact téléchargé : ${downloadedPath}`);
    } else {
      Logger.error('Téléchargement impossible.');
    }
  }
}
