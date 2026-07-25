"use server";

import { auth } from "@/lib/auth/server";
import { isValidFile } from "@/lib/utils";
import { put } from "@vercel/blob";


export type UploadedFile = {
    url: string;
    size: number;
    type: string;
    filename?: string;
}


export async function uploadFile(formdata: FormData): Promise<UploadedFile>{
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      throw new Error("You must be signed in to upload a file.");
    }
    const files = formdata.getAll("files").filter(Boolean) as File[];
    const file = files[0];

    if (!file || !isValidFile(file)) {
      throw new Error("Invalid file uploaded.");
    }
    try{
        const blob = await put(file.name, file, {
            access:'public',
            addRandomSuffix: true,
        })


        if (!blob) {
            throw new Error("Failed to upload file.");
        }

        return {
            url: blob.url,
            size: file.size,
            type: file.type,
            filename: blob.pathname ?? file.name,
        };
    } 
    catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("Failed to upload file.");
    }
}