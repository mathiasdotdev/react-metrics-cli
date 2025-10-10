/**
 * Configuration pour React Metrics
 */
export interface ReactMetricsConfig {
  fileExtensions: string[];
  maxGoroutines: number;
  ignoredFolders: string[];
  otherIgnoredFolders: string[];
  ignoreAnnotations: boolean;
  modeDebug: boolean;
  reports: {
    terminal: boolean;
    html: boolean;
    json: boolean;
  };
  analysis: {
    constants: boolean;
    functions: boolean;
    classes: boolean;
    props: boolean;
    consoles: boolean;
    definitions: boolean;
    imports: boolean;
    exports: boolean;
    dependencies: boolean;
  };
}

/**
 * Obtient la configuration par défaut
 */
export const getDefaultConfig = (): ReactMetricsConfig => {
  return {
    fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    maxGoroutines: 20,
    ignoredFolders: ['node_modules', '.git', 'dist', 'build', 'coverage'],
    otherIgnoredFolders: [],
    ignoreAnnotations: true,
    modeDebug: false,
    reports: {
      terminal: true,
      html: false,
      json: false,
    },
    analysis: {
      constants: true,
      functions: true,
      classes: true,
      props: true,
      consoles: true,
      definitions: true,
      imports: true,
      exports: true,
      dependencies: false,
    },
  };
};
