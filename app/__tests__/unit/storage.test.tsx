import {
    uploadImage,
    uploadVideo,
    deleteImage,
    deleteVideo,
  } from '../../../firebase/storage/storage';
  import { storage } from '../../../firebase/firebase';
  import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    uploadBytes,
  } from 'firebase/storage';
  
  // Mock firebase/storage
  jest.mock('firebase/storage', () => ({
    ref: jest.fn(),
    uploadBytesResumable: jest.fn(),
    getDownloadURL: jest.fn(),
    deleteObject: jest.fn(),
    uploadBytes: jest.fn(),
  }));
  
// Mock firebase instance
jest.mock("../../../firebase/firebase", () => ({
  storage: {},
}));
  
  describe('Storage Functions', () => {
    const mockDownloadUrl = 'https://example.com/test-file';
    const mockBlob = new Blob(['test'], { type: 'text/plain' });
    const mockFileName = 'test-file.txt';
  
    let mockStorageRef: any;
    let mockImagesRef: any;
    let mockVideosRef: any;
    let mockFileRef: any;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      // Create mock refs
      mockStorageRef = { fullPath: '/' };
      mockImagesRef = { fullPath: '/images' };
      mockVideosRef = { fullPath: '/videos' };
      mockFileRef = { fullPath: '/test-file.txt' };
  
      // Setup ref mock implementation
      (ref as jest.Mock).mockImplementation((parent: any, path?: string) => {
        if (!path) return mockStorageRef;
        if (path === 'images') return mockImagesRef;
        if (path === 'videos') return mockVideosRef;
        return mockFileRef;
      });
    });
  
    describe('uploadImage', () => {
      beforeEach(() => {
        (uploadBytes as jest.Mock).mockResolvedValue({});
        (getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadUrl);
      });
  

      it('should return null when upload fails', async () => {
        const error = new Error('Upload failed');
        (uploadBytes as jest.Mock).mockRejectedValueOnce(error);
        console.error = jest.fn();
  
        const result = await uploadImage(mockBlob, mockFileName);
  
        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith(error);
      });
    });
  
    describe('uploadVideo', () => {
      beforeEach(() => {
        (uploadBytesResumable as jest.Mock).mockResolvedValue({});
        (getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadUrl);
      });
  
      it('should return null when upload fails', async () => {
        const error = new Error('Upload failed');
        (uploadBytesResumable as jest.Mock).mockRejectedValueOnce(error);
        console.error = jest.fn();
  
        const result = await uploadVideo(mockBlob, mockFileName);
  
        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith(error);
      });
    });
  
    describe('deleteImage', () => {
  
      it('should throw error when deletion fails', async () => {
        const error = new Error('Deletion failed');
        (deleteObject as jest.Mock).mockRejectedValueOnce(error);
  
        await expect(deleteImage(mockFileName)).rejects.toThrow('Deletion failed');
      });
    });
  
    describe('deleteVideo', () => {  
      it('should throw error when deletion fails', async () => {
        const error = new Error('Deletion failed');
        (deleteObject as jest.Mock).mockRejectedValueOnce(error);
  
        await expect(deleteVideo(mockFileName)).rejects.toThrow('Deletion failed');
      });
    });
  
    describe('URL getters (through public functions)', () => {
      it('should get image download URL when uploading', async () => {
        (uploadBytes as jest.Mock).mockResolvedValue({});
        (getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadUrl);
  
        const result = await uploadImage(mockBlob, mockFileName);
  
        expect(getDownloadURL).toHaveBeenCalledWith(mockFileRef);
        expect(result).toBe(mockDownloadUrl);
      });
  
      it('should get video download URL when uploading', async () => {
        (uploadBytesResumable as jest.Mock).mockResolvedValue({});
        (getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadUrl);
  
        const result = await uploadVideo(mockBlob, mockFileName);
  
        expect(getDownloadURL).toHaveBeenCalledWith(mockFileRef);
        expect(result).toBe(mockDownloadUrl);
      });
    });
  });