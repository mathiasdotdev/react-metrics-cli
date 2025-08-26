import chalk from 'chalk'
import * as CryptoJS from 'crypto-js'
import * as fs from 'fs-extra'
import * as inquirer from 'inquirer'
import { ENCRYPTION_CONFIG, STORAGE_PATHS } from '../config/System'

interface NexusCredentials {
  username: string
  password: string
}

export class TokenManager {
  private credentialsFilePath: string
  private secretKey: string

  constructor() {
    this.credentialsFilePath = STORAGE_PATHS.TOKEN_FILE.replace(
      'nexus-token.enc',
      'nexus.credentials'
    )
    this.secretKey = ENCRYPTION_CONFIG.SECRET_KEY
  }

  /**
   * Récupère l'authentification base64 (depuis les credentials chiffrés ou demande à l'utilisateur)
   */
  async getAuthToken(): Promise<string> {
    try {
      // Vérifier si les credentials chiffrés existent
      if (await this.credentialsExist()) {
        console.log(chalk.blue('🔑 Credentials Nexus trouvés dans le cache...'))

        // Demander le mot de passe maître pour déchiffrer
        const masterPassword = await this.promptForMasterPassword(
          'Mot de passe pour déchiffrer les credentials Nexus:'
        )

        try {
          const credentials = await this.loadEncryptedCredentials(
            masterPassword
          )

          // Générer le token base64
          const authToken = this.generateBase64Auth(
            credentials.username,
            credentials.password
          )

          // Vérifier si les credentials sont valides (optionnel)
          if (await this.validateAuthToken(authToken)) {
            return authToken
          } else {
            console.log(
              chalk.yellow(
                '⚠️  Credentials invalides, demande de nouveaux credentials...'
              )
            )
            await this.deleteCredentials()
          }
        } catch (decryptError) {
          console.log(
            chalk.red(
              '❌ Mot de passe de déchiffrement incorrect ou credentials corrompus'
            )
          )
          console.log(
            chalk.yellow('💡 Suppression des credentials existants...')
          )
          await this.deleteCredentials()
        }
      }

      // Demander les credentials à l'utilisateur
      const credentials = await this.promptForCredentials()

      // Demander le mot de passe maître pour chiffrer
      const masterPassword = await this.promptForMasterPassword(
        'Mot de passe pour chiffrer les credentials:'
      )

      // Sauvegarder les credentials chiffrés avec le mot de passe maître
      await this.saveEncryptedCredentials(credentials, masterPassword)

      // Retourner le token base64
      return this.generateBase64Auth(credentials.username, credentials.password)
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération de l'authentification: ${error}`
      )
    }
  }

  /**
   * Génère un token d'authentification base64 depuis username:password
   */
  private generateBase64Auth(username: string, password: string): string {
    const credentials = `${username}:${password}`
    return Buffer.from(credentials, 'utf8').toString('base64')
  }

  /**
   * Vérifie si le fichier de credentials existe
   */
  private async credentialsExist(): Promise<boolean> {
    try {
      await fs.access(this.credentialsFilePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Charge et déchiffre les credentials depuis le fichier
   */
  private async loadEncryptedCredentials(
    masterPassword: string
  ): Promise<NexusCredentials> {
    try {
      const encryptedData = await fs.readFile(this.credentialsFilePath, 'utf8')
      const bytes = CryptoJS.AES.decrypt(encryptedData, masterPassword)
      const decryptedCredentials = bytes.toString(CryptoJS.enc.Utf8)

      if (!decryptedCredentials) {
        throw new Error(
          'Impossible de déchiffrer les credentials - mot de passe incorrect'
        )
      }

      const credentials = JSON.parse(decryptedCredentials) as NexusCredentials

      // Vérifier que les credentials ont la structure attendue
      if (!credentials.username || !credentials.password) {
        throw new Error('Structure des credentials invalide')
      }

      return credentials
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Mot de passe de déchiffrement incorrect')
      }
      throw new Error(`Erreur lors du déchiffrement des credentials: ${error}`)
    }
  }

  /**
   * Chiffre et sauvegarde les credentials
   */
  private async saveEncryptedCredentials(
    credentials: NexusCredentials,
    masterPassword: string
  ): Promise<void> {
    try {
      // Créer le répertoire si nécessaire
      await fs.ensureDir(STORAGE_PATHS.BINARY_ROOT_DIR)

      // Sérialiser et chiffrer les credentials avec le mot de passe maître
      const credentialsJson = JSON.stringify(credentials)
      const encryptedCredentials = CryptoJS.AES.encrypt(
        credentialsJson,
        masterPassword
      ).toString()

      // Sauvegarder dans le fichier
      await fs.writeFile(this.credentialsFilePath, encryptedCredentials, 'utf8')

      console.log(
        chalk.green('✅ Credentials sauvegardés de manière sécurisée')
      )
      console.log(
        chalk.gray(
          '💡 Votre mot de passe sera demandé à chaque interaction avec Nexus'
        )
      )
    } catch (error) {
      throw new Error(`Erreur lors de la sauvegarde des credentials: ${error}`)
    }
  }

  /**
   * Demande le mot de passe maître à l'utilisateur
   */
  private async promptForMasterPassword(message: string): Promise<string> {
    const answer = await inquirer.default.prompt([
      {
        type: 'password',
        name: 'masterPassword',
        message,
        mask: '*',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Le mot de passe ne peut pas être vide'
          }
          if (input.length < 6) {
            return 'Le mot de passe doit faire au moins 6 caractères'
          }
          return true
        },
      },
    ])

    return answer.masterPassword
  }

  /**
   * Demande les credentials à l'utilisateur
   */
  private async promptForCredentials(): Promise<NexusCredentials> {
    console.log(chalk.cyan('\n🔐 Configuration des credentials Nexus'))
    console.log(
      chalk.gray(
        'Vos credentials seront chiffrés et stockés localement pour les prochaines utilisations.'
      )
    )
    console.log(
      chalk.gray(
        "Un token d'authentification base64 sera généré automatiquement.\n"
      )
    )

    const answers = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'username',
        message: "Nom d'utilisateur Nexus:",
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return "Le nom d'utilisateur ne peut pas être vide"
          }
          return true
        },
      },
      {
        type: 'password',
        name: 'password',
        message: 'Mot de passe Nexus:',
        mask: '*',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Le mot de passe ne peut pas être vide'
          }
          return true
        },
      },
    ])

    return {
      username: answers.username.trim(),
      password: answers.password,
    }
  }

  /**
   * Valide le token d'authentification en faisant un appel test à Nexus
   */
  private async validateAuthToken(authToken: string): Promise<boolean> {
    // TODO: Implémenter la validation du token avec un appel à Nexus
    // Pour l'instant, on considère que le token est valide s'il existe et a la bonne structure base64
    try {
      const decoded = Buffer.from(authToken, 'base64').toString('utf8')
      return decoded.includes(':') && decoded.split(':').length === 2
    } catch {
      return false
    }
  }

  /**
   * Supprime le fichier de credentials
   */
  async deleteCredentials(): Promise<void> {
    try {
      if (await this.credentialsExist()) {
        await fs.remove(this.credentialsFilePath)
        console.log(chalk.yellow('🗑️  Credentials supprimés'))
      }
    } catch (error) {
      console.error(
        chalk.red(`Erreur lors de la suppression des credentials: ${error}`)
      )
    }
  }

  /**
   * Affiche des informations sur les credentials stockés
   */
  async getCredentialsInfo(): Promise<void> {
    try {
      if (await this.credentialsExist()) {
        const stats = await fs.stat(this.credentialsFilePath)

        console.log(chalk.blue('📋 Informations des credentials:'))
        console.log(chalk.gray(`   Fichier: ${this.credentialsFilePath}`))
        console.log(chalk.gray(`   Modifié: ${stats.mtime.toLocaleString()}`))
        console.log(chalk.gray(`   Taille: ${stats.size} bytes`))
        console.log(
          chalk.yellow(
            '⚠️   Credentials chiffrés - mot de passe requis pour les consulter'
          )
        )
        console.log(
          chalk.gray(
            "💡   Utilisez la commande d'analyse avec Nexus pour tester l'authentification"
          )
        )
      } else {
        console.log(chalk.yellow('❌ Aucun credentials trouvés'))
        console.log(
          chalk.gray(
            '💡 Utilisez une commande nécessitant Nexus pour configurer les credentials'
          )
        )
      }
    } catch (error) {
      console.error(
        chalk.red(`Erreur lors de la lecture des informations: ${error}`)
      )
    }
  }

  /**
   * Méthode de compatibilité pour l'ancien système de tokens
   * @deprecated Utiliser getAuthToken() à la place
   */
  async getToken(): Promise<string> {
    console.log(
      chalk.yellow('⚠️  getToken() est déprécié, utilisez getAuthToken()')
    )
    return this.getAuthToken()
  }
}
