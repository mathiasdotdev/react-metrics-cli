import chalk from 'chalk';
import { BinaryManager } from '../utils/binaryManager';

export interface ConfigCommandOptions {
  info?: boolean;
  reset?: boolean;
}

export class ConfigCommand {
  private binaryManager: BinaryManager;

  constructor() {
    this.binaryManager = new BinaryManager();
  }

  /**
   * Exécute la commande de configuration
   */
  async execute(options: ConfigCommandOptions): Promise<void> {
    try {
      if (options.reset) {
        await this.resetConfiguration();
      } else if (options.info) {
        await this.showInfo();
      } else {
        await this.showConfigMenu();
      }
    } catch (error) {
      console.error(chalk.red(`❌ Erreur: ${error}`));
      process.exit(1);
    }
  }

  /**
   * Remet à zéro la configuration
   */
  private async resetConfiguration(): Promise<void> {
    console.log(chalk.yellow('🔄 Remise à zéro de la configuration...'));
    console.log(chalk.green('✅ Configuration remise à zéro (aucune action à effectuer)'));
  }

  /**
   * Affiche les informations de configuration
   */
  private async showInfo(): Promise<void> {
    console.log(chalk.cyan('📋 Informations de configuration React-Metrics\n'));
    console.log(chalk.gray('Aucune configuration locale à afficher.'));
  }

  /**
   * Affiche le menu de configuration interactif
   */
  private async showConfigMenu(): Promise<void> {
    console.log(chalk.cyan('⚙️  Configuration React-Metrics\n'));
    
    const inquirer = require('inquirer');
    
    const choices = [
      {
        name: '📋 Afficher les informations',
        value: 'info'
      },
      {
        name: '🔄 Remise à zéro',
        value: 'reset'
      },
      {
        name: '❌ Annuler',
        value: 'cancel'
      }
    ];

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Que souhaitez-vous faire ?',
        choices
      }
    ]);

    switch (answer.action) {
      case 'info':
        await this.showInfo();
        break;
      case 'reset':
        await this.resetConfiguration();
        break;
      case 'cancel':
        console.log(chalk.gray('Opération annulée'));
        break;
    }
  }
}