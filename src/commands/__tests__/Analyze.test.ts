import { vi } from 'vitest'
import { AnalyzeCommand } from '../Analyze'
import { mockConsole, mockProcessExit, mockEnv, TEST_TIMEOUT } from '../../__tests__/helpers/testSetup'
import { createMockBinaryManager, createMockBinaryExecutor, MockBinary } from '../../__tests__/helpers/mockBinary'

describe('AnalyzeCommand', () => {
  let analyzeCommand: AnalyzeCommand
  let consoleMocks: ReturnType<typeof mockConsole>
  let processMocks: ReturnType<typeof mockProcessExit>
  let envRestore: () => void

  beforeEach(() => {
    // Mock des dépendances
    consoleMocks = mockConsole()
    processMocks = mockProcessExit()
    envRestore = mockEnv({})
    
    analyzeCommand = new AnalyzeCommand()
  })

  afterEach(() => {
    consoleMocks.restore()
    processMocks.restore()
    envRestore()
    vi.restoreAllMocks()
  })

  describe('execute', () => {
    it('should execute analysis successfully with default options', async () => {
      // Mock BinaryManager
      const mockBinaryManager = createMockBinaryManager()
      mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/binary')
      ;(analyzeCommand as any).binaryManager = mockBinaryManager

      // Mock BinaryExecutor
      const mockResult = MockBinary.mockExecution('success')
      const mockExecutor = createMockBinaryExecutor('success')
      
      // Mock the constructor
      vi.doMock('../../core/binary/BinaryExecutor', () => ({
        BinaryExecutor: vi.fn(() => mockExecutor)
      }))

      await analyzeCommand.execute({})

      expect(mockBinaryManager.downloadReactMetricsBinary).toHaveBeenCalled()
      expect(consoleMocks.mockLog).toHaveBeenCalledWith(
        expect.stringContaining('🔍 Analyse du projet:')
      )
      expect(consoleMocks.mockLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ Analyse terminée avec succès')
      )
    }, TEST_TIMEOUT)

    it('should activate local mode when local option is true', async () => {
      const mockBinaryManager = createMockBinaryManager()
      mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/binary')
      ;(analyzeCommand as any).binaryManager = mockBinaryManager

      const mockExecutor = createMockBinaryExecutor('success')
      vi.doMock('../../core/binary/BinaryExecutor', () => ({
        BinaryExecutor: vi.fn(() => mockExecutor)
      }))

      await analyzeCommand.execute({ local: true })

      expect(process.env.NEXUS_LOCAL).toBe('true')
      expect(consoleMocks.mockLog).toHaveBeenCalledWith(
        expect.stringContaining('🏠 Mode local activé')
      )
    }, TEST_TIMEOUT)

    it('should enable debug mode when debug option is true', async () => {
      const mockBinaryManager = createMockBinaryManager()
      mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/binary')
      ;(analyzeCommand as any).binaryManager = mockBinaryManager

      const mockExecutor = createMockBinaryExecutor('success')
      vi.doMock('../../core/binary/BinaryExecutor', () => ({
        BinaryExecutor: vi.fn(() => mockExecutor)
      }))

      await analyzeCommand.execute({ debug: true })

      expect(consoleMocks.mockLog).toHaveBeenCalledWith(
        expect.stringContaining('🐛 Mode debug activé')
      )
      expect(consoleMocks.mockLog).toHaveBeenCalledWith(
        expect.stringContaining('📝 Logs debug disponibles')
      )
    }, TEST_TIMEOUT)

    it('should use custom path when provided', async () => {
      const customPath = '/custom/project/path'
      const mockBinaryManager = createMockBinaryManager()
      mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/binary')
      ;(analyzeCommand as any).binaryManager = mockBinaryManager

      const mockExecutor = createMockBinaryExecutor('success')
      vi.doMock('../../core/binary/BinaryExecutor', () => ({
        BinaryExecutor: vi.fn(() => mockExecutor)
      }))

      await analyzeCommand.execute({ path: customPath })

      expect(consoleMocks.mockLog).toHaveBeenCalledWith(
        expect.stringContaining(`🔍 Analyse du projet: ${customPath}`)
      )
    }, TEST_TIMEOUT)

    it('should handle binary download failure', async () => {
      const mockBinaryManager = createMockBinaryManager()
      mockBinaryManager.downloadReactMetricsBinary.mockRejectedValue(
        new Error('Credentials Nexus manquants')
      )
      ;(analyzeCommand as any).binaryManager = mockBinaryManager

      await analyzeCommand.execute({})

      expect(consoleMocks.mockError).toHaveBeenCalledWith(
        expect.stringContaining('❌ Échec du téléchargement')
      )
      expect(consoleMocks.mockError).toHaveBeenCalledWith(
        expect.stringContaining('💡 Credentials Nexus non configurés')
      )
      expect(processMocks.mockExit).toHaveBeenCalledWith(1)
    }, TEST_TIMEOUT)

    it('should handle network connection errors', async () => {
      const mockBinaryManager = createMockBinaryManager()
      mockBinaryManager.downloadReactMetricsBinary.mockRejectedValue(
        new Error('ENOTFOUND nexus.example.com')
      )
      ;(analyzeCommand as any).binaryManager = mockBinaryManager

      await analyzeCommand.execute({})

      expect(consoleMocks.mockError).toHaveBeenCalledWith(
        expect.stringContaining('❌ Échec du téléchargement')
      )
      expect(consoleMocks.mockError).toHaveBeenCalledWith(
        expect.stringContaining('💡 Serveur Nexus inaccessible')
      )
      expect(processMocks.mockExit).toHaveBeenCalledWith(1)
    }, TEST_TIMEOUT)

    it('should handle binary execution failure', async () => {
      const mockBinaryManager = createMockBinaryManager()
      mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/binary')
      ;(analyzeCommand as any).binaryManager = mockBinaryManager

      const mockExecutor = createMockBinaryExecutor('error')
      vi.doMock('../../core/binary/BinaryExecutor', () => ({
        BinaryExecutor: vi.fn(() => mockExecutor)
      }))

      await analyzeCommand.execute({})

      expect(consoleMocks.mockError).toHaveBeenCalledWith(
        expect.stringContaining('❌ L\'analyse a échoué')
      )
      expect(processMocks.mockExit).toHaveBeenCalledWith(1)
    }, TEST_TIMEOUT)

    it('should handle missing binary error (ENOENT)', async () => {
      const mockBinaryManager = createMockBinaryManager()
      mockBinaryManager.downloadReactMetricsBinary.mockRejectedValue(
        new Error('spawn ENOENT')
      )
      ;(analyzeCommand as any).binaryManager = mockBinaryManager

      await analyzeCommand.execute({})

      expect(consoleMocks.mockError).toHaveBeenCalledWith(
        expect.stringContaining('❌ Binaire react-metrics non trouvé')
      )
      expect(consoleMocks.mockError).toHaveBeenCalledWith(
        expect.stringContaining('💡 Utilisez "react-metrics download"')
      )
      expect(processMocks.mockExit).toHaveBeenCalledWith(1)
    }, TEST_TIMEOUT)
  })
})