import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { Logger } from '../../ui/logger/Logger'

// Charger les variables d'environnement
dotenv.config()

const NEXUS_UTILS_DIR = path.join(os.homedir(), '.nexus-utils')

export const STORAGE_PATHS = {
  BINARY_ROOT_DIR: NEXUS_UTILS_DIR,
  ARTIFACTS_DIR: path.join(NEXUS_UTILS_DIR, 'artifacts'),
  CREDENTIALS_FILE: path.join(NEXUS_UTILS_DIR, '.credentials'),
  CONFIG_FILE: path.join(NEXUS_UTILS_DIR, 'react-metrics.json'),
  CACHE_DIR: path.join(NEXUS_UTILS_DIR, 'cache'),
  BINARY_FILENAME: getBinaryFilename(NEXUS_UTILS_DIR),
}

function extractVersionFromBinary(binaryPath: string): string {
  try {
    if (!fs.existsSync(binaryPath)) {
      return '1.0.0'
    }
    const filename = path.basename(binaryPath)
    // Pour les noms simplifiés comme "windows-amd64.exe", on ne peut pas détecter la version
    // depuis le nom. On va utiliser une version par défaut ou la récupérer ailleurs
    const match =
      filename.match(/react-metrics-([\d.]+)-/) || filename.match(/([\d.]+)/)
    return match ? match[1] : '1.0.0'
  } catch (error) {
    Logger.warn('Impossible de détecter la version du binaire:', error)
    return '1.0.0'
  }
}

function getBinaryFilename(binaryRootDir: string): string {
  const platform = process.platform
  const arch = process.arch
  const binaryPath = path.join(binaryRootDir, getBaseBinaryName(platform, arch))
  const currentVersion = extractVersionFromBinary(binaryPath)
  return getVersionedBinaryName(platform, arch, currentVersion)
}

function getBaseBinaryName(platform: string, arch: string): string {
  switch (platform) {
    case 'win32':
      return arch === 'x64' ? 'windows-amd64.exe' : 'windows-arm64.exe'
    case 'darwin':
      return arch === 'x64' ? 'darwin-amd64.bin' : 'darwin-arm64.bin'
    case 'linux':
      return arch === 'x64' ? 'linux-amd64.bin' : 'linux-arm64.bin'
    default:
      throw new Error(`Plateforme non supportée: ${platform}-${arch}`)
  }
}

function getVersionedBinaryName(
  platform: string,
  arch: string,
  version: string
): string {
  switch (platform) {
    case 'win32':
      return arch === 'x64'
        ? 'windows-amd64.exe'
        : `windows-arm64-${version}.exe`
    case 'darwin':
      return arch === 'x64' ? 'darwin-amd64.bin' : `darwin-arm64-${version}.bin`
    case 'linux':
      return arch === 'x64' ? 'linux-amd64.bin' : `linux-arm64-${version}.bin`
    default:
      throw new Error(`Plateforme non supportée: ${platform}-${arch}`)
  }
}

export const DOWNLOAD_URLS = {
  getDownloadUrl: (nexusConfig: NexusConfig, version: string): string => {
    const filename = getVersionedBinaryName(
      process.platform,
      process.arch,
      version
    )
    // Structure: group/react-metrics/version/filename
    return `${nexusConfig.repositoryUrl}/${nexusConfig.group}/react-metrics/${version}/${filename}`
  },
}

export const TIMEOUTS = {
  DOWNLOAD: parseInt(process.env.DOWNLOAD_TIMEOUT || '300000'),
  EXECUTION: parseInt(process.env.EXECUTION_TIMEOUT || '600000'),
}

// Types et helpers pour la config Nexus
export interface NexusConfig {
  repositoryUrl: string
  repository: string
  group: string
  token: string
}

export const NEXUS_CONFIG = {
  URL_LOCAL: process.env.NEXUS_URL_LOCAL || 'http://localhost:8081',
  URL_PROD: process.env.NEXUS_URL_PROD || 'https://nexus.maif.io',
  USERNAME_LOCAL: process.env.NEXUS_USERNAME_LOCAL || 'admin',
  PASSWORD_LOCAL: process.env.NEXUS_PASSWORD_LOCAL || 'admin123',
  REPOSITORY: process.env.NEXUS_REPOSITORY || 'react-metrics-artefacts',
  GROUP_ID: process.env.NEXUS_GROUP_ID || 'com.maif.react-metrics',
}

export const isLocalEnvironment = () => {
  return process.env.NODE_ENV === 'local' || process.env.NEXUS_LOCAL === 'true'
}

export const ENCRYPTION_CONFIG = {
  SECRET_KEY:
    process.env.ENCRYPTION_SECRET_KEY || 'react-metrics-secret-key-2024',
  ALGORITHM: 'AES',
}

export const CURRENT_VERSION = extractVersionFromBinary(
  path.join(NEXUS_UTILS_DIR, getBaseBinaryName(process.platform, process.arch))
)
