import { storage } from "../firebase";

import { 
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    uploadBytes,
} from "firebase/storage";

const storageRef = ref(storage);
const imgRef = ref(storageRef, "images");
const vidRef = ref(storageRef, "videos");

export async function uploadImage(blob: Blob | Uint8Array | ArrayBuffer, fileName: string): Promise<string | null>{
    try{
        const imgFileRef = ref(imgRef, fileName);
        await uploadBytes(imgFileRef, blob);
        return getImageUrl(fileName);
    } catch (error) {
        console.error(error);
        return null 
    }
}

export async function uploadVideo(file: Blob | Uint8Array | ArrayBuffer, fileName: string): Promise<string | null>{
    try{
        const vidFileRef = ref(vidRef, fileName);
        await uploadBytesResumable(vidFileRef, file);
        return getVideoUrl(fileName);
    } catch (error) {
        console.error(error);
        return null
    }
}

async function getImageUrl(fileName: string): Promise<string>{
    const imgFileRef = ref(imgRef, fileName);
    return await getDownloadURL(imgFileRef);
}

async function getVideoUrl(fileName: string): Promise<string>{
    const vidFileRef = ref(vidRef, fileName);
    return await getDownloadURL(vidFileRef);
}

export async function deleteImage(fileURL: string){
    const imgFileRef = ref(imgRef, fileURL);
    await deleteObject(imgFileRef);
}

export async function deleteVideo(fileURL: string){
    const vidFileRef = ref(vidRef, fileURL);
    await deleteObject(vidFileRef);
}
