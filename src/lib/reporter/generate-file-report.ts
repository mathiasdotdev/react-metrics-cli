import {
  AnalysisResult,
  Declaration,
  DeclarationType,
  isUsed,
} from '$types/analysis';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Construit le contenu du rapport détaillé
 */
export const buildDetailedReport = (result: AnalysisResult): string => {
  const lines: string[] = [];

  // En-tête
  lines.push("=== RAPPORT D'ANALYSE REACT-METRICS ===");
  lines.push(`Généré le: ${new Date().toLocaleString('fr-FR')}\n`);

  // Statistiques générales
  addStatistics(lines, result);

  // Toutes les déclarations trouvées
  addAllDeclarations(lines, result);

  // Code mort détecté
  addDeadCode(lines, result);

  // Déclarations @deprecated
  addDeprecatedDeclarations(lines, result);

  return lines.join('\n');
};

/**
 * Ajoute les statistiques générales
 */
const addStatistics = (lines: string[], result: AnalysisResult): void => {
  lines.push('=== STATISTIQUES ===');

  const totalDeclarations = result.declarations.size;
  const deadCode = result.deadCode;
  const totalDeadCode = deadCode.length;

  lines.push(`Total déclarations trouvées: ${totalDeclarations}`);
  lines.push(`Code mort détecté: ${totalDeadCode}`);

  if (totalDeclarations > 0) {
    const percentage = (totalDeadCode / totalDeclarations) * 100;
    lines.push(`Pourcentage de code mort: ${percentage.toFixed(2)}%`);
  }

  // Statistiques par type
  addStatisticsByType(lines, result);

  // Statistiques @deprecated
  if (result.deprecated && result.deprecated.length > 0) {
    lines.push(`\nDéclarations @deprecated: ${result.deprecated.length}`);
  }

  lines.push('');
};

/**
 * Ajoute les statistiques par type
 */
const addStatisticsByType = (lines: string[], result: AnalysisResult): void => {
  const counters = new Map<DeclarationType, number>();
  const deadCounters = new Map<DeclarationType, number>();

  // Compter toutes les déclarations
  for (const declaration of result.declarations.values()) {
    counters.set(declaration.type, (counters.get(declaration.type) || 0) + 1);
    if (!isUsed(declaration)) {
      deadCounters.set(
        declaration.type,
        (deadCounters.get(declaration.type) || 0) + 1,
      );
    }
  }

  lines.push('\nRépartition par type:');

  const types = [
    DeclarationType.CONSTANT,
    DeclarationType.FUNCTION,
    DeclarationType.CLASS,
    DeclarationType.CONSOLE,
    DeclarationType.PROP,
    DeclarationType.DEFINITION,
    DeclarationType.EXPORT,
    DeclarationType.DEPENDENCY,
  ];

  for (const type of types) {
    const total = counters.get(type) || 0;
    const dead = deadCounters.get(type) || 0;
    if (total > 0) {
      const percentage = (dead / total) * 100;
      lines.push(
        `  ${type}: ${dead}/${total} (${percentage.toFixed(1)}% mort)`,
      );
    }
  }
};

/**
 * Ajoute toutes les déclarations trouvées
 */
const addAllDeclarations = (lines: string[], result: AnalysisResult): void => {
  lines.push('=== TOUTES LES DÉCLARATIONS ===');

  // Convertir en array et trier
  const declarations = Array.from(result.declarations.values());
  declarations.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }
    return a.name.localeCompare(b.name);
  });

  let currentType: DeclarationType | null = null;
  for (const declaration of declarations) {
    if (declaration.type !== currentType) {
      currentType = declaration.type;
      lines.push(`\n--- ${currentType} ---`);
    }

    let status = 'UTILISÉE';
    if (!isUsed(declaration)) {
      status = 'NON UTILISÉE';
    } else if (
      declaration.type === DeclarationType.EXPORT &&
      declaration.isUsedLocally &&
      !declaration.isImportedExternally
    ) {
      status = 'UTILISÉE LOCALEMENT (supprimer export)';
    }

    lines.push(
      `${declaration.name} | ${declaration.location.filePath}:${declaration.location.line}:${declaration.location.column} | ${status}`,
    );
  }

  lines.push('');
};

