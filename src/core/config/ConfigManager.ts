import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Logger } from '../../ui/logger/Logger';

export interface ReactMetricsConfig {
  fileExtensions: string[];
  maxGoroutines: number;
  ignoredFolders: string[];
  otherIgnoredFolders: string[];
  ignoreAnnotations: boolean;
  modeDebug: boolean;
  reports: {
    terminal: boolean;
    html: boolean;
    json: boolean;
  };
  analysis: {
    constants: boolean;
    functions: boolean;
    classes: boolean;
    props: boolean;
    consoles: boolean;
    imports: boolean;
    dependencies: boolean;
  };
}

export class ConfigManager {
  private static readonly CONFIG_DIR = path.join(os.homedir(), '.nexus-utils');
  private static readonly CONFIG_FILE = path.join(ConfigManager.CONFIG_DIR, 'react-metrics.json');

  /**
   * Obtient la configuration par défaut
   */
  static getDefaultConfig(): ReactMetricsConfig {
    return {
      fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
      maxGoroutines: 20,
      ignoredFolders: ['node_modules', '.git', 'dist', 'build', 'coverage'],
      otherIgnoredFolders: [],
      ignoreAnnotations: true,
      modeDebug: false,
      reports: {
        terminal: true,
        html: false,
        json: false,
      },
      analysis: {
        constants: true,
        functions: true,
        classes: true,
        props: true,
        consoles: true,
        imports: true,
        dependencies: false,
      },
    };
  }

  /**
   * Vérifie si le fichier de configuration existe
   */
  static configExists(): boolean {
    return fs.existsSync(ConfigManager.CONFIG_FILE);
  }

  /**
   * Charge la configuration depuis le fichier
   */
  static loadConfig(): ReactMetricsConfig {
    if (!ConfigManager.configExists()) {
      return ConfigManager.getDefaultConfig();
    }

    try {
      const configData = fs.readFileSync(ConfigManager.CONFIG_FILE, 'utf-8');
      const config = JSON.parse(configData) as ReactMetricsConfig;

      // Fusionner avec les valeurs par défaut pour s'assurer que tous les champs sont présents
      return { ...ConfigManager.getDefaultConfig(), ...config };
    } catch (error) {
      Logger.error(
        'Erreur lors du chargement de la configuration, utilisation des valeurs par défaut:',
        error,
      );
      return ConfigManager.getDefaultConfig();
    }
  }

  /**
   * Sauvegarde la configuration dans le fichier
   */
  static saveConfig(config: ReactMetricsConfig): void {
    // Créer le répertoire si nécessaire
    if (!fs.existsSync(ConfigManager.CONFIG_DIR)) {
      fs.mkdirSync(ConfigManager.CONFIG_DIR, { recursive: true });
    }

    // Écrire le fichier de configuration
    const configData = JSON.stringify(config, null, 2);
    fs.writeFileSync(ConfigManager.CONFIG_FILE, configData, 'utf-8');
  }

  /**
   * Initialise le fichier de configuration avec les valeurs par défaut
   */
  static initConfig(): void {
    const defaultConfig = ConfigManager.getDefaultConfig();
    ConfigManager.saveConfig(defaultConfig);
  }

  /**
   * Obtient le chemin du fichier de configuration
   */
  static getConfigPath(): string {
    return ConfigManager.CONFIG_FILE;
  }

  /**
   * Supprime le fichier de configuration
   */
  static resetConfig(): void {
    if (ConfigManager.configExists()) {
      fs.unlinkSync(ConfigManager.CONFIG_FILE);
    }
  }
}
