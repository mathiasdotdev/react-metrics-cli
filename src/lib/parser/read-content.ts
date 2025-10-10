import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Lit le contenu d'un fichier
 */
export const readFile = async (filePath: string): Promise<string> => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Impossible de lire le fichier ${filePath}: ${error}`);
  }
};

/**
 * Écrit du contenu dans un fichier
 * Crée automatiquement les dossiers parents si nécessaire
 */
export const writeFile = async (
  filePath: string,
  content: string,
): Promise<void> => {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Impossible d'écrire le fichier ${filePath}: ${error}`);
  }
};

/**
 * Lit plusieurs fichiers en parallèle
 */
export const readFiles = async (
  filePaths: string[],
): Promise<Map<string, string>> => {
  const fileContents = new Map<string, string>();

  await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        const content = await readFile(filePath);
        fileContents.set(filePath, content);
      } catch (error) {
        console.warn(`Avertissement: Impossible de lire ${filePath}:`, error);
      }
    }),
  );

  return fileContents;
};
