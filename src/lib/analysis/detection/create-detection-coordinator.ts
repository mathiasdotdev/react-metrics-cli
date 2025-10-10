/**
 * Coordinateur de la phase de détection
 */

import {
  AnalysisResult,
  getDeclarationKey,
  getDeprecated,
} from '$types/analysis';
import { DetectorConfig } from '$types/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { detectClasses } from './detectors/detect-classes';
import { detectConsoles } from './detectors/detect-consoles';
import { detectConstants } from './detectors/detect-constants';
import { detectDefinitions } from './detectors/detect-definitions';
import { detectDependencies } from './detectors/detect-dependencies';
import { detectDeprecated } from './detectors/detect-deprecated';
import { detectExports } from './detectors/detect-exports';
import { detectFunctions } from './detectors/detect-functions';
import { detectProps } from './detectors/detect-props';

/**
 * Log une déclaration en mode debug
 */
const debugLog = (config: DetectorConfig, message: string) => {
  if (config.debug) {
    console.log(`[DEBUG DETECTION] ${message}`);
  }
};

/**
 * Dossiers à ignorer par défaut
 */
const DEFAULT_IGNORED_FOLDERS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
];

/**
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
 * Parcourt récursivement un répertoire
 */
const walkDirectory = async (
  dirPath: string,
  files: string[],
  extensions: string[],
  ignoredFolders: string[],
): Promise<void> => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Ignorer certains dossiers
        if (ignoredFolders.includes(entry.name)) {
          continue;
        }
        await walkDirectory(fullPath, files, extensions, ignoredFolders);
      } else if (entry.isFile()) {
        // Ajouter si l'extension est valide
        const ext = path.extname(fullPath);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Ignorer les erreurs de lecture de dossier (permissions, etc.)
    console.warn(
      `Avertissement: Impossible de lire le dossier ${dirPath}:`,
      error,
    );
  }
};

/**
 * Trouve tous les fichiers React dans un répertoire
 */
const findReactFiles = async (
  rootPath: string,
  extensions: string[] = ['.js', '.jsx', '.ts', '.tsx'],
  ignoredFolders: string[] = DEFAULT_IGNORED_FOLDERS,
): Promise<string[]> => {
  const files: string[] = [];
  await walkDirectory(rootPath, files, extensions, ignoredFolders);
  return files;
};

/**
 * Crée un résultat d'analyse vide
 */
const createEmptyAnalysisResult = (): AnalysisResult => ({
  declarations: new Map(),
  deadCode: [],
  deprecated: [],
  duration: 0,
});

/**
 * Crée un coordinateur de détection
 */
export const createDetectionCoordinator = (
  config: DetectorConfig,
  projectPath: string,
) => {
  return {
    /**
     * Exécute la détection sur tous les fichiers
     */
    executeDetection: async (): Promise<AnalysisResult> => {
      const result = createEmptyAnalysisResult();

      // Scanner les fichiers React
      const files = await findReactFiles(
        config.projectPath || projectPath || process.cwd(),
        config.fileExtensions || ['.js', '.jsx', '.ts', '.tsx'],
        config.ignoredFolders || DEFAULT_IGNORED_FOLDERS,
      );

      // Analyser chaque fichier en parallèle
      await Promise.all(
        files.map(async (filePath) => {
          try {
            const content = await readFileContent(filePath);
            const lines = content.split('\n');

            // Appliquer tous les détecteurs avec config
            const declarations = [
              ...detectConstants(filePath, lines, config),
              ...detectFunctions(filePath, lines, config),
              ...detectClasses(filePath, lines, config),
              ...detectConsoles(filePath, lines, config),
              ...detectProps(filePath, lines, config),
              ...detectDefinitions(filePath, lines, config),
              ...detectDeprecated(filePath, lines, config), // En premier pour garder le type spécifique
              ...detectExports(filePath, lines, config), // En dernier pour ajouter EXPORT
            ];

            // Ajouter les déclarations au résultat
            for (const declaration of declarations) {
              if (declaration) {
                const key = getDeclarationKey(declaration);

                // Si une déclaration existe déjà, merger les propriétés
                const existing = result.declarations.get(key);
                if (existing) {
                  // Merger : conserver les flags existants + ajouter isDeprecated si nouveau = true
                  const merged = {
                    ...existing,
                    isDeprecated:
                      existing.isDeprecated || declaration.isDeprecated,
                  };
                  result.declarations.set(key, merged);
                } else {
                  result.declarations.set(key, declaration);
                }

                // Log en mode debug
                debugLog(
                  config,
                  `Détecté ${declaration.type}: "${declaration.name}" dans ${path.basename(declaration.location.filePath)}:${declaration.location.line}:${declaration.location.column}`,
                );
              }
            }
          } catch (error) {
            console.warn(
              `Avertissement: Impossible d'analyser ${filePath}:`,
              error,
            );
          }
        }),
      );

      // Analyser les dépendances du package.json
      const dependencies = await detectDependencies(projectPath);
      for (const dependency of dependencies) {
        const key = getDeclarationKey(dependency);
        result.declarations.set(key, dependency);
      }

      // Peupler la liste des déclarations @deprecated
      result.deprecated = getDeprecated(result.declarations);

      return result;
    },
  };
};
