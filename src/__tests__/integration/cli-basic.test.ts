import { jest } from '@jest/globals'
import { CLITestRunner, expectSuccessfulExit, expectErrorExit, expectOutputContains } from '../helpers/cliTestRunner'
import { TEST_TIMEOUT } from '../helpers/testSetup'

describe('CLI Integration Tests - Basic', () => {
  let cliRunner: CLITestRunner

  beforeAll(async () => {
    // Build the CLI first
    const { spawn } = require('child_process')
    await new Promise<void>((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], { cwd: process.cwd() })
      buildProcess.on('close', (code: number) => {
        if (code === 0) resolve()
        else reject(new Error(`Build failed with code ${code}`))
      })
    })
    
    cliRunner = new CLITestRunner()
  })

  it('should display help when --help flag is used', async () => {
    const result = await cliRunner.testHelp()
    
    expectSuccessfulExit(result)
    expectOutputContains(result, 'React Metrics CLI')
    expectOutputContains(result, 'Commandes disponibles')
    expectOutputContains(result, 'analyze')
    expectOutputContains(result, 'coverage')
    expectOutputContains(result, 'download')
    expectOutputContains(result, 'config')
  }, TEST_TIMEOUT)

  it('should display version when --version flag is used', async () => {
    const result = await cliRunner.testVersion()
    
    expectSuccessfulExit(result)
    expectOutputContains(result, '1.4.0')
  }, TEST_TIMEOUT)

  it('should display quick help when no arguments provided', async () => {
    const result = await cliRunner.run()
    
    expectSuccessfulExit(result)
    expectOutputContains(result, 'React Metrics CLI')
    expectOutputContains(result, 'État de la configuration')
  }, TEST_TIMEOUT)

  it('should handle invalid command gracefully', async () => {
    const result = await cliRunner.run({ args: ['invalid-command'] })
    
    expectErrorExit(result)
  }, TEST_TIMEOUT)

  it('should show analyze command help', async () => {
    const result = await cliRunner.run({ args: ['analyze', '--help'] })
    
    expectSuccessfulExit(result)
    expectOutputContains(result, 'analyze')
    expectOutputContains(result, '--debug')
    expectOutputContains(result, '--local')
  }, TEST_TIMEOUT)

  it('should show coverage command help', async () => {
    const result = await cliRunner.run({ args: ['coverage', '--help'] })
    
    expectSuccessfulExit(result)
    expectOutputContains(result, 'coverage')
    expectOutputContains(result, '--html')
    expectOutputContains(result, '--local')
  }, TEST_TIMEOUT)

  it('should show download command help', async () => {
    const result = await cliRunner.run({ args: ['download', '--help'] })
    
    expectSuccessfulExit(result)
    expectOutputContains(result, 'download')
    expectOutputContains(result, '--version')
    expectOutputContains(result, '--groupId')
    expectOutputContains(result, '--artifactId')
  }, TEST_TIMEOUT)

  it('should show config command help', async () => {
    const result = await cliRunner.run({ args: ['config', '--help'] })
    
    expectSuccessfulExit(result)
    expectOutputContains(result, 'config')
    expectOutputContains(result, '--info')
    expectOutputContains(result, '--reset')
  }, TEST_TIMEOUT)
})