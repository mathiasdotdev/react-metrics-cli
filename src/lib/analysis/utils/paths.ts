import * as path from 'path';

/**
 * Normalise un chemin en convertissant tous les backslashes en slashes
 * pour assurer une compatibilité cross-platform
 */
export const normalizePath = (filePath: string): string => {
  return filePath.replace(/\\/g, '/');
};

/**
 * Normalise un chemin en utilisant le séparateur de la plateforme
 */
export const normalizePlatformPath = (filePath: string): string => {
  return path.normalize(filePath);
};

/**
 * Convertit un chemin relatif en chemin absolu
 */
export const resolvePath = (basePath: string, relativePath: string): string => {
  return normalizePath(path.resolve(basePath, relativePath));
};

/**
 * Obtient le chemin relatif d'un fichier par rapport à un chemin de base
 */
export const getRelativePath = (from: string, to: string): string => {
  return normalizePath(path.relative(from, to));
};

/**
 * Vérifie si un chemin est absolu
 */
export const isAbsolutePath = (filePath: string): boolean => {
  return path.isAbsolute(filePath);
};

/**
 * Obtient le nom du fichier à partir d'un chemin
 */
export const getFileName = (filePath: string): string => {
  return path.basename(filePath);
};

/**
 * Obtient le répertoire parent d'un chemin
 */
export const getDirectory = (filePath: string): string => {
  return normalizePath(path.dirname(filePath));
};

/**
 * Obtient l'extension d'un fichier
 */
export const getExtension = (filePath: string): string => {
  return path.extname(filePath);
};

/**
 * Joint plusieurs segments de chemin
 */
export const joinPaths = (...segments: string[]): string => {
  return normalizePath(path.join(...segments));
};
