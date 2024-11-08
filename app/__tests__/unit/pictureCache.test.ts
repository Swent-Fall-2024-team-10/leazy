/**
 * @jest-environment jsdom
 */

import * as FileSystem from 'expo-file-system';
import { 
picDir, 
picFileUri, 
ensureDirExists, 
base64ToBlob, 
cacheImage, 
getPictureBlob, 
clearPictures 
} from '../../utils/pictureCache';

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
cacheDirectory: 'file://cache/',
EncodingType: {
    Base64: 'base64'
},
getInfoAsync: jest.fn(),
makeDirectoryAsync: jest.fn(),
writeAsStringAsync: jest.fn(),
readAsStringAsync: jest.fn(),
deleteAsync: jest.fn(),
}));


describe('File System Utilities', () => {
beforeEach(() => {
    jest.clearAllMocks();
});

describe('Constants', () => {
    it('should have correct picDir path', () => {
    expect(picDir).toBe('file://cache/pictures/');
    });

    it('should generate correct file URI for picture ID', () => {
    expect(picFileUri('123')).toBe('file://cache/pictures/picture_123.jpg');
    });
});

describe('ensureDirExists', () => {
    it('should create directory if it does not exist', async () => {
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: false });
    
    await ensureDirExists();
    
    expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
        picDir,
        { intermediates: true }
    );
    });

    it('should not create directory if it already exists', async () => {
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true });
    
    await ensureDirExists();
    
    expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
    });
});

describe('base64ToBlob', () => {
    it('should convert base64 to Blob with default content type', () => {
    const base64Data = 'SGVsbG8gV29ybGQ='; // "Hello World" in base64
    const blob = base64ToBlob(base64Data);
    
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/jpeg');
    });

    it('should convert base64 to Blob with custom content type', () => {
    const base64Data = 'SGVsbG8gV29ybGQ=';
    const blob = base64ToBlob(base64Data, 'image/png');
    
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
    });
});

describe('cacheImage', () => {
    it('should save blob to file system', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    const picId = '123';
    
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true });
    (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await cacheImage(mockBlob, picId);
    
    expect(result).toBe(picId);
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        picFileUri(picId),
        expect.any(String),
        { encoding: FileSystem.EncodingType.Base64 }
    );
    });

    it('should handle errors during blob reading', async () => {
    const invalidBlob = {} as Blob;
    
    await expect(cacheImage(invalidBlob, '123')).rejects.toThrow();
    });
});

describe('getPictureBlob', () => {
    it('should retrieve picture as blob', async () => {
    const picId = '123';
    const mockBase64 = 'SGVsbG8gV29ybGQ=';
    
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(mockBase64);

    const blob = await getPictureBlob(picId);
    
    expect(blob).toBeInstanceOf(Blob);
    expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith(
        picFileUri(picId),
        { encoding: FileSystem.EncodingType.Base64 }
    );
    });

    it('should throw error if picture does not exist', async () => {
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: false });
    
    await expect(getPictureBlob('nonexistent')).rejects.toThrow('Picture nonexistent not found');
    });
});

describe('clearPictures', () => {
    it('should delete multiple pictures', async () => {
    const picIds = ['123', '456'];
    
    (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ exists: true })
        .mockResolvedValueOnce({ exists: true });
    
    await clearPictures(picIds);
    
    expect(FileSystem.deleteAsync).toHaveBeenCalledTimes(2);
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(picFileUri('123'));
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(picFileUri('456'));
    });

    it('should skip non-existent pictures', async () => {
    const picIds = ['123', '456'];
    
    (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ exists: true })
        .mockResolvedValueOnce({ exists: false });
    
    await clearPictures(picIds);
    
    expect(FileSystem.deleteAsync).toHaveBeenCalledTimes(1);
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(picFileUri('123'));
    });

    it('should handle errors during deletion', async () => {
    const picIds = ['123'];
    
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true });
    (FileSystem.deleteAsync as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));
    
    await expect(clearPictures(picIds)).rejects.toThrow('Failed to clear pictures');
    });
});
});