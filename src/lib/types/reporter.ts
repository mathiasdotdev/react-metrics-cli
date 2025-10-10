import { AnalysisResult } from './analysis';

/**
 * Interface abstraite pour les reporters
 */
export interface Reporter {
  /**
   * Génère un rapport à partir des résultats
   */
  generateReport(result: AnalysisResult): void | Promise<void>;
}