/**
 * Ajoute la section du code mort
 */
const addDeadCode = (lines: string[], result: AnalysisResult): void => {
  lines.push('=== CODE MORT DÉTECTÉ ===');

  const deadCode = result.deadCode;
  if (deadCode.length === 0) {
    lines.push('Aucun code mort détecté ! 🎉');
    return;
  }

  // Grouper par type
  const groups = groupByType(deadCode);

  // Afficher chaque groupe dans l'ordre
  const types = [
    DeclarationType.FUNCTION,
    DeclarationType.CLASS,
    DeclarationType.CONSTANT,
    DeclarationType.PROP,
    DeclarationType.CONSOLE,
    DeclarationType.DEFINITION,
    DeclarationType.EXPORT,
    DeclarationType.DEPENDENCY,
  ];

  for (const type of types) {
    const declarations = groups.get(type);
    if (declarations && declarations.length > 0) {
      lines.push(`\n--- ${type} ---`);
      for (const declaration of declarations) {
        lines.push(
          `Fichier: ${declaration.location.filePath}:${declaration.location.line}:${declaration.location.column}`,
        );
        lines.push(`       Nom: ${declaration.name}\n`);
      }
    }
  }
};

/**
 * Groupe les déclarations par type
 */
const groupByType = (
  declarations: Declaration[],
): Map<DeclarationType, Declaration[]> => {
  const groups = new Map<DeclarationType, Declaration[]>();

  for (const declaration of declarations) {
    if (!groups.has(declaration.type)) {
      groups.set(declaration.type, []);
    }
    groups.get(declaration.type)!.push(declaration);
  }

  // Trier chaque groupe par nom
  for (const group of groups.values()) {
    group.sort((a, b) => a.name.localeCompare(b.name));
  }

  return groups;
};

/**
 * Ajoute la section des déclarations @deprecated
 */
const addDeprecatedDeclarations = (
  lines: string[],
  result: AnalysisResult,
): void => {
  lines.push('\n=== DÉCLARATIONS @DEPRECATED ===');

  const deprecated = result.deprecated;
  if (!deprecated || deprecated.length === 0) {
    lines.push('Aucune déclaration @deprecated détectée.');
    return;
  }

  lines.push(
    'Suggestion: Considérer la suppression ou le remplacement de ces déclarations.\n',
  );

  // Grouper par type
  const groups = groupByType(deprecated);

  // Afficher chaque groupe dans l'ordre
  const types = [
    DeclarationType.FUNCTION,
    DeclarationType.CLASS,
    DeclarationType.CONSTANT,
    DeclarationType.PROP,
    DeclarationType.DEFINITION,
    DeclarationType.EXPORT,
  ];

  for (const type of types) {
    const declarations = groups.get(type);
    if (declarations && declarations.length > 0) {
      lines.push(`\n--- ${type} ---`);
      for (const declaration of declarations) {
        lines.push(
          `Fichier: ${declaration.location.filePath}:${declaration.location.line}:${declaration.location.column}`,
        );
        lines.push(`       Nom: ${declaration.name}`);
        lines.push(
          `       Statut: ${isUsed(declaration) ? 'UTILISÉE' : 'NON UTILISÉE'}\n`,
        );
      }
    }
  }
};

/**
 * Écrit du contenu dans un fichier
 * Crée automatiquement les dossiers parents si nécessaire
 */
const writeFile = async (filePath: string, content: string): Promise<void> => {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Impossible d'écrire le fichier ${filePath}: ${error}`);
  }
};

/**
 * Génère un rapport détaillé dans un fichier
 */
export const generateFileReport = async (
  filePath: string,
  result: AnalysisResult,
): Promise<void> => {
  const content = buildDetailedReport(result);
  await writeFile(filePath, content);
};
