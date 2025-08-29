import * as fs from 'fs'
import * as path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigManager, ReactMetricsConfig } from '../ConfigManager'

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  unlinkSync: vi.fn(),
}))

// Mock os module
vi.mock('os', () => ({
  homedir: vi.fn(() => '/mock/home'),
}))

// Mock Logger module
vi.mock('../../ui/logger/Logger', () => ({
  Logger: {
    error: vi.fn(),
  },
}))

describe('ConfigManager', () => {
  const mockConfigPath = path.join(
    '/mock/home',
    '.nexus-utils',
    'react-metrics.json'
  )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getDefaultConfig', () => {
    it('should return default configuration', () => {
      const config = ConfigManager.getDefaultConfig()

      expect(config).toEqual({
        fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
        maxGoroutines: 20,
        ignoredFolders: ['node_modules', '.git', 'dist', 'build', 'coverage'],
        otherIgnoredFolders: [],
        ignoreAnnotations: true,
        reports: {
          terminal: true,
          html: false,
          json: false,
        },
        analysis: {
          constants: true,
          functions: true,
          classes: true,
          props: true,
          consoles: true,
          imports: true,
          dependencies: false,
        },
      })
    })
  })

  describe('configExists', () => {
    it('should return true when config file exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)

      expect(ConfigManager.configExists()).toBe(true)
      expect(fs.existsSync).toHaveBeenCalledWith(mockConfigPath)
    })

    it('should return false when config file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      expect(ConfigManager.configExists()).toBe(false)
      expect(fs.existsSync).toHaveBeenCalledWith(mockConfigPath)
    })
  })

  describe('loadConfig', () => {
    it('should return default config when file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const config = ConfigManager.loadConfig()

      expect(config).toEqual(ConfigManager.getDefaultConfig())
    })

    it('should load and merge config from file when it exists', () => {
      const mockFileConfig = {
        maxGoroutines: 30,
        reports: {
          terminal: false,
          html: true,
          json: true,
        },
      }

      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockFileConfig))

      const config = ConfigManager.loadConfig()

      expect(fs.readFileSync).toHaveBeenCalledWith(mockConfigPath, 'utf-8')
      expect(config.maxGoroutines).toBe(30)
      expect(config.reports.html).toBe(true)
      expect(config.fileExtensions).toEqual(['.js', '.jsx', '.ts', '.tsx']) // Should keep default
    })

    it('should return default config when JSON parsing fails', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue('invalid json')

      const config = ConfigManager.loadConfig()

      expect(config).toEqual(ConfigManager.getDefaultConfig())
    })

    it('should return default config when file read fails', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('File read error')
      })

      const config = ConfigManager.loadConfig()

      expect(config).toEqual(ConfigManager.getDefaultConfig())
    })
  })

  describe('saveConfig', () => {
    it('should create directory and save config', () => {
      const mockConfig: ReactMetricsConfig = {
        ...ConfigManager.getDefaultConfig(),
        maxGoroutines: 25,
      }

      vi.mocked(fs.existsSync).mockReturnValue(false)

      ConfigManager.saveConfig(mockConfig)

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join('/mock/home', '.nexus-utils'),
        { recursive: true }
      )
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        mockConfigPath,
        JSON.stringify(mockConfig, null, 2),
        'utf-8'
      )
    })

    it('should save config without creating directory if it exists', () => {
      const mockConfig: ReactMetricsConfig = ConfigManager.getDefaultConfig()

      vi.mocked(fs.existsSync).mockReturnValue(true)

      ConfigManager.saveConfig(mockConfig)

      expect(fs.mkdirSync).not.toHaveBeenCalled()
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        mockConfigPath,
        JSON.stringify(mockConfig, null, 2),
        'utf-8'
      )
    })
  })

  describe('initConfig', () => {
    it('should initialize config with default values', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      ConfigManager.initConfig()

      expect(fs.mkdirSync).toHaveBeenCalled()
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        mockConfigPath,
        JSON.stringify(ConfigManager.getDefaultConfig(), null, 2),
        'utf-8'
      )
    })
  })

  describe('getConfigPath', () => {
    it('should return correct config file path', () => {
      const configPath = ConfigManager.getConfigPath()
      expect(configPath).toBe(mockConfigPath)
    })
  })

  describe('resetConfig', () => {
    it('should delete config file when it exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)

      ConfigManager.resetConfig()

      expect(fs.unlinkSync).toHaveBeenCalledWith(mockConfigPath)
    })

    it('should not delete config file when it does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      ConfigManager.resetConfig()

      expect(fs.unlinkSync).not.toHaveBeenCalled()
    })
  })
})
