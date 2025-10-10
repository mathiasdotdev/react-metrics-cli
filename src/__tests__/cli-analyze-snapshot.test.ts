import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { runAndNormalizeCliOutput } from './helpers/snapshotTestHelper';

describe('CLI Analyze Command - Snapshot Test', () => {
  const debugLogPath = path.join(
    process.cwd(),
    'output',
    'logs',
    'react-metrics-debug.log',
  );

  // Nettoyer le fichier de log debug après chaque test si nécessaire
  afterEach(() => {
    if (existsSync(debugLogPath)) {
      try {
        unlinkSync(debugLogPath);
      } catch {
        // Ignorer les erreurs de suppression
      }
    }
  });

  test(
    'la commande analyze produit la sortie attendue sur react-demo',
    async () => {
      // Exécuter la commande CLI et normaliser la sortie
      const normalizedOutput = await runAndNormalizeCliOutput(
        ['analyze', './react-demo'],
        { timeout: 60000 },
        { sortSections: true },
      );

      // Vérifier contre le snapshot
      expect(normalizedOutput).toMatchSnapshot();
    },
    { timeout: 60000 }, // 60 secondes pour laisser le temps à l'analyse complète
  );

  test(
    'la commande analyze avec --debug active le mode debug',
    async () => {
      // Exécuter la commande CLI avec --debug
      const output = await runAndNormalizeCliOutput(
        ['analyze', './react-demo', '--debug'],
        { timeout: 60000 },
        { sortSections: true },
      );

      // Vérifier que le mode debug est activé (présence des logs DEBUG)
      expect(output).toContain('[DEBUG]');
      expect(output).toContain('[DEBUG DETECTION]');
      expect(output).toContain('[DEBUG VERIFICATION]');

      // Vérifier qu'on a toujours les résultats normaux
      expect(output).toContain('📊 Code mort détecté:');
      expect(output).toContain('Total: 87 éléments');
    },
    { timeout: 60000 },
  );
});
