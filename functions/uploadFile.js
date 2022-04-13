import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3Client.js";

import path from "path";
import fs from "fs";
import crypto from "crypto";

export async function uploadFile(file){
    const fileStream = fs.readFileSync(file);

    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileStream);

    const hex = hashSum.digest('hex');

    let fileExtension = path.basename(file).split('.')[1];
    const uploadParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: 'files/'+hex+'.'+fileExtension,
        Body: fileStream,
    };

    try {
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log("Upload Success");
        return hex;
    } catch (err) {
        console.log("Error", err);
    }

}
