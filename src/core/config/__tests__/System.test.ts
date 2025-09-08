import * as fs from 'fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock modules before imports
vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('os', () => ({
  homedir: vi.fn(() => '/mock/home'),
}));

vi.mock('dotenv', () => ({
  config: vi.fn(),
}));

describe('System Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalPlatform: string;
  let originalArch: string;

  beforeEach(() => {
    originalEnv = { ...process.env };
    originalPlatform = process.platform;
    originalArch = process.arch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    Object.defineProperty(process, 'arch', { value: originalArch });
    vi.restoreAllMocks();
  });

  describe('STORAGE_PATHS', () => {
    it('should set correct binary root directory for Windows', async () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true,
      });

      vi.resetModules();
      const { STORAGE_PATHS } = await import('../System');

      expect(STORAGE_PATHS.BINARY_ROOT_DIR).toBe('\\mock\\home\\.nexus-utils');
    });

    it('should set correct binary root directory for Unix-like systems', async () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true,
      });

      vi.resetModules();
      const { STORAGE_PATHS } = await import('../System');

      // On Windows, les paths utilisent des backslashes même si on mock os.homedir
      expect(STORAGE_PATHS.BINARY_ROOT_DIR).toMatch(/[\/\\]mock[\/\\]home[\/\\]\.nexus-utils/);
    });

    it('should set correct paths for token and config files', async () => {
      vi.resetModules();
      const { STORAGE_PATHS } = await import('../System');

      expect(STORAGE_PATHS.CREDENTIALS_FILE).toContain('.credentials');
      expect(STORAGE_PATHS.CONFIG_FILE).toContain('react-metrics.json');
      expect(STORAGE_PATHS.CACHE_DIR).toContain('cache');
    });
  });

  describe('Binary filename generation', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
    });

    it('should generate correct filename for Windows x64', async () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      Object.defineProperty(process, 'arch', { value: 'x64' });

      vi.resetModules();
      const { STORAGE_PATHS } = await import('../System');

      expect(STORAGE_PATHS.BINARY_FILENAME).toBe('windows-amd64.exe');
    });

    it('should throw error for unsupported Windows ARM64', async () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      Object.defineProperty(process, 'arch', { value: 'arm64' });

      vi.resetModules();

      await expect(async () => {
        await import('../System');
      }).rejects.toThrow('Architecture Windows non supportée: arm64');
    });

    it('should generate correct filename for macOS x64', async () => {
      Object.defineProperty(process, 'platform', { value: 'darwin' });
      Object.defineProperty(process, 'arch', { value: 'x64' });

      vi.resetModules();
      const { STORAGE_PATHS } = await import('../System');

      expect(STORAGE_PATHS.BINARY_FILENAME).toBe('darwin-amd64.bin');
    });

    it('should throw error for unsupported Linux ARM64', async () => {
      Object.defineProperty(process, 'platform', { value: 'linux' });
      Object.defineProperty(process, 'arch', { value: 'arm64' });

      vi.resetModules();

      await expect(async () => {
        await import('../System');
      }).rejects.toThrow('Architecture Linux non supportée: arm64');
    });

    it('should throw error for unsupported platform', async () => {
      Object.defineProperty(process, 'platform', { value: 'freebsd' });
      Object.defineProperty(process, 'arch', { value: 'x64' });

      vi.resetModules();
      await expect(async () => {
        await import('../System');
      }).rejects.toThrow('Plateforme non supportée: freebsd-x64');
    });
  });

  describe('Environment variables configuration', () => {
    it('should use environment variables for encryption config', async () => {
      process.env.ENCRYPTION_SECRET_KEY = 'test-secret-key';
      vi.resetModules();

      const { ENCRYPTION_CONFIG } = await import('../System');

      expect(ENCRYPTION_CONFIG).toBeDefined();
      expect(ENCRYPTION_CONFIG.SECRET_KEY).toBe('test-secret-key');
    });

    it('should use default encryption key if not provided', async () => {
      delete process.env.ENCRYPTION_SECRET_KEY;
      vi.resetModules();

      const { ENCRYPTION_CONFIG } = await import('../System');

      expect(ENCRYPTION_CONFIG).toBeDefined();
      expect(ENCRYPTION_CONFIG.SECRET_KEY).toBe('react-metrics-secret-key-2024');
    });

    it('should use environment variables for timeouts', async () => {
      process.env.DOWNLOAD_TIMEOUT = '500000';
      process.env.EXECUTION_TIMEOUT = '800000';
      vi.resetModules();

      const { TIMEOUTS } = await import('../System');

      expect(TIMEOUTS).toBeDefined();
      expect(TIMEOUTS.DOWNLOAD).toBe(500000);
      expect(TIMEOUTS.EXECUTION).toBe(800000);
    });

    it('should use default timeouts if not provided', async () => {
      delete process.env.DOWNLOAD_TIMEOUT;
      delete process.env.EXECUTION_TIMEOUT;
      vi.resetModules();

      const { TIMEOUTS } = await import('../System');

      expect(TIMEOUTS).toBeDefined();
      expect(TIMEOUTS.DOWNLOAD).toBe(300000);
      expect(TIMEOUTS.EXECUTION).toBe(600000);
    });

    it('should configure Nexus settings from environment', async () => {
      process.env.NEXUS_URL_LOCAL = 'http://custom-local:9090';
      process.env.NEXUS_URL_PROD = 'https://custom-nexus.com';
      process.env.NEXUS_REPOSITORY = 'custom-repo';
      process.env.NEXUS_GROUP_ID = 'custom.group';
      vi.resetModules();

      const { NEXUS_CONFIG } = await import('../System');

      expect(NEXUS_CONFIG).toBeDefined();
      expect(NEXUS_CONFIG.URL_LOCAL).toBe('http://custom-local:9090');
      expect(NEXUS_CONFIG.URL_PROD).toBe('https://custom-nexus.com');
      expect(NEXUS_CONFIG.REPOSITORY).toBe('custom-repo');
      expect(NEXUS_CONFIG.GROUP_ID).toBe('custom.group');
    });
  });

  describe('isLocalEnvironment', () => {
    it('should return true when NODE_ENV is local', async () => {
      process.env.NODE_ENV = 'local';
      vi.resetModules();

      const { isLocalEnvironment } = await import('../System');

      expect(isLocalEnvironment()).toBe(true);
    });

    it('should return true when NEXUS_LOCAL is true', async () => {
      process.env.NODE_ENV = 'prod';
      process.env.NEXUS_LOCAL = 'true';
      vi.resetModules();

      const { isLocalEnvironment } = await import('../System');

      expect(isLocalEnvironment()).toBe(true);
    });

    it('should return false when neither condition is met', async () => {
      process.env.NODE_ENV = 'prod';
      delete process.env.NEXUS_LOCAL;
      vi.resetModules();

      const { isLocalEnvironment } = await import('../System');

      expect(isLocalEnvironment()).toBe(false);
    });
  });

  describe('Version extraction', () => {
    it('should extract version from binary filename', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.resetModules();

      const { CURRENT_VERSION } = await import('../System');

      // Quand le fichier n'existe pas, la version par défaut est retournée
      expect(typeof CURRENT_VERSION).toBe('string');
      expect(CURRENT_VERSION).toBe('1.0.0');
    });
  });

  describe('Download URLs', () => {
    it('should generate correct download URL', async () => {
      // Mock current platform for consistent URL generation
      Object.defineProperty(process, 'platform', { value: 'win32' });
      Object.defineProperty(process, 'arch', { value: 'x64' });
      vi.resetModules();

      const { DOWNLOAD_URLS } = await import('../System');

      const mockConfig = {
        repositoryUrl: 'https://nexus.example.com/repository',
        repository: 'test-repo',
        group: 'com.example',
        token: 'test-token',
      };

      const url = DOWNLOAD_URLS.getDownloadUrl(mockConfig, '1.2.3');

      expect(url).toContain('https://nexus.example.com/repository');
      expect(url).toContain('com.example');
      expect(url).toContain('react-metrics');
      expect(url).toContain('1.2.3');
    });
  });
});
