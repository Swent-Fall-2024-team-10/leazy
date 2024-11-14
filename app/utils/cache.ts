import * as FileSystem from 'expo-file-system';

// Here are defined some additional functions that handle each type of file
export const picDir = FileSystem.cacheDirectory + 'pictures/';
export const picFileUri = (picId: string) => picDir + `picture_${picId}.jpg`;
// We can add more depending on the type of files we want to handle (e.g. PDFs, videos, etc.)

/**
 * Ensures the specified directory exists
 * @param {string} dir - The directory path to ensure existence
 */
export async function ensureDirExists(dir: string) {
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    console.log(`Directory ${dir} doesn't exist, creating...`);
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

/**
 * Saves a blob to the specified file URI
 * @param {Blob} blob - The blob to save
 * @param {string} fileUri - The file URI where the blob should be saved
 * @returns {Promise<string>} The URI of the saved file
 */
export const cacheFile = async (blob: Blob, fileUri: string): Promise<string> => {
  // Ensure the directory exists
  const directory = fileUri.substring(0, fileUri.lastIndexOf('/') + 1);
  await ensureDirExists(directory);

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

        // Write file
        await FileSystem.writeAsStringAsync(
          fileUri,
          base64String,
          { encoding: FileSystem.EncodingType.Base64 }
        );

        resolve(fileUri);
      } catch (error) {
        reject(error);
      }
    };

    // Start reading the blob as data URL
    fr.readAsDataURL(blob);
  });
};

/**
 * Retrieves a file as a Blob from the specified file URI
 * @param {string} fileUri - The URI of the file to retrieve
 * @returns {Promise<Blob>} The file as a Blob
 */
export const getFileBlob = async (fileUri: string): Promise<Blob> => {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error(`File at ${fileUri} not found`);
    }

    // Read the file
    const fetchResponse = await fetch(fileUri);
    return await fetchResponse.blob();
  } catch (error) {
    throw new Error(`Failed to get file at ${fileUri}: ${(error as Error).message}`);
  }
};

/**
 * Deletes multiple files from the specified URIs
 * @param {string[]} fileUris - Array of file URIs to delete
 * @returns {Promise<void>}
 */
export const clearFiles = async (fileUris: string[]): Promise<void> => {
  // Do nothing if fileUris is empty
  if (fileUris.length === 0) {
    return;
  }

  try {
    await Promise.all(
      fileUris.map(async (fileUri) => {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(fileUri);
        }
      })
    );
  } catch (error) {
    throw new Error(`Failed to clear files: ${(error as Error).message}`);
  }
};