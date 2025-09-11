import pino from 'pino';

// Configuration conditionnelle : pas de transport en mode test
const isTestMode = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

const logger = pino({
  ...(isTestMode
    ? {
        // En mode test : logs silencieux
        level: 'silent',
      }
    : {
        // En mode normal : transport coloré pour CLI avec niveau debug
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname,time',
            // Format simple sans timestamp pour les logs utilisateur
            messageFormat: '{msg}',
            singleLine: true,
            hideObject: true,
            // Options pour gérer les problèmes d'encodage
            crlf: false,
            messageKey: 'msg',
            // Éviter les caractères de contrôle problématiques
            sync: false,
          },
        },
      }),
});

// Export des niveaux pour compatibilité
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
}

// Wrapper pour conserver l'interface existante tout en utilisant Pino
export class Logger {
  private static currentLevel: LogLevel = LogLevel.DEBUG;

  static setLevel(level: LogLevel): void {
    Logger.currentLevel = level;
    const pinoLevels = ['debug', 'info', 'info', 'warn', 'error'];
    logger.level = pinoLevels[level] || 'debug';
  }

  static newLine(): void {
    console.log('\n');
  }

  static debug(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.DEBUG) {
      logger.debug(`🐛 ${message}`, ...args);
    }
  }

  static log(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.INFO) {
      console.log(message, ...args);
    }
  }

  static info(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.INFO) {
  logger.info(`💡 ${message}`);
    }
  }

  static success(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.SUCCESS) {
  logger.info(`✅ ${message}`);
    }
  }

  static warn(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.WARN) {
  logger.warn(`⚠️ ${message}`);
    }
  }

  static error(message: string, ...args: any[]): void {
    if (Logger.currentLevel <= LogLevel.ERROR) {
  logger.error(`❌ ${message}`);
    }
  }

  // Méthodes spécialisées avec icônes - utilisant Pino
  static credentials(message: string, ...args: any[]): void {
  logger.info(`🔑 ${message}`);
  }

  static download(message: string, ...args: any[]): void {
  logger.info(`⬇️ ${message}`);
  }

  static config(message: string, ...args: any[]): void {
  logger.info(`🔐 ${message}`);
  }

  static files(message: string, ...args: any[]): void {
  logger.info(`📁 ${message}`);
  }

  static cleanup(message: string, ...args: any[]): void {
  logger.warn(`🗑️ ${message}`);
  }

  static settings(message: string, ...args: any[]): void {
  logger.info(`⚙️ ${message}`);
  }

  static analysis(message: string, ...args: any[]): void {
  logger.info(`🔍 ${message}`);
  }

  static examples(message: string, ...args: any[]): void {
  logger.info(`✍️ ${message}`);
  }

  static report(message: string, ...args: any[]): void {
  logger.info(`📊 ${message}`);
  }

  static list(message: string, ...args: any[]): void {
  logger.info(`\t➖ ${message}`);
  }

  // Méthode pour les messages avec couleur personnalisée
  static colored(color: string, message: string, ...args: any[]): void {
    logger.info(message, ...args);
  }
}

// Export de l'instance pino pour usage direct si nécessaire
export { logger };
