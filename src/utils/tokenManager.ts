import chalk from 'chalk';
import * as CryptoJS from 'crypto-js';
import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import { ENCRYPTION_CONFIG, STORAGE_PATHS } from '../config/constants';

export class TokenManager {
  private tokenFilePath: string;
  private secretKey: string;

  constructor() {
    this.tokenFilePath = STORAGE_PATHS.TOKEN_FILE;
    this.secretKey = ENCRYPTION_CONFIG.SECRET_KEY;
  }

  /**
   * Récupère le token Nexus (depuis le fichier chiffré ou demande à l'utilisateur)
   */
  async getToken(): Promise<string> {
    try {
      // Vérifier si le token chiffré existe
      if (await this.tokenExists()) {
        console.log(chalk.blue('🔑 Token Nexus trouvé dans le cache...'));
        const token = await this.loadEncryptedToken();
        
        // Vérifier si le token est valide (optionnel)
        if (await this.validateToken(token)) {
          return token;
        } else {
          console.log(chalk.yellow('⚠️  Token invalide, demande d\'un nouveau token...'));
          await this.deleteToken();
        }
      }

      // Demander le token à l'utilisateur
      const token = await this.promptForToken();
      
      // Sauvegarder le token chiffré
      await this.saveEncryptedToken(token);
      
      return token;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du token: ${error}`);
    }
  }

  /**
   * Vérifie si le fichier de token existe
   */
  private async tokenExists(): Promise<boolean> {
    try {
      await fs.access(this.tokenFilePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Charge et déchiffre le token depuis le fichier
   */
  private async loadEncryptedToken(): Promise<string> {
    try {
      const encryptedData = await fs.readFile(this.tokenFilePath, 'utf8');
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedToken) {
        throw new Error('Impossible de déchiffrer le token');
      }
      
      return decryptedToken;
    } catch (error) {
      throw new Error(`Erreur lors du déchiffrement du token: ${error}`);
    }
  }

  /**
   * Chiffre et sauvegarde le token
   */
  private async saveEncryptedToken(token: string): Promise<void> {
    try {
      // Créer le répertoire si nécessaire
      await fs.ensureDir(STORAGE_PATHS.BINARY_ROOT_DIR);
      
      // Chiffrer le token
      const encryptedToken = CryptoJS.AES.encrypt(token, this.secretKey).toString();
      
      // Sauvegarder dans le fichier
      await fs.writeFile(this.tokenFilePath, encryptedToken, 'utf8');
      
      console.log(chalk.green('✅ Token sauvegardé de manière sécurisée'));
    } catch (error) {
      throw new Error(`Erreur lors de la sauvegarde du token: ${error}`);
    }
  }

  /**
   * Demande le token à l'utilisateur
   */
  private async promptForToken(): Promise<string> {
    console.log(chalk.cyan('\n🔐 Configuration du token Nexus'));
    console.log(chalk.gray('Votre token sera chiffré et stocké localement pour les prochaines utilisations.\n'));

    const answers = await inquirer.default.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Entrez votre token Nexus:',
        mask: '*',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Le token ne peut pas être vide';
          }
          if (input.length < 10) {
            return 'Le token semble trop court (minimum 10 caractères)';
          }
          return true;
        }
      }
    ]);

    return answers.token.trim();
  }

  /**
   * Valide le token en faisant un appel test à Nexus
   */
  private async validateToken(token: string): Promise<boolean> {
    // TODO: Implémenter la validation du token avec un appel à Nexus
    // Pour l'instant, on considère que le token est valide s'il existe
    return Boolean(token && token.length > 0);
  }

  /**
   * Supprime le fichier de token
   */
  async deleteToken(): Promise<void> {
    try {
      if (await this.tokenExists()) {
        await fs.remove(this.tokenFilePath);
        console.log(chalk.yellow('🗑️  Token supprimé'));
      }
    } catch (error) {
      console.error(chalk.red(`Erreur lors de la suppression du token: ${error}`));
    }
  }

  /**
   * Affiche des informations sur le token stocké
   */
  async getTokenInfo(): Promise<void> {
    try {
      if (await this.tokenExists()) {
        const stats = await fs.stat(this.tokenFilePath);
        console.log(chalk.blue('📋 Informations du token:'));
        console.log(chalk.gray(`   Fichier: ${this.tokenFilePath}`));
        console.log(chalk.gray(`   Modifié: ${stats.mtime.toLocaleString()}`));
        console.log(chalk.gray(`   Taille: ${stats.size} bytes`));
      } else {
        console.log(chalk.yellow('❌ Aucun token trouvé'));
      }
    } catch (error) {
      console.error(chalk.red(`Erreur lors de la lecture des informations: ${error}`));
    }
  }
} 