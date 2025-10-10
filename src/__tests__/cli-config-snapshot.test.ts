import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { existsSync, unlinkSync } from 'node:fs';
import { getConfigPath } from '$config/load-config';
import { runAndNormalizeCliOutput } from './helpers/snapshotTestHelper';

describe('CLI Config Command - Snapshot Tests', () => {
  const configPath = getConfigPath();

  // Nettoyer le fichier de config avant et après chaque test
  beforeEach(() => {
    if (existsSync(configPath)) {
      unlinkSync(configPath);
    }
  });

  afterEach(() => {
    if (existsSync(configPath)) {
      unlinkSync(configPath);
    }
  });

  test(
    'config --init devrait initialiser le fichier de configuration',
    async () => {
      const normalizedOutput = await runAndNormalizeCliOutput(
        ['config', '--init'],
        { timeout: 30000 },
        { normalizePaths: true, removeAnsiCodes: true },
      );

      expect(normalizedOutput).toMatchSnapshot();
    },
    { timeout: 30000 },
  );

  test(
    'config --info devrait afficher les informations avec fichier existant',
    async () => {
      // Créer d'abord le fichier de config
      await runAndNormalizeCliOutput(['config', '--init'], { timeout: 30000 });

      // Afficher les infos
      const normalizedOutput = await runAndNormalizeCliOutput(
        ['config', '--info'],
        { timeout: 30000 },
        { normalizePaths: true, removeAnsiCodes: true },
      );

      expect(normalizedOutput).toMatchSnapshot();
    },
    { timeout: 30000 },
  );

  test(
    "config --info devrait afficher un message si le fichier n'existe pas",
    async () => {
      const normalizedOutput = await runAndNormalizeCliOutput(
        ['config', '--info'],
        { timeout: 30000 },
        { normalizePaths: true, removeAnsiCodes: true },
      );

      expect(normalizedOutput).toMatchSnapshot();
    },
    { timeout: 30000 },
  );

  test(
    "config (sans option) devrait afficher l'aide de configuration",
    async () => {
      const normalizedOutput = await runAndNormalizeCliOutput(
        ['config'],
        { timeout: 30000 },
        { normalizePaths: true, removeAnsiCodes: true },
      );

      expect(normalizedOutput).toMatchSnapshot();
    },
    { timeout: 30000 },
  );

  test(
    "config --help devrait afficher l'aide de configuration",
    async () => {
      const normalizedOutput = await runAndNormalizeCliOutput(
        ['config', '--help'],
        { timeout: 30000 },
        { normalizePaths: true, removeAnsiCodes: true },
      );

      expect(normalizedOutput).toMatchSnapshot();
    },
    { timeout: 30000 },
  );
});
