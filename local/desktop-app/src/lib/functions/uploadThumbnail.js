import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3Client.js";
import { readFile } from '@tauri-apps/plugin-fs';

// Environment variables
const BUCKET_NAME = "horny-grail-bucket"; // Replace with your actual bucket name

// Note: Since we can't use Sharp in the browser environment,
// we'll need to handle thumbnail generation differently.
// This is a simplified version that just uploads the original file as a thumbnail.
// In a real implementation, you might want to:
// 1. Use a Tauri command to generate thumbnails in Rust
// 2. Use a serverless function to generate thumbnails
// 3. Use a browser-compatible image processing library

export async function uploadThumbnail(filePath, hex) {
    try {
        // Read the file as binary data
        const fileData = await readFile(filePath);
        
        // Prepare upload parameters for S3
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: 'thumbnails/thumbnail-' + hex + '.jpeg',
            Body: fileData,
            ContentType: 'image/jpeg'
        };
        
        // Upload to S3
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log("Thumbnail Upload Success");
        
        return hex;
    } catch (err) {
        console.error("Error uploading thumbnail:", err);
        throw err;
    }
}