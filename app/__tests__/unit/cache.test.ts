import {
  ensureDirExists,
  cacheFile,
  getFileBlob,
  clearFiles,
} from '../../utils/cache'; // Adjust the import path as needed

// Mock dependencies
import * as FileSystem from 'expo-file-system';

jest.mock('expo-file-system', () => ({
  cacheDirectory: '/mockCacheDir/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  EncodingType: { Base64: 'base64' },
}));

// Mock global objects
(global as any).FileReader = class {
  public onload: () => void = () => {};
  public onerror: () => void = () => {};
  public result: string | null = null;

  readAsDataURL(blob: any) {
    setTimeout(() => {
      if (blob === 'error') {
        this.onerror();
      } else {
        this.result = 'data:application/octet-stream;base64,mockBase64Data';
        this.onload();
      }
    }, 0);
  }
};

(global as any).fetch = jest.fn();

describe('File System Functions', () => {
  const testDir = FileSystem.cacheDirectory + 'testDir/';
  const testFileUri = testDir + 'testFile.txt';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ensureDirExists', () => {
    it("should create the directory if it doesn't exist", async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
      await ensureDirExists(testDir);
      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(testDir, { intermediates: true });
    });

    it('should not create the directory if it exists', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      await ensureDirExists(testDir);
      expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
    });
  });

  describe('cacheFile', () => {
    it('should save a blob to the file system successfully', async () => {
      // Mock that the directory exists
      (FileSystem.getInfoAsync as jest.Mock).mockImplementation(async (path: string) => {
        if (path === testDir) return { exists: true };
        return { exists: true };
      });

      const blob = {}; // Mock blob
      await expect(cacheFile(blob as Blob, testFileUri)).resolves.toEqual(testFileUri);
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        testFileUri,
        'mockBase64Data',
        { encoding: FileSystem.EncodingType.Base64 },
      );
    });

    it('should handle FileReader error', async () => {
      const blob = 'error';
      await expect(cacheFile(blob as unknown as Blob, testFileUri)).rejects.toThrow('Failed to read blob');
    });

    it('should handle missing base64 data', async () => {
      // Adjust the FileReader mock to simulate missing base64 data
      (global as any).FileReader = class {
        public onload: () => void = () => {};
        public onerror: () => void = () => {};
        public result: string | null = 'data:application/octet-stream;base64,';
        readAsDataURL() {
          this.onload();
        }
      };
      const blob = {}; // Mock blob
      await expect(cacheFile(blob as Blob, testFileUri)).rejects.toThrow(
        'Failed to extract base64 data from file',
      );
    });

    it('should throw an error if FileReader result is null', async () => {
      // Adjust the FileReader mock to simulate a null result
      (global as any).FileReader = class {
        public onload: () => void = () => {};
        public result: string | null = null;
  
        readAsDataURL() {
          this.onload();
        }
      };
  
      const blob = {}; // Mock blob
      await expect(cacheFile(blob as Blob, testFileUri)).rejects.toThrow(
        'Failed to read file: result is null or not a string'
      );
    });
  
    it('should throw an error if FileReader result is not a string', async () => {
      // Adjust the FileReader mock to simulate a non-string result
      (global as any).FileReader = class {
        public onload: () => void = () => {};
        public result: any = 12345; // Non-string result
  
        readAsDataURL() {
          this.onload();
        }
      };
  
      const blob = {}; // Mock blob
      await expect(cacheFile(blob as Blob, testFileUri)).rejects.toThrow(
        'Failed to read file: result is null or not a string'
      );
    });
  });

  describe('getFileBlob', () => {
    it('should return a blob if the file exists', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      const mockBlob = { size: 1024 };
      (fetch as jest.Mock).mockResolvedValue({
        blob: jest.fn().mockResolvedValue(mockBlob),
      });

      const result = await getFileBlob(testFileUri);
      expect(result).toEqual(mockBlob);
      expect(fetch).toHaveBeenCalledWith(testFileUri);
    });

    it('should throw an error if the file does not exist', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
      await expect(getFileBlob(testFileUri)).rejects.toThrow(`File at ${testFileUri} not found`);
    });

    it('should handle fetch errors', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      await expect(getFileBlob(testFileUri)).rejects.toThrow(
        `Failed to get file at ${testFileUri}: Network error`,
      );
    });
  });

  describe('clearFiles', () => {
    it('should delete existing files', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      const fileUris = [testFileUri, testDir + 'anotherFile.txt'];
      await clearFiles(fileUris);
      expect(FileSystem.deleteAsync).toHaveBeenCalledTimes(fileUris.length);
      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(testFileUri);
      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(testDir + 'anotherFile.txt');
    });

    it('should not attempt to delete non-existing files', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
      const fileUris = [testFileUri, testDir + 'anotherFile.txt'];
      await clearFiles(fileUris);
      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });

    it('should handle errors during deletion', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      (FileSystem.deleteAsync as jest.Mock).mockRejectedValue(new Error('Deletion error'));
      const fileUris = [testFileUri];
      await expect(clearFiles(fileUris)).rejects.toThrow('Failed to clear files: Deletion error');
    });

    it('should not attempt deletion if fileUris array is empty', async () => {
      const fileUris: string[] = [];
      await clearFiles(fileUris);
      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });
  });
});