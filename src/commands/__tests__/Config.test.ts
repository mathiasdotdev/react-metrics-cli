import { vi } from 'vitest'

// Mock Logger au niveau du fichier
vi.mock('../../ui/logger/Logger', () => ({
  Logger: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    config: vi.fn(),
    cleanup: vi.fn(),
    credentials: vi.fn(),
    colored: vi.fn(),
    analysis: vi.fn(),
    separator: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    log: vi.fn(),
    newLine: vi.fn(),
    list: vi.fn(),
    files: vi.fn(),
    settings: vi.fn(),
    report: vi.fn(),
    examples: vi.fn()
  }
}))

import { ConfigCommand } from '../Config'
import { mockConsole, TEST_TIMEOUT } from '../../__tests__/helpers/testSetup'
import { ConfigManager } from '../../core/config/ConfigManager'
import { Logger } from '../../ui/logger/Logger'

// Mock ConfigManager
vi.mock('../../core/config/ConfigManager', () => ({
  ConfigManager: {
    configExists: vi.fn(),
    loadConfig: vi.fn(),
    initConfig: vi.fn(),
    getConfigPath: vi.fn(() => '/home/user/.nexus-utils/react-metrics.json')
  }
}))

describe('ConfigCommand', () => {
  let configCommand: ConfigCommand
  let consoleMocks: ReturnType<typeof mockConsole>

  beforeEach(() => {
    consoleMocks = mockConsole()
    configCommand = new ConfigCommand()
    vi.clearAllMocks()
  })

  afterEach(() => {
    consoleMocks.restore()
    vi.restoreAllMocks()
  })

  it('should show info when info option is true', async () => {
    const mockConfig = {
      fileExtensions: ['.js', '.tsx'],
      maxGoroutines: 20,
      ignoredFolders: ['node_modules'],
      otherIgnoredFolders: [],
      ignoreAnnotations: true,
      reports: { terminal: true, html: false, json: false },
      analysis: { 
        constants: true, 
        functions: true, 
        classes: true, 
        props: true, 
        consoles: true, 
        imports: true, 
        dependencies: false 
      }
    }
    
    vi.mocked(ConfigManager.configExists).mockReturnValue(true)
    vi.mocked(ConfigManager.loadConfig).mockReturnValue(mockConfig)

    await configCommand.execute({ info: true })

    expect(Logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Informations de configuration React-Metrics')
    )
    expect(Logger.list).toHaveBeenCalledWith(
      expect.stringContaining('Extensions de fichiers: .js, .tsx')
    )
  }, TEST_TIMEOUT)

  it('should initialize configuration when init option is true', async () => {
    vi.mocked(ConfigManager.configExists).mockReturnValue(false)

    await configCommand.execute({ init: true })

    expect(ConfigManager.initConfig).toHaveBeenCalled()
    expect(Logger.success).toHaveBeenCalledWith(
      expect.stringContaining('Fichier de configuration initialisé')
    )
  }, TEST_TIMEOUT)

  it('should show config help by default', async () => {
    vi.mocked(ConfigManager.configExists).mockReturnValue(true)

    await configCommand.execute({})

    expect(Logger.settings).toHaveBeenCalledWith(
      expect.stringContaining('Configuration React-Metrics')
    )
    expect(Logger.settings).toHaveBeenCalledWith(
      expect.stringContaining('Options disponibles:')
    )
    expect(Logger.files).toHaveBeenCalledWith(
      expect.stringContaining('Emplacement:')
    )
  }, TEST_TIMEOUT)

  it('should show warning when no config file exists', async () => {
    vi.mocked(ConfigManager.configExists).mockReturnValue(false)

    await configCommand.execute({})

    expect(Logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Aucun fichier de configuration trouvé')
    )
    expect(Logger.log).toHaveBeenCalledWith(
      expect.stringContaining('💡 Utilisez --init pour créer')
    )
  }, TEST_TIMEOUT)

  it('should show warning when init overwrites existing config', async () => {
    vi.mocked(ConfigManager.configExists).mockReturnValue(true)

    await configCommand.execute({ init: true })

    expect(Logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Un fichier de configuration existe déjà')
    )
    expect(Logger.log).toHaveBeenCalledWith(
      expect.stringContaining('Le fichier existant va être remplacé')
    )
  }, TEST_TIMEOUT)
})