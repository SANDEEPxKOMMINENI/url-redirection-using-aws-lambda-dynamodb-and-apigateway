const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    // Get the short ID from the path parameter
    const shortId = event.pathParameters.shortId;

    // Look up the original URL in DynamoDB
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: 'url-mappings',
        Key: {
          short_id: shortId
        }
      })
    );

    // If no URL mapping found, return 404
    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'URL not found' }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }

    // Return a redirect response
    return {
      statusCode: 301,
      headers: {
        Location: result.Item.long_url,
        'Cache-Control': 'no-cache'
      }
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};