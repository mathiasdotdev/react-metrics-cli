import * as fs from 'fs/promises';
import * as path from 'path';

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
 * Vérifie si un dossier doit être ignoré
 */
const shouldIgnoreFolder = (
  folderName: string,
  ignoredFolders: string[],
): boolean => {
  return ignoredFolders.includes(folderName);
};

/**
 * Vérifie si un fichier a une extension supportée
 */
const hasValidExtension = (filePath: string, extensions: string[]): boolean => {
  const ext = path.extname(filePath);
  return extensions.includes(ext);
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
        if (shouldIgnoreFolder(entry.name, ignoredFolders)) {
          continue;
        }
        await walkDirectory(fullPath, files, extensions, ignoredFolders);
      } else if (entry.isFile()) {
        // Ajouter si l'extension est valide
        if (hasValidExtension(fullPath, extensions)) {
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
export const scanFiles = async (
  rootPath: string,
  extensions: string[] = ['.js', '.jsx', '.ts', '.tsx'],
  ignoredFolders: string[] = DEFAULT_IGNORED_FOLDERS,
): Promise<string[]> => {
  const files: string[] = [];
  await walkDirectory(rootPath, files, extensions, ignoredFolders);
  return files;
};
