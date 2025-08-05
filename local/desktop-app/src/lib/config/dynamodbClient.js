// Create the DynamoDB service client module using ES6 syntax.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// Set the AWS Region.
export const REGION = "us-east-1"; // Same as in the original config

// Create an Amazon DynamoDB service client object.
export const ddbClient = new DynamoDBClient({ region: REGION });