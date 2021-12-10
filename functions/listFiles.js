import { ListObjectsCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3Client.js"; // Helper function that creates Amazon S3 service client module.

export async function listAllFiles(){
    const bucketParams = { Bucket: process.env.BUCKET_NAME };

    try {
        const data = await s3Client.send(new ListObjectsCommand(bucketParams));
        console.log("Retrieve Success");
        return data;
    } catch (err) {
        console.log("Error", err);
    }

}
