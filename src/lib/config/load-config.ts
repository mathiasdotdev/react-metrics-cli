import fs from 'node:fs';
import * as os from 'os';
import * as path from 'path';
import { getDefaultConfig, ReactMetricsConfig } from './get-default-config';

const CONFIG_DIR = path.join(os.homedir(), '.react-metrics-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * Vérifie si le fichier de configuration existe
 */
export const configExists = (): boolean => {
  return fs.existsSync(CONFIG_FILE);
};

/**
 * Charge la configuration depuis le fichier
 */
export const loadConfig = (): ReactMetricsConfig => {
  if (!configExists()) {
    return getDefaultConfig();
  }

  try {
    const configData = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(configData) as ReactMetricsConfig;

    // Fusionner avec les valeurs par défaut pour s'assurer que tous les champs sont présents
    return { ...getDefaultConfig(), ...config };
  } catch (error) {
    console.error(
      'Erreur lors du chargement de la configuration, utilisation des valeurs par défaut:',
      error,
    );
    return getDefaultConfig();
  }
};

/**
 * Sauvegarde la configuration dans le fichier
 */
export const saveConfig = (config: ReactMetricsConfig): void => {
  // Créer le répertoire si nécessaire
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  // Écrire le fichier de configuration
  const configData = JSON.stringify(config, null, 2);
  fs.writeFileSync(CONFIG_FILE, configData, 'utf-8');
};

/**
 * Initialise le fichier de configuration avec les valeurs par défaut
 */
export const initConfig = (): void => {
  const defaultConfig = getDefaultConfig();
  saveConfig(defaultConfig);
};

/**
 * Obtient le chemin du fichier de configuration
 */
export const getConfigPath = (): string => {
  return CONFIG_FILE;
};

/**
 * Supprime le fichier de configuration
 */
export const resetConfig = (): void => {
  if (configExists()) {
    fs.unlinkSync(CONFIG_FILE);
  }
};
