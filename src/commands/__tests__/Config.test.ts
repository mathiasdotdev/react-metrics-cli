import { vi } from 'vitest'
import { ConfigCommand } from '../Config'
import { mockConsole, TEST_TIMEOUT } from '../../__tests__/helpers/testSetup'
import { ConfigManager } from '../../core/config/ConfigManager'

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

    expect(consoleMocks.mockLog).toHaveBeenCalledWith(
      expect.stringContaining('📋 Informations de configuration React-Metrics')
    )
    expect(consoleMocks.mockLog).toHaveBeenCalledWith(
      expect.stringContaining('Extensions de fichiers: .js, .tsx')
    )
  }, TEST_TIMEOUT)

  it('should initialize configuration when init option is true', async () => {
    vi.mocked(ConfigManager.configExists).mockReturnValue(false)

    await configCommand.execute({ init: true })

    expect(ConfigManager.initConfig).toHaveBeenCalled()
    expect(consoleMocks.mockLog).toHaveBeenCalledWith(
      expect.stringContaining('# Fichier de configuration initialisé')
    )
  }, TEST_TIMEOUT)

  it('should show config help by default', async () => {
    vi.mocked(ConfigManager.configExists).mockReturnValue(true)

    await configCommand.execute({})

    expect(consoleMocks.mockLog).toHaveBeenCalledWith(
      expect.stringContaining('⚙️  Configuration React-Metrics')
    )
    expect(consoleMocks.mockLog).toHaveBeenCalledWith(
      expect.stringContaining('# Options disponibles:')
    )
    expect(consoleMocks.mockLog).toHaveBeenCalledWith(
      expect.stringContaining('📁 Emplacement:')
    )
  }, TEST_TIMEOUT)

  it('should show warning when no config file exists', async () => {
    vi.mocked(ConfigManager.configExists).mockReturnValue(false)

    await configCommand.execute({})

    expect(consoleMocks.mockLog).toHaveBeenCalledWith(
      expect.stringContaining('⚠️  Aucun fichier de configuration trouvé')
    )
    expect(consoleMocks.mockLog).toHaveBeenCalledWith(
      expect.stringContaining('💡 Utilisez --init pour créer')
    )
  }, TEST_TIMEOUT)

  it('should show warning when init overwrites existing config', async () => {
    vi.mocked(ConfigManager.configExists).mockReturnValue(true)

    await configCommand.execute({ init: true })

    expect(consoleMocks.mockLog).toHaveBeenCalledWith(
      expect.stringContaining('# Un fichier de configuration existe déjà')
    )
    expect(consoleMocks.mockLog).toHaveBeenCalledWith(
      expect.stringContaining('# Le fichier existant va être remplacé')
    )
  }, TEST_TIMEOUT)
})