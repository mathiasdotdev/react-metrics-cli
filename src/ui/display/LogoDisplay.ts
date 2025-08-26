import chalk from 'chalk'

// Importer la version depuis package.json
const packageJson = require('../../../package.json')

export class LogoDisplay {
  private static centerText(text: string, width: number): string {
    const cleanText = text.replace(/\u001b\[[0-9;]*m/g, '') // Remove ANSI codes for length calculation
    const padding = Math.max(0, width - cleanText.length)
    const leftPad = Math.floor(padding / 2)
    const rightPad = padding - leftPad
    return ' '.repeat(leftPad) + text + ' '.repeat(rightPad)
  }

  private static createBox(lines: string[], width: number = 60): string {
    const topBorder = '╭' + '─'.repeat(width) + '╮'
    const bottomBorder = '╰' + '─'.repeat(width) + '╯'

    const centeredLines = lines.map(
      (line) => '│' + this.centerText(line, width) + '│'
    )

    return [topBorder, ...centeredLines, bottomBorder].join('\n')
  }

  static fullVersion(): string {
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
      chalk.cyan(`React Metrics CLI v${packageJson.version}`),
      chalk.gray('Analyseur de code mort React'),
      '',
    ]

    return chalk.cyan(this.createBox(asciiArt, 62))
  }

  static compactVersion(): string {
    const lines = [
      chalk.cyan.bold('React Metrics CLI'),
      chalk.gray('Analyseur de code mort'),
    ]

    return this.createBox(lines, 36)
  }
}
