// fileSystem.test.ts

import {
    ensureDirExists,
    cacheImage,
    getPictureBlob,
    clearPictures,
    picDir,
    picFileUri,
  } from '../../utils/pictureCache';
  
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
          this.result = 'data:image/jpeg;base64,mockBase64Data';
          this.onload();
        }
      }, 0);
    }
  };
  
  (global as any).fetch = jest.fn();
  
  describe('File System Functions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    describe('ensureDirExists', () => {
      it("should create the directory if it doesn't exist", async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
        await ensureDirExists();
        expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(picDir, { intermediates: true });
      });
  
      it('should not create the directory if it exists', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
        await ensureDirExists();
        expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
      });
    });
  
    describe('cacheImage', () => {
      it('should save a blob to the file system successfully', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
        const blob = {}; // Mock blob
        const picId = '123';
        await expect(cacheImage(blob as Blob, picId)).resolves.toEqual(picId);
        expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
          picFileUri(picId),
          'mockBase64Data',
          { encoding: FileSystem.EncodingType.Base64 },
        );
      });
  
      it('should handle FileReader error', async () => {
        const blob = 'error';
        const picId = '123';
        await expect(cacheImage(blob as unknown as Blob, picId)).rejects.toThrow('Failed to read blob');
      });
  
      it('should handle missing base64 data', async () => {
        (global as any).FileReader = class {
          public onload: () => void = () => {};
          public result: string | null = 'data:image/jpeg;base64,';
          readAsDataURL() {
            this.onload();
          }
        };
        const blob = {}; // Mock blob
        const picId = '123';
        await expect(cacheImage(blob as Blob, picId)).rejects.toThrow(
          'Failed to extract base64 data from file',
        );
      });
    });
  
    describe('getPictureBlob', () => {
      it('should return a blob if the file exists', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
        const mockBlob = { size: 1024 };
        (fetch as jest.Mock).mockResolvedValue({
          blob: jest.fn().mockResolvedValue(mockBlob),
        });
  
        const picId = '123';
        const result = await getPictureBlob(picId);
        expect(result).toEqual(mockBlob);
        expect(fetch).toHaveBeenCalledWith(picFileUri(picId));
      });
  
      it('should throw an error if the file does not exist', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
        const picId = '123';
        await expect(getPictureBlob(picId)).rejects.toThrow(`Picture ${picId} not found`);
      });
  
      it('should handle fetch errors', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
        (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
        const picId = '123';
        await expect(getPictureBlob(picId)).rejects.toThrow('Failed to get picture 123: Network error');
      });
    });
  
    describe('clearPictures', () => {
      it('should delete existing pictures', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
        const picIds = ['123', '456'];
        await clearPictures(picIds);
        expect(FileSystem.deleteAsync).toHaveBeenCalledTimes(picIds.length);
      });
  
      it('should not attempt to delete non-existing pictures', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
        const picIds = ['123', '456'];
        await clearPictures(picIds);
        expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
      });
  
      it('should handle errors during deletion', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
        (FileSystem.deleteAsync as jest.Mock).mockRejectedValue(new Error('Deletion error'));
        const picIds = ['123'];
        await expect(clearPictures(picIds)).rejects.toThrow('Failed to clear pictures: Deletion error');
      });
    });
  });
  