import chalk from 'chalk';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import NexusUtils from '../../../outil-nexus/dist/lib';
import { downloadNexusArtifact } from '../../../outil-nexus/dist/lib/downloadNexusArtifact';

export class BinaryManager {
  /**
   * Configure l'environnement Nexus selon le mode (local/production)
   */
  private setupNexusEnvironment(useLocal: boolean = false) {
    if (useLocal || process.env.NEXUS_LOCAL === 'true') {
      // Configuration locale
      process.env.NEXUS_URL = 'http://localhost:8081';
      process.env.NEXUS_USERNAME = 'admin';
      process.env.NEXUS_PASSWORD = 'admin123';
      process.env.NEXUS_LOCAL = 'true';
    } else {
      // Configuration production (par défaut)
      process.env.NEXUS_URL = 'https://nexus.maif.io';
      // Les credentials doivent être dans ~/.nexus-utils/.env pour la production
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
    const platformPattern = platform === 'win32' 
      ? (arch === 'x64' ? 'windows-amd64' : 'windows-arm64')
      : platform === 'darwin'
        ? (arch === 'x64' ? 'darwin-amd64' : 'darwin-arm64') 
        : (arch === 'x64' ? 'linux-amd64' : 'linux-arm64');
    
    // Chercher les fichiers qui matchent le pattern version-plateforme.extension
    const matchingFiles = files.filter(file => 
      file.includes(platformPattern) && file.endsWith(extension) && !file.includes('.md5') && !file.includes('.sha')
    );
    
    if (matchingFiles.length > 0) {
      // Retourner le plus récent (tri par version décroissante)
      matchingFiles.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
      const binaryPath = path.join(artifactsDir, matchingFiles[0]);
      console.log(chalk.green(`📁 Binaire local trouvé: ${binaryPath}`));
      return binaryPath;
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
    
    files.forEach(file => {
      // Pattern pour extraire la version: commence par un numéro, suivi de points et numéros
      const versionMatch = file.match(/^(\d+\.\d+\.\d+(?:-\w+)?)/);
      if (versionMatch) {
        versions.add(versionMatch[1]);
      }
    });
    
    if (versions.size === 0) {
      return null;
    }
    
    // Convertir en array et trier par version décroissante
    const sortedVersions = Array.from(versions).sort((a, b) => 
      b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' })
    );
    
    return sortedVersions[0];
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
    const versions = artifacts.map(a => a.version).filter(Boolean);
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
    format?: string
  ): Promise<string | null> {

    this.setupNexusEnvironment();
    
    // Utilise la librairie outil-nexus pour télécharger l'artefact
    // Structure: group = releases/snapshots, repository = react-metrics-artefacts
    const result = await downloadNexusArtifact({
      groupId: groupId || 'com.maif.react-metrics',
      artifactId,
      repository: repository || 'react-metrics-artefacts',
      format: format || 'maven2',
      artifactVersion
    });
    if (result && result.filePath) {
      return result.filePath;
    } else {
      return null;
    }
  }

  /**
   * Récupère la dernière version disponible pour react-metrics
   */
  async getLatestReactMetricsVersion(): Promise<string | null> {
    try {
      // Utiliser directement l'API REST avec la nouvelle structure Maven standard
      const response = await fetch(`${process.env.NEXUS_URL || 'http://localhost:8081'}/service/rest/v1/search/assets?repository=react-metrics-artefacts&group=com.maif.react-metrics`, {
        headers: {
          'Authorization': `Basic ${Buffer.from('admin:admin123').toString('base64')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: any = await response.json();
      const artifacts = data.items || [];
      
      // Extraire les versions uniques depuis maven2.version
      const versions = new Set<string>();
      artifacts.forEach((artifact: any) => {
        if (artifact.maven2 && 
            artifact.maven2.artifactId && 
            artifact.maven2.artifactId.startsWith('react-metrics-') && 
            artifact.maven2.version) {
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
        b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' })
      );
      
      return sortedVersions[0];
    } catch (error) {
      console.error(chalk.yellow(`⚠️ Impossible de récupérer la dernière version: ${error}`));
      return null;
    }
  }

  /**
   * Télécharge un binaire react-metrics avec la structure simplifiée
   */
  async downloadReactMetricsBinary(version?: string): Promise<string | null> {
    try {
      this.setupNexusEnvironment();
      
      // D'abord vérifier si un binaire local existe déjà
      if (!version) {
        const localBinary = this.checkLocalBinary();
        if (localBinary && fs.existsSync(localBinary)) {
          console.log(chalk.green('✅ Utilisation du binaire local existant'));
          return localBinary;
        }
      }
      
      // Si aucune version spécifiée, récupérer la dernière ou utiliser un fallback
      let targetVersion = version;
      if (!targetVersion) {
        console.log(chalk.blue('📦 Binaire non trouvé, téléchargement nécessaire...'));
        console.log(chalk.blue('🔍 Recherche de la dernière version...'));
        
        try {
          const latestVersion = await this.getLatestReactMetricsVersion();
          if (latestVersion) {
            targetVersion = latestVersion;
            console.log(chalk.green(`📋 Dernière version trouvée: ${targetVersion}`));
          }
        } catch (error) {
          console.log(chalk.yellow(`⚠️ Impossible de détecter automatiquement la version: ${error}`));
        }
        
        // Fallback sur la dernière version disponible localement si la détection automatique échoue
        if (!targetVersion) {
          const latestVersion = this.getLatestLocalVersion();
          if (latestVersion) {
            targetVersion = latestVersion;
            console.log(chalk.blue(`📋 Utilisation de la dernière version disponible localement: ${targetVersion}`));
          } else {
            throw new Error('Impossible de déterminer la version à télécharger (aucune version disponible)');
          }
        }
      }

      // Déterminer le group selon la version (releases pour stable, snapshots pour pre-release)
      const group = (targetVersion && (targetVersion.includes('-rc') || targetVersion.includes('-beta') || targetVersion.includes('-alpha'))) 
        ? 'snapshots' 
        : 'releases';
      
      // Déterminer le nom de fichier simplifié selon la plateforme
      const platform = process.platform;
      const arch = process.arch;
      let artifactId: string;
      
      switch (platform) {
        case 'win32':
          artifactId = arch === 'x64' ? 'windows-amd64' : 'windows-arm64';
          break;
        case 'darwin':
          artifactId = arch === 'x64' ? 'darwin-amd64' : 'darwin-arm64';
          break;
        case 'linux':
          artifactId = arch === 'x64' ? 'linux-amd64' : 'linux-arm64';
          break;
        default:
          throw new Error(`Plateforme non supportée: ${platform}-${arch}`);
      }

      console.log(chalk.blue(`⬇️ Téléchargement du binaire react-metrics...`));
      console.log(chalk.blue(`  - Plateforme: ${platform}-${arch}`));
      console.log(chalk.blue(`  - Group: ${group}`));
      console.log(chalk.blue(`  - Artifact: ${artifactId}`));
      console.log(chalk.blue(`  - Version: ${targetVersion}`));

      const result = await downloadNexusArtifact({
        groupId: 'com.maif.react-metrics',
        artifactId: `react-metrics-${artifactId}`, // react-metrics-windows-amd64
        repository: 'react-metrics-artefacts',
        format: 'maven2',
        artifactVersion: targetVersion // Version sémantique (1.8.0)
      });

      if (result && result.filePath) {
        console.log(chalk.green(`✅ Binaire téléchargé: ${result.filePath}`));
        return result.filePath;
      } else {
        console.log(chalk.red('❌ Téléchargement impossible'));
        return null;
      }
    } catch (error) {
      console.log(chalk.red(`❌ Erreur lors du téléchargement: ${error}`));
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
      console.log(chalk.yellow('Aucun artefact trouvé.'));
      return;
    }
    const latest = await this.getLatestArtifactVersion(groupId, artifactId);
    console.log(chalk.green(`Dernière version trouvée : ${latest}`));
    const downloadedPath = latest ? await this.downloadArtifact(groupId, artifactId, latest) : null;
    if (downloadedPath) {
      console.log(chalk.green(`Artefact téléchargé : ${downloadedPath}`));
    } else {
      console.log(chalk.red('Téléchargement impossible.'));
    }
  }
}
