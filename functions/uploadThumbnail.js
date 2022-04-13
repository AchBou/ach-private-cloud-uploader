import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3Client.js";


export async function uploadThumbnailFile(buffer,hex){
    const uploadParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: 'thumbnails/thumbnail-'+hex+'.jpeg',
        Body: buffer,
    };

    try {
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log("Thumbnail Upload Success");
        return hex;
    } catch (err) {
        console.log("Error", err);
    }

}
