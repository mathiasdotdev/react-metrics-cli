import { AnalysisResult } from '$types/analysis';
import { Reporter } from '$types/reporter';
import { displayAnalysisResults } from '../display-terminal';
import { generateFileReport } from '../generate-file-report';

/**
 * Crée un reporter pour le terminal
 */
export const createTerminalReporter = (): Reporter => {
  return {
    generateReport: (result: AnalysisResult): void => {
      displayAnalysisResults(result);
    },
  };
};

/**
 * Crée un reporter pour fichier
 */
export const createFileReporter = (filePath: string): Reporter => {
  return {
    generateReport: async (result: AnalysisResult): Promise<void> => {
      await generateFileReport(filePath, result);
    },
  };
};

/**
 * Crée un reporter combiné qui génère plusieurs rapports
 */
export const createMultiReporter = (...reporters: Reporter[]): Reporter => {
  return {
    generateReport: async (result: AnalysisResult): Promise<void> => {
      for (const reporter of reporters) {
        await reporter.generateReport(result);
      }
    },
  };
};
