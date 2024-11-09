import * as FileSystem from 'expo-file-system';

// Constants
export const picDir = FileSystem.cacheDirectory + 'pictures/';
export const picFileUri = (picId: string) => picDir + `picture_${picId}.jpg`;

/**
 * Ensures the pictures directory exists
 */
export async function ensureDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(picDir);
  if (!dirInfo.exists) {
    console.log("Pictures' directory doesn't exist, creating...");
    await FileSystem.makeDirectoryAsync(picDir, { intermediates: true });
  }
}

/**
 * Saves a blob to the pictures directory with the specified ID
 * @param {Blob} blob - The blob to save
 * @param {string} picId - The picture ID to use in the filename
 * @returns {Promise<string>} The URI of the saved file
 */
export const cacheImage = async (blob: Blob, picId: string): Promise<string> => {
  await ensureDirExists();
  
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    
    fr.onerror = () => {
      reject(new Error('Failed to read blob'));
    };
    
    fr.onload = async () => {
      try {
        if (fr.result == null || typeof fr.result !== 'string') {
          throw new Error('Failed to read file: result is null or not a string');
        }

        // Extract base64 data from data URL
        const base64String = fr.result.split(',')[1];
        
        if (!base64String) {
          throw new Error('Failed to extract base64 data from file');
        }
        
        // Get file URI using existing naming convention
        const fileUri = picFileUri(picId);
        
        // Write file
        await FileSystem.writeAsStringAsync(
          fileUri,
          base64String,
          { encoding: FileSystem.EncodingType.Base64 }
        );
        
        resolve(picId);
      } catch (error) {
        reject(error);
      }
    };
    
    // Start reading the blob as data URL
    fr.readAsDataURL(blob);
  });
};

/**
 * Retrieves a picture as a Blob from the pictures directory
 * @param {string} picId - The ID of the picture to retrieve
 * @returns {Promise<Blob>} The picture as a Blob
 */
export const getPictureBlob = async (picId: string): Promise<Blob> => {
  try {
    const fileUri = picFileUri(picId);
    
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error(`Picture ${picId} not found`);
    }

    // Read the base64 data
    const fetchResponse = await fetch(fileUri);
    return await fetchResponse.blob();
  } catch (error) {
    throw new Error(`Failed to get picture ${picId}: ${(error as Error).message}`);
  }
};


/**
 * Deletes multiple pictures from the pictures directory
 * @param {string[]} picIds - Array of picture IDs to delete
 * @returns {Promise<void>}
 */
export const clearPictures = async (picIds: string[]): Promise<void> => {
  try {
    await Promise.all(
      picIds.map(async (picId) => {
        const fileUri = picFileUri(picId);
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(fileUri);
        }
      })
    );
  } catch (error) {
    throw new Error(`Failed to clear pictures: ${(error as Error).message}`);
  }
};