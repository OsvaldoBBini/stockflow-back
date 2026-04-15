import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { randomUUID } from 'node:crypto';


async function handler(event: APIGatewayProxyEvent) {
  
  const client = new DynamoDBClient({ region: 'us-east-1' });
  const documentClient = DynamoDBDocumentClient.from(client);

  const userId = event.requestContext.authorizer?.jwt.claims.sub;
  const customerId = randomUUID();

  const command = new PutCommand({
    TableName: 'FormsBuilderTable',
    Item: {
      PK: `USER#${userId}`,
      SK: `CUSTOMER#${customerId}`,
      name: 'John Doe',
    }
  });

  await documentClient.send(command);
  return {
    statusCode: 201,
    body: JSON.stringify(
      { 
        message: 'Customer created successfully', 
        customerId 
      }
    ),
  };
}

const dbMock = mockClient(DynamoDBDocumentClient);

describe('createCustomer', () => {

  beforeEach(() => {
    dbMock.reset();
  });

  it('should create a new customer successfully', async () => {

    const mockUserId = '12345-abcde';

    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId
            }
          }
        }
      }
    } as unknown as APIGatewayProxyEvent;

    dbMock.on(PutCommand).resolves({
      $metadata: { httpStatusCode: 200 }
    });

    const response = await handler(event);

    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(responseBody.message).toBe('Customer created successfully');
    expect(responseBody.customerId).toBeDefined();
  });

});