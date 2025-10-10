import chalk from 'chalk';

// Export des niveaux pour compatibilité
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
}

// Logger simple utilisant chalk pour la colorisation
export class Logger {
  private static currentLevel: LogLevel = LogLevel.DEBUG;

  static setLevel(level: LogLevel): void {
    Logger.currentLevel = level;
  }

  static newLine(): void {
    console.log('\n');
  }

  static debug(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.DEBUG) {
      console.log(chalk.gray(`🐛 ${message}`), ...args);
    }
  }

  static log(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.INFO) {
      console.log(message, ...args);
    }
  }

  static info(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.INFO) {
      console.log(`💡 ${message}`, ...args);
    }
  }

  static success(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.SUCCESS) {
      console.log(chalk.green(`✅ ${message}`), ...args);
    }
  }

  static warn(message: string, ..._args: any[]): void {
    if (Logger.currentLevel <= LogLevel.WARN) {
      console.warn(chalk.yellow(`⚠️ ${message}`));
    }
  }

  static error(message: string, ..._args: any[]): void {
    if (Logger.currentLevel <= LogLevel.ERROR) {
      console.error(chalk.red(`❌ ${message}`));
    }
  }

  static config(message: string, ...args: any[]): void {
    console.log(`🔐 ${message}`, ...args);
  }

  static files(message: string, ...args: any[]): void {
    console.log(`📁 ${message}`, ...args);
  }

  static cleanup(message: string, ..._args: any[]): void {
    console.warn(chalk.yellow(`🗑️ ${message}`));
  }

  static settings(message: string, ...args: any[]): void {
    console.log(`⚙️ ${message}`, ...args);
  }

  static analysis(message: string, ...args: any[]): void {
    console.log(`🔍 ${message}`, ...args);
  }

  static examples(message: string, ...args: any[]): void {
    console.log(`✍️ ${message}`, ...args);
  }

  static report(message: string, ...args: any[]): void {
    console.log(`📊 ${message}`, ...args);
  }

  static list(message: string, ...args: any[]): void {
    console.log(`- ${message}`, ...args);
  }

  // Méthodes pour l'affichage avec couleurs (terminal output)
  static section(message: string, ...args: any[]): void {
    console.log(chalk.blue(message), ...args);
  }

  static filePath(message: string, ...args: any[]): void {
    console.log(chalk.green(message), ...args);
  }

  static label(message: string, ...args: any[]): void {
    console.log(chalk.gray(message), ...args);
  }

  // Méthode pour les messages avec couleur personnalisée
  static colored(color: string, message: string, ...args: any[]): void {
    console.log(message, ...args);
  }
}
