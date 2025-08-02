import { PutObjectCommand } from "@aws-sdk/client-s3";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { s3Client } from "../config/s3Client.js";
import { ddbClient } from "../config/dynamodbClient.js";
import { v4 as uuid4 } from 'uuid';

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
    const logInDBParams = {
        Item: {
            id: {
                S: uuid4()
            },
            hex: {
                S: hex
            },
            ext: {
                S: fileExtension
            },
            date:{
                S: new Date()
            }
        },
        ReturnConsumedCapacity: "TOTAL",
        TableName: process.env.DYNAMO_TABLE
    };

    try {
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log("Upload Success");
        const command = new PutItemCommand(logInDBParams);
        await ddbClient.send(command);
        return hex;
    } catch (err) {
        console.log("Error", err);
    }

}
