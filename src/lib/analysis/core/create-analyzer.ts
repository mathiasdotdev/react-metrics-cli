/**
 * Analyseur principal qui coordonne la détection et la vérification
 */

import { AnalysisResult, getDeadCode } from '$types/analysis';
import { DetectorConfig } from '$types/config';
import { createDetectionCoordinator } from '@detection/create-detection-coordinator';
import { createVerificationCoordinator } from '@verification/create-verification-coordinator';

/**
 * Crée un analyseur de code mort
 */
export const createAnalyzer = (config: DetectorConfig, projectPath: string) => {
  // Créer les coordinateurs
  const detectionCoordinator = createDetectionCoordinator(config, projectPath);
  const verificationCoordinator = createVerificationCoordinator(config);

  return {
    /**
     * Exécute l'analyse complète (détection + vérification)
     */
    executeCompleteAnalysis: async (): Promise<AnalysisResult> => {
      const startTime = Date.now();

      if (config.debug) {
        console.log("\n[DEBUG] === DÉBUT DE L'ANALYSE ===\n");
      }

      // Phase 1 : Détection des déclarations
      if (config.debug) {
        console.log('[DEBUG] Phase 1: Détection des déclarations...\n');
      }
      const result = await detectionCoordinator.executeDetection();

      // Phase 2 : Vérification des utilisations
      await verificationCoordinator.executeVerification(result);

      // Finaliser : récupérer le code mort
      result.deadCode = getDeadCode(result.declarations);
      result.duration = Date.now() - startTime;

      return result;
    },
  };
};
