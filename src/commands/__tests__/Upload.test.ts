import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs-extra'
import * as path from 'path'
import { UploadCommand } from '../Upload'
import { TokenManager } from '../../core/nexus/TokenManager'
import { Logger } from '../../ui/logger/Logger'

// Mock des dépendances
vi.mock('fs-extra', () => ({
  pathExists: vi.fn(),
  stat: vi.fn(),
  readdir: vi.fn(),
}))
vi.mock('../../core/nexus/TokenManager')
vi.mock('../../ui/logger/Logger')
vi.mock('../../ui/display/LogoDisplay')

const mockFs = vi.mocked(fs)
const mockTokenManager = vi.mocked(TokenManager)
const mockLogger = vi.mocked(Logger, true)

describe('UploadCommand', () => {
  let uploadCommand: UploadCommand

  beforeEach(() => {
    uploadCommand = new UploadCommand()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('execute', () => {
    it('devrait valider le format de version', async () => {
      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)

      await uploadCommand.execute({
        version: 'invalid-version'
      })

      expect(mockLogger.error).toHaveBeenCalledWith('Version invalide: invalid-version')
      expect(mockLogger.info).toHaveBeenCalledWith('Format attendu: x.y.z (ex: 1.0.0)')
      mockExit.mockRestore()
    })

    it('devrait détecter l\'absence de binaires', async () => {
      mockFs.pathExists.mockResolvedValue(false)

      await uploadCommand.execute({
        version: '1.0.0'
      })

      expect(mockLogger.error).toHaveBeenCalledWith('Aucun binaire trouvé dans react-metrics/dist/binaries/')
      expect(mockLogger.info).toHaveBeenCalledWith('Exécutez d\'abord: cd ../react-metrics && make build')
    })

    it('devrait exécuter en mode dry-run par défaut', async () => {
      // Mock du système de fichiers
      mockFs.pathExists.mockResolvedValue(true)
      mockFs.stat.mockResolvedValue({ size: 1024 * 1024 } as any)

      await uploadCommand.execute({
        version: '1.0.0',
        dryRun: true
      })

      expect(mockLogger.warn).toHaveBeenCalledWith('🧪 MODE DRY-RUN - Simulation uniquement')
      expect(mockLogger.success).toHaveBeenCalledWith('✅ Simulation terminée - utilisez --no-dry-run pour l\'upload réel')
    })

    it('devrait demander l\'authentification en mode réel', async () => {
      // Mock du système de fichiers avec des chemins spécifiques
      mockFs.pathExists.mockImplementation(async (filePath: string) => {
        // Le répertoire binaries existe
        if (filePath.includes('dist/binaries') && !filePath.includes('.exe') && !filePath.includes('react-metrics-')) {
          return true
        }
        // Tous les binaires attendus existent
        if (filePath.includes('react-metrics-linux-amd64') || 
            filePath.includes('react-metrics-linux-arm64') ||
            filePath.includes('react-metrics-darwin-amd64') ||
            filePath.includes('react-metrics-darwin-arm64') ||
            filePath.includes('react-metrics-windows-amd64.exe') ||
            filePath.includes('react-metrics-windows-arm64.exe')) {
          return true
        }
        return false
      })
      
      mockFs.stat.mockResolvedValue({ size: 1024 * 1024 } as any)

      // Mock du TokenManager - on mock l'instance créée dans le constructeur
      const mockGetAuthToken = vi.fn().mockResolvedValue('dXNlcjpwYXNzd29yZA==')
      vi.spyOn(uploadCommand['tokenManager'], 'getAuthToken').mockImplementation(mockGetAuthToken)

      // Mock des méthodes privées de UploadCommand
      const findBinariesSpy = vi.spyOn(uploadCommand as any, 'findBinaries').mockResolvedValue([
        { name: 'react-metrics-linux-amd64', path: '/mock/path/react-metrics-linux-amd64', size: 1024 * 1024, platformArch: 'linux-amd64', extension: 'bin' }
      ])
      const testConnectivitySpy = vi.spyOn(uploadCommand as any, 'testConnectivity').mockResolvedValue(true)
      const uploadAllBinariesSpy = vi.spyOn(uploadCommand as any, 'uploadAllBinaries').mockResolvedValue({ successful: 1, failed: 0 })
      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)

      await uploadCommand.execute({
        version: '1.0.0',
        dryRun: false
      })

      // Vérifications des étapes d'authentification
      expect(mockLogger.credentials).toHaveBeenCalledWith('Authentification Nexus requise...')
      expect(mockGetAuthToken).toHaveBeenCalled()
      expect(testConnectivitySpy).toHaveBeenCalled()
      expect(uploadAllBinariesSpy).toHaveBeenCalled()

      findBinariesSpy.mockRestore()
      testConnectivitySpy.mockRestore()
      uploadAllBinariesSpy.mockRestore()
      mockExit.mockRestore()
    })

    it('devrait gérer les erreurs d\'upload', async () => {
      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)

      // Simuler une erreur
      mockFs.pathExists.mockRejectedValue(new Error('Erreur filesystem'))

      await uploadCommand.execute({
        version: '1.0.0'
      })

      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Erreur lors de l\'upload:'))
      expect(mockExit).toHaveBeenCalledWith(1)
      mockExit.mockRestore()
    })
  })

  describe('findBinaries', () => {
    it('devrait trouver tous les binaires attendus', async () => {
      // Utiliser une méthode pour accéder à la méthode privée
      const findBinariesMethod = (uploadCommand as any).findBinaries.bind(uploadCommand)

      mockFs.pathExists.mockImplementation(async (filePath: string) => {
        return filePath.includes('binaries') || filePath.includes('react-metrics-')
      })

      mockFs.stat.mockResolvedValue({ size: 5 * 1024 * 1024 } as any)

      const binaries = await findBinariesMethod()

      expect(binaries).toHaveLength(6)
      expect(binaries.map((b: any) => b.platformArch)).toEqual([
        'linux-amd64',
        'linux-arm64', 
        'darwin-amd64',
        'darwin-arm64',
        'windows-amd64',
        'windows-arm64'
      ])
    })

    it('devrait retourner un tableau vide si le dossier n\'existe pas', async () => {
      const findBinariesMethod = (uploadCommand as any).findBinaries.bind(uploadCommand)

      mockFs.pathExists.mockResolvedValue(false)

      const binaries = await findBinariesMethod()

      expect(binaries).toHaveLength(0)
    })
  })

  describe('decodeBase64Token', () => {
    it('devrait décoder correctement un token base64', () => {
      const decodeMethod = (uploadCommand as any).decodeBase64Token.bind(uploadCommand)
      const base64Token = Buffer.from('testuser:testpassword', 'utf8').toString('base64')

      const result = decodeMethod(base64Token)

      expect(result).toEqual({
        username: 'testuser',
        password: 'testpassword'
      })
    })
  })

  describe('isValidVersion', () => {
    it('devrait valider les formats de version corrects', () => {
      const isValidVersionMethod = (uploadCommand as any).isValidVersion.bind(uploadCommand)

      expect(isValidVersionMethod('1.0.0')).toBe(true)
      expect(isValidVersionMethod('12.34.56')).toBe(true)
      expect(isValidVersionMethod('1.0.0-beta')).toBe(true)
      expect(isValidVersionMethod('2.1.3-rc1')).toBe(true)
    })

    it('devrait rejeter les formats de version incorrects', () => {
      const isValidVersionMethod = (uploadCommand as any).isValidVersion.bind(uploadCommand)

      expect(isValidVersionMethod('1.0')).toBe(false)
      expect(isValidVersionMethod('v1.0.0')).toBe(false)
      expect(isValidVersionMethod('1.0.0.0')).toBe(false)
      expect(isValidVersionMethod('invalid')).toBe(false)
    })
  })

  describe('formatBytes', () => {
    it('devrait formater correctement les tailles', () => {
      const formatBytesMethod = (uploadCommand as any).formatBytes.bind(uploadCommand)

      expect(formatBytesMethod(0)).toBe('0 B')
      expect(formatBytesMethod(1024)).toBe('1.0 KB')
      expect(formatBytesMethod(1024 * 1024)).toBe('1.0 MB')
      expect(formatBytesMethod(1024 * 1024 * 1024)).toBe('1.0 GB')
      expect(formatBytesMethod(1536)).toBe('1.5 KB')
    })
  })

  describe('extractPlatformArch', () => {
    it('devrait extraire correctement la plateforme et l\'architecture', () => {
      const extractMethod = (uploadCommand as any).extractPlatformArch.bind(uploadCommand)

      expect(extractMethod('react-metrics-linux-amd64')).toBe('linux-amd64')
      expect(extractMethod('react-metrics-linux-arm64')).toBe('linux-arm64')
      expect(extractMethod('react-metrics-darwin-amd64')).toBe('darwin-amd64')
      expect(extractMethod('react-metrics-darwin-arm64')).toBe('darwin-arm64')
      expect(extractMethod('react-metrics-windows-amd64.exe')).toBe('windows-amd64')
      expect(extractMethod('react-metrics-windows-arm64.exe')).toBe('windows-arm64')
    })

    it('devrait lever une erreur pour un nom non reconnu', () => {
      const extractMethod = (uploadCommand as any).extractPlatformArch.bind(uploadCommand)

      expect(() => extractMethod('unknown-binary')).toThrow('Nom de binaire non reconnu: unknown-binary')
    })
  })

  describe('getExtension', () => {
    it('devrait déterminer l\'extension correcte', () => {
      const getExtensionMethod = (uploadCommand as any).getExtension.bind(uploadCommand)

      expect(getExtensionMethod('react-metrics-windows-amd64.exe')).toBe('exe')
      expect(getExtensionMethod('react-metrics-linux-amd64')).toBe('bin')
      expect(getExtensionMethod('react-metrics-darwin-arm64')).toBe('bin')
    })
  })
})