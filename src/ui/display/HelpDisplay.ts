import chalk from 'chalk'
import { SystemDiagnostic } from '../../system/SystemDiagnostic'
import { LogoDisplay } from './LogoDisplay'

export class HelpDisplay {
  /**
   * Affiche l'aide générale complète avec le logo
   */
  static displayGeneralHelp(): void {
    console.log(LogoDisplay.fullVersion())
    console.log(`
${chalk.blue('# Utilisation:')}
  react-metrics [commande] [options]

${chalk.blue('# Commandes disponibles:')}
  analyze [path]     Analyser un projet React (commande par défaut)
  coverage [path]    Analyser la couverture de tests
  download           Télécharger un binaire Nexus
  config             Gérer la configuration

${chalk.blue("# Exemples d'analyse:")}
  react-metrics                    Analyser le répertoire courant
  react-metrics ./mon-projet       Analyser un projet spécifique
  react-metrics --debug            Analyser avec logs détaillés
  react-metrics --local            Utiliser Nexus local (localhost:8081)

${chalk.blue('# Exemples de couverture:')}
  react-metrics coverage           Analyser la couverture de tests
  react-metrics coverage --html    Générer rapport HTML

${chalk.blue('# Exemples de configuration:')}
  react-metrics config             Menu interactif
  react-metrics config --init      Initialiser la configuration (permet aussi de remettre à zéro la configuration)
  react-metrics config --info      Afficher les informations

${chalk.blue('# Options globales:')}
  -h, --help                       Afficher cette aide
  -V, --version                    Afficher la version

${chalk.gray(
  "Pour plus d'informations, visitez: https://github.com/your-org/react-metrics"
)}`)
  }

  /**
   * Affiche un message d'aide rapide contextuel selon l'état du système
   */
  static async displayQuickHelp(): Promise<void> {
    console.log(LogoDisplay.compactVersion())
    console.log() // Ligne vide
    
    try {
      const systemStatus = await SystemDiagnostic.checkSystemStatus()
      const contextualMessage = SystemDiagnostic.generateContextualHelp(systemStatus)
      console.log(contextualMessage)
    } catch (error) {
      // Fallback en cas d'erreur lors du diagnostic
      console.log(chalk.gray('Impossible de vérifier l\'état du système.'))
      console.log(chalk.blue('Pour voir toutes les commandes: ') + chalk.white('react-metrics --help'))
    }
  }
}
