import * as CryptoJS from 'crypto-js'
import * as fs from 'fs-extra'
import * as inquirer from 'inquirer'
import * as os from 'os'
import * as path from 'path'
import { Logger } from '../../ui/logger/Logger'

interface NexusCredentials {
  base64Token: string
  attemptCount: number
}

export class TokenManager {
  private credentialsFilePath: string

  constructor() {
    const nexusUtilsDir = path.join(os.homedir(), '.nexus-utils')
    this.credentialsFilePath = path.join(nexusUtilsDir, '.credentials')
  }

  /**
   * Récupère l'authentification base64 (depuis les credentials chiffrés ou demande à l'utilisateur)
   */
  async getAuthToken(): Promise<string> {
    try {
      // Vérifier si les credentials chiffrés existent
      if (await this.credentialsExist()) {
        Logger.credentials('Credentials Nexus trouvés dans le cache...')

        // Demander le mot de passe maître pour déchiffrer
        const masterPassword = await this.promptForMasterPassword(
          'Mot de passe pour déchiffrer les credentials Nexus:'
        )

        try {
          const credentials = await this.loadEncryptedCredentials(
            masterPassword
          )

          // Vérifier si les credentials sont valides et gérer les tentatives
          if (await this.validateAuthToken(credentials.base64Token)) {
            // Réinitialiser le compteur de tentatives en cas de succès
            if (credentials.attemptCount > 0) {
              credentials.attemptCount = 0
              await this.saveEncryptedCredentials(credentials, masterPassword)
            }
            return credentials.base64Token
          } else {
            credentials.attemptCount = (credentials.attemptCount || 0) + 1
            Logger.warn(
              `Credentials invalides (tentative ${credentials.attemptCount}/3)...`
            )

            if (credentials.attemptCount >= 3) {
              Logger.error(
                'Nombre maximum de tentatives atteint, suppression des credentials'
              )
              await this.deleteCredentials()
            } else {
              await this.saveEncryptedCredentials(credentials, masterPassword)
              return this.getAuthToken() // Retry
            }
          }
        } catch (decryptError) {
          Logger.error(
            'Mot de passe de déchiffrement incorrect ou credentials corrompus'
          )
          Logger.cleanup('Suppression des credentials existants...')
          await this.deleteCredentials()
        }
      }

      // Demander le token base64 à l'utilisateur
      const base64Token = await this.promptForBase64Token()

      // Demander le mot de passe maître pour chiffrer
      const masterPassword = await this.promptForMasterPassword(
        'Mot de passe pour chiffrer les credentials:'
      )

      // Créer l'objet credentials avec compteur initialisé
      const credentials: NexusCredentials = {
        base64Token,
        attemptCount: 0,
      }

      // Sauvegarder les credentials chiffrés avec le mot de passe maître
      await this.saveEncryptedCredentials(credentials, masterPassword)

      // Retourner le token base64
      return base64Token
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération de l'authentification: ${error}`
      )
    }
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
      if (!credentials.base64Token) {
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
      const nexusUtilsDir = path.join(os.homedir(), '.nexus-utils')
      await fs.ensureDir(nexusUtilsDir)

      // Sérialiser et chiffrer les credentials avec le mot de passe maître
      const credentialsJson = JSON.stringify(credentials)
      const encryptedCredentials = CryptoJS.AES.encrypt(
        credentialsJson,
        masterPassword
      ).toString()

      // Sauvegarder dans le fichier
      await fs.writeFile(this.credentialsFilePath, encryptedCredentials, 'utf8')

      Logger.success('Credentials sauvegardés de manière sécurisée')
      Logger.info(
        'Votre mot de passe sera demandé à chaque interaction avec Nexus'
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
   * Demande le token base64 depuis Nexus User Token à l'utilisateur
   */
  private async promptForBase64Token(): Promise<string> {
    Logger.settings('Configuration du token Nexus')
    Logger.info(
      'Récupérez votre token depuis Nexus > User Token (format base64 user:password)'
    )
    Logger.info(
      'Le token sera chiffré et stocké localement de manière sécurisée.'
    )
    Logger.newLine()

    const answer = await inquirer.default.prompt([
      {
        type: 'password',
        name: 'base64Token',
        message: 'Base64 token depuis Nexus User Token:',
        mask: '*',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Le token ne peut pas être vide'
          }

          // Vérifier que c'est une base64 valide
          try {
            const decoded = Buffer.from(input.trim(), 'base64').toString('utf8')
            if (!decoded.includes(':') || decoded.split(':').length !== 2) {
              return 'Le token doit être au format base64 contenant user:password'
            }
            return true
          } catch {
            return 'Format base64 invalide'
          }
        },
      },
    ])

    return answer.base64Token.trim()
  }

  /**
   * Valide le token d'authentification base64
   */
  private async validateAuthToken(authToken: string): Promise<boolean> {
    try {
      const decoded = Buffer.from(authToken, 'base64').toString('utf8')
      const parts = decoded.split(':')
      return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0
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
        Logger.cleanup('Credentials supprimés')
      }
    } catch (error) {
      Logger.error(`Erreur lors de la suppression des credentials: ${error}`)
    }
  }

  /**
   * Affiche des informations sur les credentials stockés
   */
  async getCredentialsInfo(): Promise<void> {
    try {
      if (await this.credentialsExist()) {
        const stats = await fs.stat(this.credentialsFilePath)

        Logger.credentials('Informations des credentials:')
        Logger.list(`Fichier: ${this.credentialsFilePath}`)
        Logger.list(`Modifié: ${stats.mtime.toLocaleString()}`)
        Logger.list(`Taille: ${stats.size} bytes`)
        Logger.warn(
          'Credentials chiffrés - mot de passe requis pour les consulter'
        )
        Logger.warn(
          "Utilisez la commande d'analyse avec Nexus pour tester l'authentification"
        )
      } else {
        Logger.error('Aucun credentials trouvés')
        Logger.warn(
          'Utilisez une commande nécessitant Nexus pour configurer les credentials'
        )
      }
    } catch (error) {
      Logger.error(`Erreur lors de la lecture des informations: ${error}`)
    }
  }
}
