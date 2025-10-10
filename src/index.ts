#!/usr/bin/env node

import chalk from 'chalk';
// Importer la version depuis package.json
import packageJson from '$/package.json' with { type: 'json' };
import { createAnalyzeCommand } from './commands/Analyze';
import { createConfigCommand } from './commands/Config';
import { LogoDisplay } from './lib/ui/display/LogoDisplay';
import { Logger } from './lib/ui/logger/Logger';
import { CommandWrapper } from './lib/ui/wrapper/CommandWrapper';

// Configuration du programme principal
const program = CommandWrapper.createFullCommand()
  .name('react-metrics')
  .description('Analyseur de code mort React')
  .version(packageJson.version)
  .helpOption('-h, --help', "Afficher l'aide")
  .helpCommand(false);

// Gestion des erreurs globales
process.on('uncaughtException', (error) => {
  Logger.error(chalk.red('Erreur inattendue:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  Logger.error(chalk.red('Promesse rejetée:'), reason);
  process.exit(1);
});

// Vérifier si l'aide générale est demandée
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  if (process.argv.length === 3) {
    Logger.log(LogoDisplay.compactVersion());
    Logger.newLine();
    Logger.log(`
${chalk.blue('# Utilisation:')}
  react-metrics analyze [path]

${chalk.blue('# Commandes disponibles:')}
  analyze [path]     Analyser un projet React pour détecter le code mort
  config             Gérer la configuration de react-metrics

${chalk.blue('# Exemples:')}
  react-metrics analyze                    Analyser le répertoire courant
  react-metrics analyze ./mon-projet       Analyser un projet spécifique
  react-metrics analyze --debug            Analyser avec logs détaillés
  react-metrics config --init              Initialiser la configuration
  react-metrics config --info              Afficher la configuration

${chalk.blue('# Options globales:')}
  -h, --help                       Afficher cette aide
  -V, --version                    Afficher la version
`);
    process.exit(0);
  }
}

// Comportement quand aucune commande n'est fournie
if (process.argv.length === 2) {
  Logger.log(LogoDisplay.compactVersion());
  Logger.newLine();
  Logger.log(
    'Pour voir les commandes disponibles: ' +
      chalk.white('react-metrics --help'),
  );
  process.exit(0);
} else {
  // Ajouter les commandes
  program.addCommand(createAnalyzeCommand());
  program.addCommand(createConfigCommand());

  // Parser les arguments
  program.parse();
}
