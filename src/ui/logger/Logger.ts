import chalk from 'chalk'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
}

export class Logger {
  private static currentLevel: LogLevel = LogLevel.INFO

  static setLevel(level: LogLevel): void {
    Logger.currentLevel = level
  }

  static newLine(): void {
    console.log('\n')
  }

  static debug(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.DEBUG) {
      console.log(chalk.gray('🐛'), message, ...args)
    }
  }

  static log(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.INFO) {
      console.log(chalk.gray(message), ...args)
    }
  }

  static info(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.INFO) {
      console.log(chalk.blue('💡'), message, ...args)
    }
  }

  static success(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.SUCCESS) {
      console.log(chalk.green('✅'), message, ...args)
    }
  }

  static warn(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.WARN) {
      console.log(chalk.yellow('⚠️'), message, ...args)
    }
  }

  static error(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.ERROR) {
      console.error(chalk.red('❌'), message, ...args)
    }
  }

  // Méthodes spécialisées avec icônes
  static credentials(message: string, ...args: any[]): void {
    console.log(chalk.blue('🔑'), message, ...args)
  }

  static download(message: string, ...args: any[]): void {
    console.log(chalk.blue('⬇️'), message, ...args)
  }

  static config(message: string, ...args: any[]): void {
    console.log(chalk.cyan('🔐'), message, ...args)
  }

  static files(message: string, ...args: any[]): void {
    console.log(chalk.green('📁'), message, ...args)
  }

  static cleanup(message: string, ...args: any[]): void {
    console.log(chalk.yellow('🗑️'), message, ...args)
  }

  static settings(message: string, ...args: any[]): void {
    console.log(chalk.blue('⚙️'), message, ...args)
  }

  static analysis(message: string, ...args: any[]): void {
    console.log(chalk.cyan('🔍'), message, ...args)
  }

  static examples(message: string, ...args: any[]): void {
    console.log(chalk.cyan('✍️'), message, ...args)
  }

  static report(message: string, ...args: any[]): void {
    console.log(chalk.cyan('📊'), message, ...args)
  }

  static list(message: string, ...args: any[]): void {
    console.log('\t' + chalk.gray('➖'), message, ...args)
  }

  // Méthode pour les messages avec couleur personnalisée
  static colored(
    color: keyof typeof chalk,
    message: string,
    ...args: any[]
  ): void {
    console.log((chalk as any)[color](message), ...args)
  }
}
