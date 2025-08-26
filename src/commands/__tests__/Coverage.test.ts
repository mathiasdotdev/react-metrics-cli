import { vi } from 'vitest'
import { CoverageCommand } from '../Coverage'
import { mockConsole, mockProcessExit, mockEnv, TEST_TIMEOUT } from '../../__tests__/helpers/testSetup'
import { createMockBinaryManager, createMockBinaryExecutor } from '../../__tests__/helpers/mockBinary'

describe('CoverageCommand', () => {
  let coverageCommand: CoverageCommand
  let consoleMocks: ReturnType<typeof mockConsole>
  let processMocks: ReturnType<typeof mockProcessExit>
  let envRestore: () => void

  beforeEach(() => {
    consoleMocks = mockConsole()
    processMocks = mockProcessExit()
    envRestore = mockEnv({})
    coverageCommand = new CoverageCommand()
  })

  afterEach(() => {
    consoleMocks.restore()
    processMocks.restore()
    envRestore()
    vi.restoreAllMocks()
  })

  it('should execute coverage analysis successfully', async () => {
    const mockBinaryManager = createMockBinaryManager()
    mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/binary')
    ;(coverageCommand as any).binaryManager = mockBinaryManager

    const mockExecutor = createMockBinaryExecutor('success')
    vi.doMock('../../core/binary/BinaryExecutor', () => ({
      BinaryExecutor: vi.fn(() => mockExecutor)
    }))

    await coverageCommand.execute({})

    expect(consoleMocks.mockLog).toHaveBeenCalledWith(
      expect.stringContaining('🔍 Analyse de couverture:')
    )
    expect(consoleMocks.mockLog).toHaveBeenCalledWith(
      expect.stringContaining('✅ Analyse de couverture terminée avec succès')
    )
  }, TEST_TIMEOUT)

  it('should generate custom HTML report', async () => {
    const customHtmlPath = '/custom/coverage-report.html'
    const mockBinaryManager = createMockBinaryManager()
    mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/binary')
    ;(coverageCommand as any).binaryManager = mockBinaryManager

    const mockExecutor = createMockBinaryExecutor('success')
    vi.doMock('../../core/binary/BinaryExecutor', () => ({
      BinaryExecutor: vi.fn(() => mockExecutor)
    }))

    await coverageCommand.execute({ html: customHtmlPath })

    expect(consoleMocks.mockLog).toHaveBeenCalledWith(
      expect.stringContaining(`📄 Rapport HTML: ${customHtmlPath}`)
    )
  }, TEST_TIMEOUT)
})