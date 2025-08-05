import { PutObjectCommand } from "@aws-sdk/client-s3";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { s3Client } from "../config/s3Client.js";
import { ddbClient } from "../config/dynamodbClient.js";
import { v4 as uuid4 } from 'uuid';
import { readFile } from '@tauri-apps/plugin-fs';
import CryptoJS from 'crypto-js';

// Environment variables
const BUCKET_NAME = "horny-grail-bucket"; // Replace with your actual bucket name
const DYNAMO_TABLE = "horny-grail-table"; // Replace with your actual table name

export async function uploadFile(filePath) {
    // Read the file as binary data

    console.log(filePath);

    const fileData = await readFile(filePath);
    
    // Convert the binary data to a format that can be hashed
    const wordArray = CryptoJS.lib.WordArray.create(fileData);
    
    // Create SHA-256 hash
    const hash = CryptoJS.SHA256(wordArray);
    const hex = hash.toString(CryptoJS.enc.Hex);
    
    // Get file extension
    const fileExtension = filePath.split('.').pop();
    
    // Prepare upload parameters for S3
    const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: 'files/' + hex + '.' + fileExtension,
        Body: fileData,
    };
    
    // Prepare parameters for DynamoDB
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
            date: {
                S: new Date().toString()
            }
        },
        ReturnConsumedCapacity: "TOTAL",
        TableName: DYNAMO_TABLE
    };

    const key = import.meta.env.AWS_SECRET_ACCESS_KEY;
    console.log(key)
    try {
        // Upload to S3
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log("Upload Success");
        
        // Log in DynamoDB
        const command = new PutItemCommand(logInDBParams);
        await ddbClient.send(command);
        
        return hex;
    } catch (err) {
        console.error("Error", err);
        throw err;
    }
}