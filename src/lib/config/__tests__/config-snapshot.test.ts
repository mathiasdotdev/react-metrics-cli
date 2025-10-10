import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { existsSync, unlinkSync } from 'node:fs';
import * as path from 'node:path';
import * as os from 'os';
import {
  configExists,
  loadConfig,
  saveConfig,
  initConfig,
  getConfigPath,
  resetConfig,
} from '../load-config';
import { getDefaultConfig } from '../get-default-config';

describe('Config Functions - Snapshot Tests', () => {
  const CONFIG_DIR = path.join(os.homedir(), '.react-metrics-cli');
  const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

  // Nettoyer avant et après chaque test
  beforeEach(() => {
    if (existsSync(CONFIG_FILE)) {
      unlinkSync(CONFIG_FILE);
    }
  });

  afterEach(() => {
    if (existsSync(CONFIG_FILE)) {
      unlinkSync(CONFIG_FILE);
    }
  });

  test('getConfigPath: should return config file path', () => {
    const configPath = getConfigPath();

    // Normaliser le chemin pour le snapshot (remplacer le home directory)
    const normalizedPath = configPath
      .replace(os.homedir(), '<HOME>')
      .replace(/\\/g, '/');

    expect(normalizedPath).toMatchSnapshot();
  });

  test('configExists: should return false when config does not exist', () => {
    const exists = configExists();
    expect(exists).toBe(false);
    expect({ exists }).toMatchSnapshot();
  });

  test('configExists: should return true when config exists', () => {
    // Créer le fichier de config
    initConfig();

    const exists = configExists();
    expect(exists).toBe(true);
    expect({ exists }).toMatchSnapshot();
  });

  test('loadConfig: should return default config when file does not exist', () => {
    const config = loadConfig();

    expect(config).toEqual(getDefaultConfig());
    expect({
      hasConfig: false,
      keys: Object.keys(config).sort(),
    }).toMatchSnapshot();
  });

  test('loadConfig: should load config from file when it exists', () => {
    // Créer le fichier de config
    initConfig();

    const config = loadConfig();

    expect(config).toEqual(getDefaultConfig());
    expect({
      hasConfig: true,
      keys: Object.keys(config).sort(),
    }).toMatchSnapshot();
  });

  test('loadConfig: should merge with defaults when config is partial', () => {
    // Créer un config partiel
    const partialConfig = {
      fileExtensions: ['.tsx', '.jsx'],
    };
    saveConfig(partialConfig as any);

    const config = loadConfig();

    // Vérifier que les valeurs par défaut sont présentes
    expect(config.fileExtensions).toEqual(['.tsx', '.jsx']);
    expect(config.ignoredFolders).toBeDefined();
    expect(config.ignoreAnnotations).toBeDefined();

    expect({
      hasCustomExtensions: true,
      hasIgnoredFolders: config.ignoredFolders !== undefined,
      allKeysPresent: Object.keys(getDefaultConfig()).every(
        (key) => key in config,
      ),
    }).toMatchSnapshot();
  });

  test('saveConfig: should create config file with provided config', () => {
    const customConfig = {
      ...getDefaultConfig(),
      fileExtensions: ['.ts', '.tsx'],
      ignoredFolders: ['node_modules', 'dist', 'custom'],
    };

    saveConfig(customConfig);

    expect(configExists()).toBe(true);

    const loaded = loadConfig();
    expect(loaded.fileExtensions).toEqual(['.ts', '.tsx']);
    expect(loaded.ignoredFolders).toContain('custom');

    expect({
      saved: true,
      canLoad: true,
      customExtensions: loaded.fileExtensions,
      hasCustomFolder: loaded.ignoredFolders.includes('custom'),
    }).toMatchSnapshot();
  });

  test('initConfig: should create default config file', () => {
    expect(configExists()).toBe(false);

    initConfig();

    expect(configExists()).toBe(true);

    const config = loadConfig();
    expect(config).toEqual(getDefaultConfig());

    expect({
      beforeInit: false,
      afterInit: true,
      configMatchesDefaults:
        JSON.stringify(config) === JSON.stringify(getDefaultConfig()),
    }).toMatchSnapshot();
  });

  test('resetConfig: should delete config file if it exists', () => {
    // Créer le fichier
    initConfig();
    expect(configExists()).toBe(true);

    // Supprimer
    resetConfig();
    expect(configExists()).toBe(false);

    expect({
      beforeReset: true,
      afterReset: false,
    }).toMatchSnapshot();
  });

  test('resetConfig: should do nothing if config does not exist', () => {
    expect(configExists()).toBe(false);

    // Appeler reset sur un fichier inexistant
    resetConfig();

    expect(configExists()).toBe(false);

    expect({
      beforeReset: false,
      afterReset: false,
      noError: true,
    }).toMatchSnapshot();
  });

  test('loadConfig: should handle corrupted JSON and return defaults', () => {
    // Créer un fichier de config avec du JSON invalide
    const fs = require('node:fs');
    const os = require('node:os');
    const CONFIG_DIR = path.join(os.homedir(), '.react-metrics-cli');
    const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

    // Créer le répertoire si nécessaire
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    // Écrire du JSON invalide
    fs.writeFileSync(CONFIG_FILE, '{ invalid json', 'utf-8');

    // Capturer les erreurs console
    const originalError = console.error;
    const errors: string[] = [];
    console.error = (...args: any[]) => {
      errors.push(args.map((arg) => String(arg)).join(' '));
    };

    const config = loadConfig();

    // Restaurer console.error
    console.error = originalError;

    // Le fichier est corrompu, on doit recevoir les valeurs par défaut
    expect(config).toEqual(getDefaultConfig());

    // Vérifier qu'une erreur a été loggée
    expect(errors.length).toBeGreaterThan(0);
    expect(
      errors.some((err) =>
        err.includes('Erreur lors du chargement de la configuration'),
      ),
    ).toBe(true);

    expect({
      receivedDefaults: true,
      errorLogged: errors.length > 0,
      hasAllKeys: Object.keys(getDefaultConfig()).every((key) => key in config),
    }).toMatchSnapshot();
  });
});
