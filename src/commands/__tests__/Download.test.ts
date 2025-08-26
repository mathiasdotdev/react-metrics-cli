import { vi } from 'vitest'
import { DownloadCommand } from '../Download'
import { mockConsole, mockProcessExit, TEST_TIMEOUT } from '../../__tests__/helpers/testSetup'
import { createMockBinaryManager } from '../../__tests__/helpers/mockBinary'

describe('DownloadCommand', () => {
  let downloadCommand: DownloadCommand
  let consoleMocks: ReturnType<typeof mockConsole>
  let processMocks: ReturnType<typeof mockProcessExit>

  beforeEach(() => {
    consoleMocks = mockConsole()
    processMocks = mockProcessExit()
    downloadCommand = new DownloadCommand()
  })

  afterEach(() => {
    consoleMocks.restore()
    processMocks.restore()
    vi.restoreAllMocks()
  })

  it('should download latest react-metrics binary', async () => {
    const mockBinaryManager = createMockBinaryManager()
    mockBinaryManager.downloadReactMetricsBinary.mockResolvedValue('/path/to/downloaded/binary')
    ;(downloadCommand as any).binaryManager = mockBinaryManager

    await downloadCommand.execute({})

    expect(mockBinaryManager.downloadReactMetricsBinary).toHaveBeenCalledWith(undefined)
    expect(consoleMocks.mockLog).toHaveBeenCalledWith(
      expect.stringContaining('Binaire téléchargé : /path/to/downloaded/binary')
    )
  }, TEST_TIMEOUT)

  it('should use advanced mode with custom parameters', async () => {
    const mockBinaryManager = createMockBinaryManager()
    mockBinaryManager.downloadArtifact.mockResolvedValue('/path/to/custom/artifact')
    ;(downloadCommand as any).binaryManager = mockBinaryManager

    await downloadCommand.execute({ 
      groupId: 'fr.maif.custom',
      artifactId: 'custom-tool',
      version: '2.0.0'
    })

    expect(mockBinaryManager.downloadArtifact).toHaveBeenCalledWith(
      'fr.maif.custom',
      'custom-tool',
      '2.0.0',
      'react-metrics-artefacts',
      'raw'
    )
  }, TEST_TIMEOUT)
})