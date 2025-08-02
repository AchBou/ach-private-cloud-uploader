const aws = require('aws-sdk');
const lambda = new aws.Lambda();


const ddb = new aws.DynamoDB({apiVersion: '2012-08-10'});

const { v4: uuid4 } = require('uuid');

const scanTable = async (params) => {
    try {
        console.log(params.ExclusiveStartKey['id']);
        const data = await ddb.scan(params).promise();
        return data.Items;
    } catch (err) {
        console.log("Error", err);
    }
};

const invokeSecondLambda = async (key) => {
    let payload = {
        pathParameters: {
            imgId: key
        }
    }
    const params = {
        FunctionName: 'get-full-image',
        InvocationType: 'RequestResponse', // Use 'Event' for asynchronous invocation
        Payload: JSON.stringify(payload) // Optional payload to pass to the second Lambda
    };

    try {
        const response = await lambda.invoke(params).promise();
        const responseBody = JSON.parse(response.Payload);
        console.log(responseBody)
        return responseBody;
    } catch (error) {
        console.error('Error invoking second Lambda:', error);
        throw new Error('An error occurred while invoking the second Lambda');
    }
};

exports.handler = async (event) => {
    try{
        const params = {
            TableName: "horny-grail-name-lookup",
            Limit:1,
            ExclusiveStartKey:{
                'id': {
                    S: uuid4()
                }
            },
            ReturnConsumedCapacity:'TOTAL'
        };
        let items = await scanTable(params);
        while(items[0]===undefined){
            params.ExclusiveStartKey.id.S = uuid4()
            items = await scanTable(params);
        }
        const key = items[0].hex['S'] + '.' + items[0].ext['S'];
        console.log("random key is : ", key);

        /// OPTION 2
        return {
            'statusCode': 200,
            'body': 'https://dqvs0hmo3wpp7.cloudfront.net/files/' + key
        };
    }catch (e) {
        console.log(e);
        const message = `Error getting random string.`;
        console.log(message);
        throw new Error(message);
    }
};
