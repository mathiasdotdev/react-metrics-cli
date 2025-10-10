import { LogoDisplay } from '$ui/display/LogoDisplay';
import chalk from 'chalk';
import { Command } from 'commander';

export class CommandWrapper {
  static createFullCommand(): Command {
    const command = new Command();
    this.configureFullHelp(command);
    return command;
  }

  static createCompactCommand(): Command {
    const command = new Command();
    this.configureCompactHelp(command);
    return command;
  }

  private static configureFullHelp(command: Command): void {
    command.configureHelp({
      formatHelp: (cmd, helper) => {
        return LogoDisplay.fullVersion() + this.buildHelpContent(cmd, helper);
      },
    });
  }

  private static configureCompactHelp(command: Command): void {
    command.configureHelp({
      formatHelp: (cmd, helper) => {
        const usage = helper.commandUsage(cmd);
        const description = helper.commandDescription(cmd);
        const options = helper.visibleOptions(cmd);

        let result = LogoDisplay.compactVersion() + '\n';

        result += `\n${chalk.blue('# Usage:')}\n`;
        result += `  ${usage}\n`;

        if (description) {
          result += `\n${chalk.blue('# Description:')}\n`;
          result += `  ${description}\n`;
        }

        if (options && options.length > 0) {
          result += `\n${chalk.blue('# Options:')}\n`;
          options.forEach((option) => {
            const term = helper.optionTerm(option);
            const desc = helper.optionDescription(option);
            result += `  ${term.padEnd(20)} ${desc}\n`;
          });
        }

        return result;
      },
    });
  }

  private static buildHelpContent(cmd: Command, helper: any): string {
    const usage = helper.commandUsage(cmd);
    const description = helper.commandDescription(cmd);
    const options = helper.visibleOptions(cmd);

    let result = `\n${chalk.blue('# Usage:')}\n`;
    result += `  ${usage}\n`;

    if (description) {
      result += `\n${chalk.blue('# Description:')}\n`;
      result += `  ${description}\n`;
    }

    if (options && options.length > 0) {
      result += `\n${chalk.blue('# Options:')}\n`;
      options.forEach((option: any) => {
        const term = helper.optionTerm(option);
        const desc = helper.optionDescription(option);
        result += `  ${term.padEnd(20)} ${desc}\n`;
      });
    }

    return result;
  }
}
