import { AnnotationConfig } from '$types/config';
import * as fs from 'fs/promises';
import {
  shouldIgnoreDeclarationWithContext,
  shouldIgnoreFile,
} from './annotation-analyzer';

/**à
 * Lit le contenu d'un fichier
 */
const readFileContent = async (filePath: string): Promise<string> => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Impossible de lire le fichier ${filePath}: ${error}`);
  }
};

/**
 * Crée un helper pour gérer les annotations
 */
export const createAnnotationHelper = (config: AnnotationConfig) => {
  // Cache des fichiers ignorés
  const fileIgnoreCache = new Map<string, boolean>();

  return {
    /**
     * Vérifie si une déclaration doit être ignorée
     */
    shouldIgnoreDeclaration: async (
      filePath: string,
      lineNumber: number,
      _declarationType: string,
    ): Promise<boolean> => {
      // Si les annotations ne sont pas activées, ne pas ignorer
      if (!config.ignoreAnnotations) {
        return false;
      }

      try {
        const content = await readFileContent(filePath);
        const lines = content.split('\n');

        // Vérifier annotation avec contexte
        return shouldIgnoreDeclarationWithContext(
          lines,
          lineNumber,
          config.contextLines || 3,
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        return false;
      }
    },

    /**
     * Vérifie si un fichier entier doit être ignoré
     */
    shouldIgnoreFile: async (filePath: string): Promise<boolean> => {
      // Si les annotations ne sont pas activées, ne pas ignorer
      if (!config.ignoreAnnotations) {
        return false;
      }

      // Vérifier dans le cache d'abord
      if (fileIgnoreCache.has(filePath)) {
        return fileIgnoreCache.get(filePath)!;
      }

      try {
        const content = await readFileContent(filePath);
        const lines = content.split('\n');
        const result = shouldIgnoreFile(lines);

        // Mettre en cache le résultat
        fileIgnoreCache.set(filePath, result);

        return result;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        fileIgnoreCache.set(filePath, false);
        return false;
      }
    },

    /**
     * Vide le cache des fichiers ignorés
     */
    clearCache: (): void => {
      fileIgnoreCache.clear();
    },
  };
};
