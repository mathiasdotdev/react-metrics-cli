import chalk from 'chalk';

export class LogoDisplay {
  private static centerText(text: string, width: number): string {
    const cleanText = text.replace(/\u001b\[[0-9;]*m/g, ''); // Remove ANSI codes for length calculation
    const padding = Math.max(0, width - cleanText.length);
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
  }

  private static createBox(lines: string[], width: number = 60): string {
    const topBorder = '╭' + '─'.repeat(width) + '╮';
    const bottomBorder = '╰' + '─'.repeat(width) + '╯';
    
    const centeredLines = lines.map(line => 
      '│' + this.centerText(line, width) + '│'
    );
    
    return [topBorder, ...centeredLines, bottomBorder].join('\n');
  }

  static display(): void {
    console.log(this.getLogoString());
    console.log();
  }

  static getLogoString(): string {
    const asciiArt = [
      '',
      '██████╗ ███████╗ █████╗  ██████╗████████╗',
      '██╔══██╗██╔════╝██╔══██╗██╔════╝╚══██╔══╝',
      '██████╔╝█████╗  ███████║██║        ██║   ',
      '██╔══██╗██╔══╝  ██╔══██║██║        ██║   ',
      '██║  ██║███████╗██║  ██║╚██████╗   ██║   ',
      '╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝   ╚═╝   ',
      '',
      '███╗   ███╗███████╗████████╗██████╗ ██╗ ██████╗███████╗',
      '████╗ ████║██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝██╔════╝',
      '██╔████╔██║█████╗     ██║   ██████╔╝██║██║     ███████╗',
      '██║╚██╔╝██║██╔══╝     ██║   ██╔══██╗██║██║     ╚════██║',
      '██║ ╚═╝ ██║███████╗   ██║   ██║  ██║██║╚██████╗███████║',
      '╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝ ╚═════╝╚══════╝',
      '',
      chalk.cyan('React Metrics CLI v1.0.0'),
      chalk.gray('Analyseur de code mort React'),
      ''
    ];

    return chalk.cyan(this.createBox(asciiArt, 62));
  }

  static displayCompact(): void {
    const lines = [
      chalk.cyan.bold('React Metrics CLI'),
      chalk.gray('Analyseur de code mort')
    ];

    const logo = this.createBox(lines, 36);
    console.log(logo);
  }
}