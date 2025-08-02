const aws = require('aws-sdk');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

exports.handler = async (event, context) => {
    console.log(event)
    const key = 'files/'+ event.pathParameters.imgId
    console.log('key' + key)
    const params = {
        Bucket: 'my-awesome-very-secret-upload-bucket',
        Key: key
    };
    try {
        const s3_response = await s3.getObject(params).promise();
        const image = s3_response.Body;
        const response = {
            'headers': { "Content-Type": "image/jpg" },
            'statusCode': 200,
            'body': Buffer.from(image, 'binary').toString('base64'),
            'isBase64Encoded': true
        }
        console.log('image loaded successfully !')
        return response;
    } catch (err) {
        console.log(err);
        const message = `Error getting object Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
};
