import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3Client.js";
import sharp from "sharp";


async function generateThumbnail(filePath) {
    sharp.cache(false);
    return await sharp(filePath)
        .resize(150,150,{
            fit: sharp.fit.outside
        })
        .toFormat('jpeg')
        .sharpen()
        .toBuffer()
}

export async function uploadThumbnailFile(filePath,hex){
    const buffer = await generateThumbnail(filePath)

    const uploadParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: 'thumbnails/thumbnail-'+hex+'.jpeg',
        Body: buffer
    };

    try {
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log("Thumbnail Upload Success");
        return hex;
    } catch (err) {
        console.log("Error", err);
    }

}
