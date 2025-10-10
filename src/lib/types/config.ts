/**
 * Configuration pour les annotations
 */
export interface AnnotationConfig {
  ignoreAnnotations?: boolean;
  ignoreFileAnnotation?: string;
  ignoreLineAnnotation?: string;
  contextLines?: number;
}

/**
 * Configuration pour les détecteurs
 */
export interface DetectorConfig extends AnnotationConfig {
  fileExtensions?: string[];
  ignoredFolders?: string[];
  maxGoroutines?: number;
  projectPath?: string;
  debug?: boolean;
}

/**
 * Configuration complète de l'application
 */
export interface Config extends DetectorConfig {
  // Ajouter d'autres options de configuration si nécessaire
}
