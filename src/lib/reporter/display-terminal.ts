import { AnalysisResult, Declaration, DeclarationType } from '$types/analysis';
import { Logger } from '$ui/logger/Logger';
import chalk from 'chalk';

/**
 * Groupe les déclarations par type
 */
const groupByType = (
  deadCode: Declaration[],
): Map<DeclarationType, Declaration[]> => {
  const grouped = new Map<DeclarationType, Declaration[]>();

  for (const declaration of deadCode) {
    if (!grouped.has(declaration.type)) {
      grouped.set(declaration.type, []);
    }
    grouped.get(declaration.type)!.push(declaration);
  }

  return grouped;
};

/**
 * Affiche les fonctions non utilisées
 */
const displayFunctions = (functions: Declaration[]): void => {
  if (functions.length === 0) return;

  Logger.section('=== Fonctions ===');
  for (const func of functions) {
    Logger.log(
      `${chalk.gray('File:')} ${chalk.green(`${func.location.filePath}:${func.location.line}:${func.location.column}`)}`,
    );
    Logger.log(`    ${chalk.gray('Name:')} ${func.name}`);
  }
  Logger.newLine();
};

/**
 * Affiche les classes non utilisées
 */
const displayClasses = (classes: Declaration[]): void => {
  if (classes.length === 0) return;

  Logger.section('=== Classes ===');
  for (const cls of classes) {
    Logger.log(
      `${chalk.gray('File:')} ${chalk.green(`${cls.location.filePath}:${cls.location.line}:${cls.location.column}`)}`,
    );
    Logger.log(`    ${chalk.gray('Name:')} ${cls.name}`);
  }
  Logger.newLine();
};

/**
 * Affiche les constantes non utilisées
 */
const displayConstants = (constants: Declaration[]): void => {
  if (constants.length === 0) return;

  Logger.section('=== Constantes ===');
  for (const constant of constants) {
    Logger.log(
      `${chalk.gray('File:')} ${chalk.green(`${constant.location.filePath}:${constant.location.line}:${constant.location.column}`)}`,
    );
    Logger.log(`    ${chalk.gray('Name:')} ${constant.name}`);
  }
  Logger.newLine();
};

/**
 * Affiche les props non utilisées
 */
const displayProps = (props: Declaration[]): void => {
  if (props.length === 0) return;

  Logger.section('=== Props ===');
  for (const prop of props) {
    Logger.log(
      `${chalk.gray('File:')} ${chalk.green(`${prop.location.filePath}:${prop.location.line}:${prop.location.column}`)}`,
    );
    Logger.log(`    ${chalk.gray('Name:')} ${prop.name}`);
  }
  Logger.newLine();
};

/**
 * Affiche les console.* non utilisés
 */
const displayConsoles = (consoles: Declaration[]): void => {
  if (consoles.length === 0) return;

  Logger.section('=== Console Logs ===');
  for (const cons of consoles) {
    Logger.log(
      `${chalk.gray('File:')} ${chalk.green(`${cons.location.filePath}:${cons.location.line}:${cons.location.column}`)}`,
    );
    Logger.log(`    ${chalk.gray('Type:')} ${cons.context || cons.name}`);
  }
  Logger.newLine();
};

/**
 * Affiche les types/interfaces non utilisés
 */
const displayDefinitions = (definitions: Declaration[]): void => {
  if (definitions.length === 0) return;

  Logger.section('=== Types/Interfaces ===');
  for (const def of definitions) {
    Logger.log(
      `${chalk.gray('File:')} ${chalk.green(`${def.location.filePath}:${def.location.line}:${def.location.column}`)}`,
    );
    Logger.log(`    ${chalk.gray('Name:')} ${def.name}`);
  }
  Logger.newLine();
};

/**
 * Affiche les exports non utilisés
 */
const displayExports = (exports: Declaration[]): void => {
  if (exports.length === 0) return;

  Logger.section('=== Exports ===');
  for (const exp of exports) {
    Logger.log(
      `${chalk.gray('File:')} ${chalk.green(`${exp.location.filePath}:${exp.location.line}:${exp.location.column}`)}`,
    );
    Logger.log(`    ${chalk.gray('Name:')} ${exp.name}`);
  }
  Logger.newLine();
};

/**
 * Récupère les exports utilisés uniquement localement (local-only)
 */
const getLocalOnlyExports = (
  declarations: Map<string, Declaration>,
): Declaration[] => {
  const localOnly: Declaration[] = [];

  for (const declaration of declarations.values()) {
    if (
      declaration.type === DeclarationType.EXPORT &&
      declaration.isUsedLocally &&
      !declaration.isImportedExternally
    ) {
      localOnly.push(declaration);
    }
  }

  return localOnly.sort((a, b) =>
    a.location.filePath.localeCompare(b.location.filePath),
  );
};

