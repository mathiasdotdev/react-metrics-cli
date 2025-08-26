import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const BINARY_ROOT_DIR = process.platform === 'win32'
    ? 'C:\\react-metrics'
    : '/usr/local/react-metrics';

const NEXUS_UTILS_DIR = path.join(os.homedir(), '.nexus-utils');

export const STORAGE_PATHS = {
  BINARY_ROOT_DIR,
  BINARY_FILENAME: getBinaryFilename(BINARY_ROOT_DIR),
  TOKEN_FILE: path.join(NEXUS_UTILS_DIR, 'nexus-token.enc'),
  CONFIG_FILE: path.join(NEXUS_UTILS_DIR, 'nexus-config.enc'),
  CACHE_DIR: path.join(os.homedir(), '.react-metrics-cache')
};

function extractVersionFromBinary(binaryPath: string): string {
  try {
    if (!fs.existsSync(binaryPath)) {
      return '1.0.0';
    }
    const filename = path.basename(binaryPath);
    // Pour les noms simplifiés comme "windows-amd64.exe", on ne peut pas détecter la version
    // depuis le nom. On va utiliser une version par défaut ou la récupérer ailleurs
    const match = filename.match(/react-metrics-([\d.]+)-/) || filename.match(/([\d.]+)/);
    return match ? match[1] : '1.0.0';
  } catch (error) {
    console.warn('Impossible de détecter la version du binaire:', error);
    return '1.0.0';
  }
}

function getBinaryFilename(binaryRootDir: string): string {
  const platform = process.platform;
  const arch = process.arch;
  const binaryPath = path.join(
      binaryRootDir,
      getBaseBinaryName(platform, arch)
  );
  const currentVersion = extractVersionFromBinary(binaryPath);
  return getVersionedBinaryName(platform, arch, currentVersion);
}

function getBaseBinaryName(platform: string, arch: string): string {
  switch (platform) {
    case 'win32':
      return arch === 'x64' ? 'windows-amd64.exe' : 'windows-arm64.exe';
    case 'darwin':
      return arch === 'x64' ? 'darwin-amd64.bin' : 'darwin-arm64.bin';
    case 'linux':
      return arch === 'x64' ? 'linux-amd64.bin' : 'linux-arm64.bin';
    default:
      throw new Error(`Plateforme non supportée: ${platform}-${arch}`);
  }
}

function getVersionedBinaryName(platform: string, arch: string, version: string): string {
  switch (platform) {
    case 'win32':
      return arch === 'x64' ? 'windows-amd64.exe' : 'windows-arm64.exe';
    case 'darwin':
      return arch === 'x64' ? 'darwin-amd64.bin' : 'darwin-arm64.bin';
    case 'linux':
      return arch === 'x64' ? 'linux-amd64.bin' : 'linux-arm64.bin';
    default:
      throw new Error(`Plateforme non supportée: ${platform}-${arch}`);
  }
}

export const BINARY_PATH = path.join(STORAGE_PATHS.BINARY_ROOT_DIR, STORAGE_PATHS.BINARY_FILENAME);

export const CURRENT_VERSION = extractVersionFromBinary(BINARY_PATH);

export const ENCRYPTION_CONFIG = {
  SECRET_KEY: 'react-metrics-secret-key-2024',
  ALGORITHM: 'AES'
};

export const DOWNLOAD_URLS = {
  getDownloadUrl: (nexusConfig: NexusConfig, version: string): string => {
    const filename = getVersionedBinaryName(process.platform, process.arch, version);
    // Structure: group/react-metrics/version/filename
    return `${nexusConfig.repositoryUrl}/${nexusConfig.group}/react-metrics/${version}/${filename}`;
  }
};

export const TIMEOUTS = {
  DOWNLOAD: 300000,
  EXECUTION: 600000
};

// Types et helpers pour la config Nexus
export interface NexusConfig {
  repositoryUrl: string;
  repository: string;
  group: string;
  token: string;
}