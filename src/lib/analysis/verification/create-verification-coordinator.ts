/**
 * Coordinateur de la phase de vérification
 */

import { AnalysisResult, Declaration, isUsed } from '$types/analysis';
import { DetectorConfig } from '$types/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { verifyClasses } from './verifiers/verify-classes';
import { verifyConsoles } from './verifiers/verify-consoles';
import { verifyConstants } from './verifiers/verify-constants';
import { verifyDefinitions } from './verifiers/verify-definitions';
import { verifyDependencies } from './verifiers/verify-dependencies';
import { verifyDeprecated } from './verifiers/verify-deprecated';
import {
  verifyExternalImports,
  verifyLocalUsage,
} from './verifiers/verify-exports';
import { verifyFunctions } from './verifiers/verify-functions';
import { verifyProps } from './verifiers/verify-props';

/**
 * Log une vérification en mode debug
 */
const debugLog = (
  config: DetectorConfig,
  declaration: Declaration,
  used: boolean,
  reason?: string,
) => {
  if (config.debug) {
    const status = used ? '✓ UTILISÉ' : '✗ NON UTILISÉ';
    const reasonText = reason ? ` (${reason})` : '';
    console.log(
      `[DEBUG VERIFICATION] ${status}: ${declaration.type} "${declaration.name}" dans ${path.basename(declaration.location.filePath)}:${declaration.location.line}${reasonText}`,
    );
  }
};

/**
 * Lit plusieurs fichiers en parallèle
 */
const readFiles = async (filePaths: string[]): Promise<Map<string, string>> => {
  const fileContents = new Map<string, string>();

  await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        fileContents.set(filePath, content);
      } catch (error) {
        console.warn(`Avertissement: Impossible de lire ${filePath}:`, error);
      }
    }),
  );

  return fileContents;
};

/**
 * Crée un coordinateur de vérification
 */
export const createVerificationCoordinator = (config: DetectorConfig) => {
  return {
    /**
     * Exécute la vérification sur tous les fichiers
     */
    executeVerification: async (result: AnalysisResult): Promise<void> => {
      if (config.debug) {
        console.log(
          '\n[DEBUG VERIFICATION] === DÉBUT DE LA PHASE DE VÉRIFICATION ===\n',
        );
      }
      // Récupérer tous les fichiers uniques depuis les déclarations
      const filePaths = new Set<string>();
      for (const declaration of result.declarations.values()) {
        filePaths.add(declaration.location.filePath);
      }

      // Lire tous les fichiers en parallèle
      const fileContents = await readFiles(Array.from(filePaths));

      // Vérifier chaque fichier
      for (const [_filePath, content] of fileContents) {
        // Appliquer tous les vérificateurs qui ne nécessitent pas fileContents
        verifyConstants(content, result.declarations);
        verifyFunctions(content, result.declarations);
        verifyClasses(content, result.declarations);
        verifyProps(content, result.declarations);
        verifyConsoles(content, result.declarations);
        verifyDefinitions(content, result.declarations);
        verifyDeprecated(content, result.declarations);
      }

      // Vérificateurs qui nécessitent fileContents (vérification inter-fichiers)
      // Phase 1: Vérifier usage local des exports
      verifyLocalUsage('', result.declarations, fileContents);
      // Phase 2: Vérifier imports externes des exports
      verifyExternalImports('', result.declarations, fileContents);
      verifyDependencies('', result.declarations, fileContents);

      // Log final en mode debug
      if (config.debug) {
        console.log('\n[DEBUG VERIFICATION] === RÉSUMÉ ===');
        const declarations = Array.from(result.declarations.values());
        const used = declarations.filter((d) => isUsed(d)).length;
        const unused = declarations.filter((d) => !isUsed(d)).length;
        console.log(
          `[DEBUG VERIFICATION] Total: ${declarations.length} déclarations`,
        );
        console.log(`[DEBUG VERIFICATION] Utilisées: ${used}`);
        console.log(
          `[DEBUG VERIFICATION] Non utilisées (code mort): ${unused}\n`,
        );

        // Log détaillé de toutes les déclarations
        for (const declaration of declarations) {
          debugLog(config, declaration, isUsed(declaration));
        }
      }
    },
  };
};
