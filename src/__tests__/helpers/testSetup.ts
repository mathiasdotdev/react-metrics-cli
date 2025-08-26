import { vi } from 'vitest'

// Configuration globale des tests
export const TEST_TIMEOUT = 30000

// Mock du process.env pour les tests
export const mockEnv = (envVars: Record<string, string>) => {
  const original = process.env
  process.env = { ...original, ...envVars }
  
  return () => {
    process.env = original
  }
}

// Mock des console logs pour les tests
export const mockConsole = () => {
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn
  
  const mockLog = vi.fn()
  const mockError = vi.fn()
  const mockWarn = vi.fn()
  
  console.log = mockLog
  console.error = mockError
  console.warn = mockWarn
  
  return {
    mockLog,
    mockError,
    mockWarn,
    restore: () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }
  }
}

// Mock du process.exit pour les tests
export const mockProcessExit = () => {
  const originalExit = process.exit
  const mockExit = vi.fn<never>()
  process.exit = mockExit as never
  
  return {
    mockExit,
    restore: () => {
      process.exit = originalExit
    }
  }
}

// Helper pour créer un répertoire temporaire de test
export const createTempDir = (): string => {
  const os = require('os')
  const path = require('path')
  const fs = require('fs')
  
  const tempDir = path.join(os.tmpdir(), `react-metrics-test-${Date.now()}`)
  fs.mkdirSync(tempDir, { recursive: true })
  
  return tempDir
}

// Helper pour nettoyer un répertoire temporaire
export const cleanupTempDir = (dirPath: string): void => {
  const fs = require('fs')
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true })
  }
}

// Mock des fichiers système pour les tests
export const mockFileSystem = () => {
  const fs = require('fs')
  const originalExistsSync = fs.existsSync
  const originalReadFileSync = fs.readFileSync
  
  const mockExistsSync = vi.fn()
  const mockReadFileSync = vi.fn()
  
  fs.existsSync = mockExistsSync
  fs.readFileSync = mockReadFileSync
  
  return {
    mockExistsSync,
    mockReadFileSync,
    restore: () => {
      fs.existsSync = originalExistsSync
      fs.readFileSync = originalReadFileSync
    }
  }
}