/**
 * Affiche les exports utilisés uniquement localement (suggérer de supprimer 'export')
 */
const displayLocalOnlyExports = (exports: Declaration[]): void => {
  if (exports.length === 0) return;

  Logger.section('=== Exports Local-Only ===');
  Logger.log(
    `${chalk.gray('Suggestion:')} ${chalk.yellow('Supprimer le mot-clé "export"')}`,
  );
  for (const exp of exports) {
    Logger.log(
      `${chalk.gray('File:')} ${chalk.green(`${exp.location.filePath}:${exp.location.line}:${exp.location.column}`)}`,
    );
    Logger.log(`    ${chalk.gray('Name:')} ${exp.name}`);
  }
  Logger.newLine();
};

/**
 * Affiche les dépendances non utilisées
 */
const displayDependencies = (dependencies: Declaration[]): void => {
  if (dependencies.length === 0) return;

  Logger.section('=== Dependencies ===');
  for (const dep of dependencies) {
    Logger.log(
      `${chalk.gray('File:')} ${chalk.green(`${dep.location.filePath}:${dep.location.line}:${dep.location.column}`)}`,
    );
    Logger.log(`    ${chalk.gray('Name:')} ${dep.name}`);
  }
  Logger.newLine();
};

/**
 * Affiche les déclarations marquées @deprecated
 */
const displayDeprecated = (deprecated: Declaration[]): void => {
  if (deprecated.length === 0) return;

  Logger.section('=== Déclarations @deprecated ===');
  Logger.log(
    `${chalk.gray('Suggestion:')} ${chalk.yellow('Considérer la suppression ou le remplacement')}`,
  );
  for (const decl of deprecated) {
    Logger.log(
      `${chalk.gray('File:')} ${chalk.green(`${decl.location.filePath}:${decl.location.line}:${decl.location.column}`)}`,
    );
    Logger.log(`    ${chalk.gray('Type:')} ${decl.type}`);
    Logger.log(`    ${chalk.gray('Name:')} ${decl.name}`);
  }
  Logger.newLine();
};

/**
 * Affiche le résumé
 */
const displaySummary = (result: AnalysisResult): void => {
  Logger.section('📊 Code mort détecté:');

  const groupedByType = groupByType(result.deadCode);

  // Afficher dans l'ordre exact
  const order = [
    { type: DeclarationType.FUNCTION, label: 'Functions' },
    { type: DeclarationType.CLASS, label: 'Classes' },
    { type: DeclarationType.CONSTANT, label: 'Constants' },
    { type: DeclarationType.PROP, label: 'Props' },
    { type: DeclarationType.CONSOLE, label: 'Consoles' },
    { type: DeclarationType.DEFINITION, label: 'Types/Interfaces' },
    { type: DeclarationType.EXPORT, label: 'Exports' },
    { type: DeclarationType.DEPENDENCY, label: 'Dependency' },
  ];

  for (const { type, label } of order) {
    const declarations = groupedByType.get(type);
    if (declarations && declarations.length > 0) {
      Logger.list(`${label}: ${declarations.length}`);
    }
  }

  Logger.newLine();
  Logger.log(`Total: ${result.deadCode.length} éléments`);

  // Afficher compteur @deprecated si présent
  if (result.deprecated && result.deprecated.length > 0) {
    Logger.log(
      `⚠️  Déclarations ${chalk.yellow('@deprecated')}: ${result.deprecated.length} éléments`,
    );
  }

  Logger.log(
    `⏱️  Durée totale de l'analyse: ${(result.duration / 1000).toFixed(2)} secondes`,
  );
  Logger.success('Analyse terminée');
};

/**
 * Affiche les résultats de l'analyse dans le terminal
 */
export const displayAnalysisResults = (result: AnalysisResult): void => {
  const localOnlyExports = getLocalOnlyExports(result.declarations);

  // Grouper le code mort par type
  const groupedByType = groupByType(result.deadCode);

  // Afficher chaque catégorie dans l'ordre exact
  displayFunctions(groupedByType.get(DeclarationType.FUNCTION) || []);
  displayClasses(groupedByType.get(DeclarationType.CLASS) || []);
  displayConstants(groupedByType.get(DeclarationType.CONSTANT) || []);
  displayProps(groupedByType.get(DeclarationType.PROP) || []);
  displayConsoles(groupedByType.get(DeclarationType.CONSOLE) || []);
  displayDefinitions(groupedByType.get(DeclarationType.DEFINITION) || []);
  displayExports(groupedByType.get(DeclarationType.EXPORT) || []);
  displayLocalOnlyExports(localOnlyExports);
  displayDependencies(groupedByType.get(DeclarationType.DEPENDENCY) || []);

  // Afficher les déclarations @deprecated
  if (result.deprecated) {
    displayDeprecated(result.deprecated);
  }

  // Résumé
  displaySummary(result);
};
