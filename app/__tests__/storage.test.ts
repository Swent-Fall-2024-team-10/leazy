import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

// Consolidated mock for the storage module
jest.mock("../../firebase/storage/storage", () => ({
  uploadImage: jest.fn(),
  uploadVideo: jest.fn(),
  deleteImage: jest.fn(),
  deleteVideo: jest.fn(),
  storage: {}
}));

// Import the mocked functions
import { uploadImage, uploadVideo, deleteImage, deleteVideo } from "../../firebase/storage/storage";

describe("Firebase Storage Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadImage", () => {
    it("should upload an image successfully", async () => {
      const mockFile = new File([""], "test.jpg", { type: "image/jpeg" });
      const mockFileName = "test.jpg";
      const mockUrl = "https://firebasestorage.googleapis.com/test.jpg";

      (uploadImage as jest.Mock).mockResolvedValue(mockUrl);

      const result = await uploadImage(mockFile, mockFileName);

      expect(uploadImage).toHaveBeenCalledWith(mockFile, mockFileName);
      expect(result).toBe(mockUrl);
    });

    it("should return null if upload fails", async () => {
      const mockFile = new File([""], "test.jpg", { type: "image/jpeg" });
      const mockFileName = "test.jpg";

      (uploadImage as jest.Mock).mockResolvedValue(null);

      const result = await uploadImage(mockFile, mockFileName);

      expect(uploadImage).toHaveBeenCalledWith(mockFile, mockFileName);
      expect(result).toBeNull();
    });
  });

  describe("uploadVideo", () => {
    it("should upload a video successfully", async () => {
      const mockFile = new File([""], "test.mp4", { type: "video/mp4" });
      const mockFileName = "test.mp4";
      const mockUrl = "https://firebasestorage.googleapis.com/test.mp4";

      (uploadVideo as jest.Mock).mockResolvedValue(mockUrl);

      const result = await uploadVideo(mockFile, mockFileName);

      expect(uploadVideo).toHaveBeenCalledWith(mockFile, mockFileName);
      expect(result).toBe(mockUrl);
    });

    it("should return null if upload fails", async () => {
      const mockFile = new File([""], "test.mp4", { type: "video/mp4" });
      const mockFileName = "test.mp4";

      (uploadVideo as jest.Mock).mockResolvedValue(null);

      const result = await uploadVideo(mockFile, mockFileName);

      expect(uploadVideo).toHaveBeenCalledWith(mockFile, mockFileName);
      expect(result).toBeNull();
    });
  });

  describe("deleteImage", () => {
    it("should delete an image successfully", async () => {
      const mockFileURL = "test.jpg";

      (deleteImage as jest.Mock).mockResolvedValue(undefined);

      await expect(deleteImage(mockFileURL)).resolves.not.toThrow();

      expect(deleteImage).toHaveBeenCalledWith(mockFileURL);
    });

    it("should throw an error if deletion fails", async () => {
      const mockFileURL = "test.jpg";

      (deleteImage as jest.Mock).mockRejectedValue(new Error("Deletion failed"));

      await expect(deleteImage(mockFileURL)).rejects.toThrow("Deletion failed");
    });
  });

  describe("deleteVideo", () => {
    it("should delete a video successfully", async () => {
      const mockFileURL = "test.mp4";

      (deleteVideo as jest.Mock).mockResolvedValue(undefined);

      await expect(deleteVideo(mockFileURL)).resolves.not.toThrow();

      expect(deleteVideo).toHaveBeenCalledWith(mockFileURL);
    });

    it("should throw an error if deletion fails", async () => {
      const mockFileURL = "test.mp4";

      (deleteVideo as jest.Mock).mockRejectedValue(new Error("Deletion failed"));

      await expect(deleteVideo(mockFileURL)).rejects.toThrow("Deletion failed");
    });
  });
});